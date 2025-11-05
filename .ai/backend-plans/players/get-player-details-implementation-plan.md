# API Endpoint Implementation Plan: GET /api/players/{id}

## 1. Przegląd punktu końcowego
- Cel: pobrać szczegółowe informacje o pojedynczym graczu, z uwzględnieniem ochrony `skill_rate` w zależności od roli użytkownika i pomijając rekordy soft-deleted.
- Warstwa HTTP: `src/pages/api/players/[id].ts` jako server endpoint (dynamic segment) z `export const prerender = false`.
- Logika domenowa: funkcja `getPlayerById` w module `src/lib/services/players.service.ts`.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/players/{id}` gdzie `{id}` to dodatnia liczba całkowita
- Parametry:
  - Wymagane: `id` w ścieżce (parsowany do liczby)
  - Opcjonalne: brak
- Request Body: brak
- Nagłówki: `Authorization: Bearer <JWT>` wymagany

## 3. Wykorzystywane typy
- `PlayerDTO` z `src/types.ts`
- Lokalny typ `ApiErrorResponse`

## 3. Szczegóły odpowiedzi
- Status 200: JSON `PlayerDTO`; dla nie-adminów `skill_rate` może być `null`/usunięte zgodnie z polityką bezpieczeństwa
- Status 401: `{ error: "unauthorized", message }` gdy brak tokena lub niepowodzenie autentykacji
- Status 404: `{ error: "not_found", message }` gdy brak aktywnego gracza o wskazanym `id` (`deleted_at` ≠ NULL lub nie istnieje)
- Status 500: `{ error: "internal_error", message }` dla błędów Supabase

## 4. Przepływ danych
1. Handler pobiera `locals.supabase` i identyfikację użytkownika (w tym rolę) – poprzez middleware lub `supabase.auth.getUser`.
2. Brak użytkownika → 401.
3. Parsuje `params.id` do liczby całkowitej, waliduje (Zod `z.coerce.number().int().positive()`). W przypadku błędu → 400.
4. Wywołuje `getPlayerById(supabase, id)` z serwisu.
5. Serwis wykonuje `select` w Supabase z filtrem `eq("id", id)` oraz `is("deleted_at", null)`, limit 1.
6. Jeśli wynik pusty → null wraca do handlera, który odpowiada 404.
7. Jeżeli użytkownik nie ma roli admin → serwis/handler maskuje `skill_rate` (np. ustawienie `null`).
8. Zwraca `PlayerDTO` w odpowiedzi JSON z kodem 200 i nagłówkiem `cache-control: private, no-store`.

## 5. Względy bezpieczeństwa
- Wymuszenie autoryzacji JWT i weryfikacji statusu użytkownika (`pending` → 403 lub 401, zgodnie z globalną polityką).
- Maskowanie `skill_rate` dla ról innych niż `admin`.
- Ochrona przed enumeracją: przy braku rekordu zwracaj 404 z neutralnym komunikatem.
- Brak danych wrażliwych ponad te zdefiniowane w `PlayerDTO`.

## 6. Obsługa błędów
- Nieprawidłowe `id` (np. NaN) → odpowiedź 400 `validation_error`.
- Nieautoryzowany dostęp → 401.
- Brak gracza → 404.
- Błędy Supabase (połączenie, zapytanie) → logowanie + 500.
- Wszystkie wyjątki logować (`console.error` lub dedykowany logger); jeśli wdrożona tabela błędów, zapisywać wpis z `endpoint`, `error_code`, `user_id`.

## 7. Rozważania dotyczące wydajności
- Pojedyncze zapytanie po PK jest szybkie; upewnić się, że `id` ma indeks PRIMARY KEY (domyślnie).
- Można użyć selekcji kolumn ograniczonej do `PlayerDTO` dla minimalnego transferu.
- Dodaj caching w warstwie CDN tylko dla żądań admin (opcjonalnie) – obecnie wyłączone przez `no-store`.

## 8. Etapy wdrożenia
1. Rozszerzyć `src/lib/validation/players.ts` o schemat `playerIdParamSchema` dla walidacji `params.id`.
2. Dodać funkcję `getPlayerById` do `players.service.ts`, łącząc pobranie i maskowanie `skill_rate`.
3. Utworzyć endpoint `src/pages/api/players/[id].ts`: autoryzacja, walidacja `id`, wywołanie serwisu, odpowiedzi według sekcji 3.
4. Zapewnić testy jednostkowe dla serwisu (przypadki: hit, brak rekordu, soft-deleted, maskowanie `skill_rate`).
5. Upewnić się, że linter i testy przechodzą.

