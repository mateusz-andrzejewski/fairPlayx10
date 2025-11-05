# API Endpoint Implementation Plan: GET /api/users/{id}

## 1. Przegląd punktu końcowego
- Dostarcza szczegóły pojedynczego użytkownika (`UserDTO`) dla administratorów lub samego zainteresowanego.
- Implementacja jako Astro API route w `src/pages/api/users/[id].ts` z `export const prerender = false`.
- Korzysta z Supabase (tabela `users`) poprzez klienta dostępnego w `context.locals.supabase`.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/users/{id}`
- Parametry:
  - Wymagane (path): `id` – dodatnia liczba całkowita lub UUID (zależnie od ostatecznego typu w bazie; należy potwierdzić podczas implementacji) ograniczona do istniejącego rekordu.
  - Opcjonalne: brak
- Nagłówki: `Authorization: Bearer <JWT>`, `Accept: application/json`
- Body: brak

## 3. Wykorzystywane typy
- `UserDTO` z `src/types.ts` (korpus odpowiedzi)
- `Tables<"users">` / `UserRow` (mapowanie kolumn w serwisie)
- Typ klienta `SupabaseClient` eksportowany z `src/db/supabase.client.ts`

## 3. Szczegóły odpowiedzi
- 200 OK: JSON zgodny z `UserDTO`
- 400 Bad Request: naruszenia walidacji parametru `id`
- 401 Unauthorized: brak lub niepoprawny token
- 403 Forbidden: token poprawny, ale użytkownik nie jest adminem ani właścicielem profilu
- 404 Not Found: brak rekordu użytkownika
- 500 Internal Server Error: błąd Supabase lub inny nieoczekiwany wyjątek
- Nagłówki odpowiedzi: `Content-Type: application/json`, `Cache-Control: private, no-store`

## 4. Przepływ danych
- Handler odczytuje segment `id` z `Astro.params` i waliduje go schematem Zod (`userIdParamSchema`).
- Z nagłówka `Authorization` pobierany jest token JWT i używany do uwierzytelnienia poprzez `context.locals.supabase.auth.getUser(token)` lub istniejącą abstrakcję auth.
- Straż autoryzacyjna:
  - Jeśli zalogowany użytkownik ma rolę `admin`, może pobrać dowolny profil.
  - Jeśli rola ≠ `admin`, zezwól tylko, gdy `requestUser.id === validatedId` (uwzględniając dopasowanie typów `string`/`number`).
- Po pozytywnej autoryzacji handler deleguje do serwisu `getUserById` (np. w `src/lib/services/users.service.ts`):
  - Wykonuje zapytanie `from("users").select(...).eq("id", id).limit(1).single()` ograniczone do kolumn wymaganych przez `UserDTO`.
  - Obsługuje status `status === 406` (no data) oraz `error` z Supabase.
- Serwis zwraca obiekt `UserDTO`; handler mapuje go na JSON i odsyła wraz z nagłówkami.
- W przypadku błędu serwis rzuca kontrolowany wyjątek (np. `NotFoundError`, `SupabaseError`) obsługiwany przez handler.

## 5. Względy bezpieczeństwa
- Wymuszenie uwierzytelnienia Bearer oraz kontroli ról (admin) lub identity match.
- Ochrona przed enumeracją użytkowników – brak informacji, czy rekord istnieje, w komunikatach 403; 404 zwracany dopiero po pozytywnym przejściu sprawdzeń uprawnień.
- Zgodność z RLS: korzystanie z klienta serwerowego wymaga upewnienia się, że obowiązujące polityki RLS pozwalają na zapytanie admina; w razie potrzeby dodać `service role` lub RPC.
- Sanitizacja parametru `id`: konwersja/koercja i limit długości dla UUID w schemacie Zod.
- Brak ujawniania pól wrażliwych (np. `password_hash`, `consent_*`).
- Logowanie prób nieautoryzowanych dostępu (np. `logSecurityEvent`), z maskowaniem identyfikatorów użytkownika.

## 6. Obsługa błędów
- 400: wynik walidacji Zod zawiera szczegóły – format `{ error: "validation_error", message, details }`.
- 401: brak tokena / błąd dekodowania – `{ error: "unauthorized", message: "Authentication required" }`.
- 403: rola niewystarczająca – `{ error: "forbidden", message: "Insufficient permissions" }`.
- 404: serwis zwraca `null` lub Supabase `status 406` – `{ error: "not_found", message: "User not found" }`.
- 500: błędy Supabase lub inne wyjątki – `{ error: "internal_error", message: "Unexpected server error" }`; log w centralnym loggerze (rozszerzyć przy integracji z tabelą błędów).

## 7. Rozważania dotyczące wydajności
- Zapytanie po kluczu głównym korzysta z indeksu PRIMARY KEY, więc koszt jest minimalny.
- Ograniczenie selekcji tylko do kolumn DTO zmniejsza payload JSON.
- W przypadku częstych odczytów własnego profilu można rozważyć cachowanie po stronie klienta; endpoint powinien jednak pozostać `no-store`.
- Monitorować liczbę równoległych wywołań admina – ewentualnie dodać rate limiting w warstwie middleware.

## 8. Etapy wdrożenia
1. Zweryfikuj typ kolumny `users.id` (SERIAL vs UUID) i zaktualizuj schemat Zod oraz mapowanie ID zgodnie z rzeczywistą migracją bazy.
2. Rozszerz `src/db/supabase.client.ts` o eksport typu `SupabaseClient` (alias z `ReturnType<typeof createClient>`), aby ujednolicić typowanie serwisów.
3. Dodaj schemat `userIdParamSchema` w module walidacji (np. `src/lib/validation/users.ts`) z koercją i limitami długości.
4. Rozbuduj istniejący serwis użytkowników (`src/lib/services/users.service.ts` lub utwórz nowy) o funkcję `getUserById(client: SupabaseClient, id: UserRow["id"]): Promise<UserDTO>`.
5. Zaimplementuj endpoint w `src/pages/api/users/[id].ts`: pobierz token, uwierzytelnij użytkownika, sprawdź uprawnienia, wywołaj serwis i zmapuj odpowiedzi oraz błędy na kody statusu.
6. Dodaj centralną obsługę błędów (np. helper `respondWithError`) oraz logowanie incydentów bezpieczeństwa do istniejącej struktury telemetryjnej lub tabeli błędów.
7. Przygotuj testy jednostkowe dla walidacji i serwisu (mock Supabase) oraz test integracyjny handlera z symulacją ról `admin` i `player`.
8. Zaktualizuj dokumentację `.ai/api-plan.md` i ewentualne plany QA, finalnie uruchom lint/test (`npm run lint`, `npm run test`).

