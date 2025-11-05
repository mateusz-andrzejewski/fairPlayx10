# API Endpoint Implementation Plan: GET /api/users

## 1. Przegląd punktu końcowego
- Cel: udostępnić administratorom paginowaną listę użytkowników wraz z filtrami po statusie, roli i wyszukiwaniu tekstowym.
- Warstwa HTTP: `src/pages/api/users/index.ts` w modelu Astro serverless z `export const prerender = false`.
- Wykorzystywane typy: `ListUsersQueryParams`, `UserDTO`, `UsersListResponseDTO`, `PaginationMetaDTO` z `src/types.ts`.

## 2. Szczegóły żądania
- Metoda HTTP: GET.
- Struktura URL: `/api/users` (bez segmentów dynamicznych).
- Autoryzacja: nagłówek `Authorization: Bearer <JWT>` wymagany; tylko użytkownicy z rolą `admin` otrzymują dane.
- Parametr page: liczba całkowita ≥1, domyślnie 1, przekłada się na offset `(page-1) * limit`.
- Parametr limit: liczba całkowita 1-100, domyślnie 20, służy zarówno do `range` jak i do budowy metadanych.
- Parametr status: wartość `pending` lub `approved`, mapowana na filtr `.eq("status", status)`.
- Parametr role: wartość `admin`, `organizer` lub `player`, mapowana na filtr `.eq("role", role)`.
- Parametr search: łańcuch obcięty do 255 znaków; buduje warunek OR na `first_name`, `last_name`, `email` z ILIKE i escaped wildcardami.
- Request body: brak.

## 3. Szczegóły odpowiedzi
- Sukces 200: zwraca `UsersListResponseDTO` zawierające `data: UserDTO[]` oraz `pagination` (page, limit, total, total_pages); rekordy sortowane malejąco po `created_at` dla deterministycznej paginacji.
- Walidacja 400: JSON `{ error: "validation_error", message, details }` z listą naruszeń schematu Zod.
- Brak autoryzacji 401: `{ error: "unauthorized", message }` gdy brak tokena lub nie można ustalić użytkownika.
- Brak uprawnień 403: `{ error: "forbidden", message }` gdy rola ≠ admin.
- Błąd serwera 500: `{ error: "internal_error", message }` przy problemach Supabase lub nieoczekiwanych wyjątkach, z logowaniem po stronie serwera.

## 4. Przepływ danych
- Odczytaj `Authorization` z żądania, wyciągnij token Bearer, wywołaj `locals.supabase.auth.getUser(token)` aby pobrać profil i role z JWT.
- Zastosuj straż: brak użytkownika lub status `pending` → natychmiastowe 401/403 zgodnie z regułą endpointu admin-only.
- Wczytaj `context.url.searchParams`, przemapuj do plain object i zweryfikuj poprzez schemat Zod (`listUsersQuerySchema`) zapewniający domyślne wartości, typy i limity.
- Wywołaj `listUsers` w nowym serwisie `src/lib/services/users.service.ts`, przekazując zwalidowane parametry oraz `locals.supabase`.
- W serwisie zbuduj zapytanie Supabase: wybierz kolumny zgodne z `UserDTO`, dołącz `.order("created_at", { ascending: false })`, `.eq` dla filtrów roli/statusu, `.or` dla wyszukiwania, `.range` na obliczonej pozycji; użyj `{ count: "exact" }` do uzyskania total.
- Przekształć wynik na `UsersListResponseDTO`, oblicz `total_pages = Math.ceil(total/limit)` i zwróć do handlera.
- Handler serializuje DTO do JSON z `return new Response(JSON.stringify(...), { status: 200, headers: { "content-type": "application/json" } })` oraz nagłówkiem `cache-control: no-store`.

## 5. Względy bezpieczeństwa
- Wymuszaj autoryzację Bearer i weryfikację roli admin, odrzucając inne role zgodnie z regułami RLS.
- Odcinaj dostęp przy statusie użytkownika `pending`, aby zawieszone konta nie mogły listować danych.
- Sanitizuj `search` przez zamianę `%` i `_` na escaped wzorce, minimalizując ryzyko pattern injection.
- Ustal maksymalny `limit = 100`, aby zapobiec nadużyciom i nadmiernym kosztom zapytań.
- Nie zwracaj pól wrażliwych (`password_hash`, `consent_*`) – DTO już ogranicza zakres.
- Dodaj nagłówek `cache-control: private, no-store` aby dane nie trafiły do cache współdzielonych.

## 6. Obsługa błędów
- Brak tokena lub token nieprawidłowy → status 401, komunikat o konieczności logowania.
- Użytkownik bez roli admin → status 403 z komunikatem o braku uprawnień.
- Parametry poza zakresem (np. `limit > 100`, `page < 1`, `status` spoza enum) → status 400 z listą naruszeń ze schematu Zod.
- Błąd Supabase (połączenie, błąd zapytania) → status 500, logowanie `console.error` z kontekstem zapytania.
- Brak rekordów → status 200 z pustą tablicą `data` i poprawnymi metadanymi paginacji.
- Nietypowe wyjątki → status 500, logowanie i neutralny komunikat bez ujawniania szczegółów.

## 7. Wydajność
- Wykorzystanie indeksów (`users.role`, `users.status`, `users.email`) zapewnia wydajne filtrowanie; przy potrzebie rozbudowy warto dodać indeks kompozytowy na `status, role`.
- Limit 100 zapobiega dużym zakresom `range` i redukuje transfer JSON.
- Przeniesienie logiki do serwisu umożliwia ewentualne memoizacje / reuse w przyszłych endpointach (np. panelu admina).
- W razie potrzeby dodać nagłówek `Prefer: count=exact` tylko dla pierwszej strony lub sprofilować zapytanie przy dużych wolumenach.

## 8. Kroki implementacji
1. Uzupełnij `src/db/supabase.client.ts` o eksport typu `SupabaseClient` (alias dla zwróconego klienta), aby zapewnić spójne typowanie usług.
2. Utwórz schemat Zod `listUsersQuerySchema` w nowym module `src/lib/validation/users.ts`, definiując domyślne wartości, zakresy liczby oraz sanitizację `search`.
3. Dodaj plik `src/lib/services/users.service.ts` z funkcją `listUsers(client, params)` implementującą filtrację, wyszukiwanie, paginację i mapowanie do `UsersListResponseDTO`.
4. Stwórz endpoint `src/pages/api/users/index.ts`: pobierz token, zweryfikuj użytkownika/rolę, obsłuż walidację, wywołaj serwis i zwróć odpowiedzi zgodnie z sekcjami 3 i 6.
5. Dodaj helper do escapowania wzorca wyszukiwania (np. funkcja `escapeIlikePattern`) w module walidacji lub serwisie, z testem jednostkowym.
6. Przygotuj testy jednostkowe/integracyjne (Vitest lub inny runner) dla schematu walidacji i serwisu z wykorzystaniem stubów Supabase lub kontraktów API.
7. Zaktualizuj dokumentację `.ai/api-plan.md`, jeśli wystąpią różnice implementacyjne (np. dodatkowe ograniczenia limitu), oraz upewnij się, że linter/formatter przechodzą pomyślnie.

