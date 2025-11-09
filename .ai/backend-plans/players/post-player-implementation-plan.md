# API Endpoint Implementation Plan: POST /api/players

## 1. Przegląd punktu końcowego

- Cel: utworzyć nowego gracza i powiązać go z systemem, z opcjonalnym ustawieniem `skill_rate` tylko dla administratorów.
- Warstwa HTTP: `src/pages/api/players/index.ts` obsługująca również POST (współdzielony moduł z GET, rozgałęzienie po `request.method`).
- Logika domenowa: `createPlayer` w `src/lib/services/players.service.ts`.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: `/api/players`
- Parametry:
  - Wymagane: brak w URL; ciało JSON zawiera wszystkie dane
  - Opcjonalne: brak
- Request Body (`application/json`):
  - `first_name` (string 1-100, trim)
  - `last_name` (string 1-100, trim)
  - `position` (enum `player_position`)
  - `skill_rate` (int 1-10; wymagane jeśli roszczenie admina, w innym wypadku ignorowane/ustawione na null)
  - `date_of_birth` (ISO date, opcjonalne)
- Nagłówki: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

## 3. Wykorzystywane typy

- `CreatePlayerCommand`, `PlayerDTO` z `src/types.ts`
- Wspólny `ApiErrorResponse`

## 3. Szczegóły odpowiedzi

- Status 201: JSON `PlayerDTO` nowo utworzonego gracza (z `skill_rate` tylko dla admina)
- Status 400: `{ error: "validation_error", details }` przy błędnym ciele (Zod, brak pola, zły enum)
- Status 401: `{ error: "unauthorized", message }` gdy brak tokena
- Status 403: `{ error: "forbidden", message }` gdy użytkownik nie `admin`/`organizer` lub organizer próbuje ustawić `skill_rate`
- Status 409: `{ error: "conflict", message }` jeśli Supabase zwróci konflikt (np. duplikat `first_name` + `last_name` jeśli wprowadzono constraint)
- Status 500: `{ error: "internal_error", message }` dla innych błędów

## 4. Przepływ danych

1. Endpoint weryfikuje metodę i autoryzację (`admin` lub `organizer`).
2. Odczytuje ciało JSON, waliduje `createPlayerSchema` (Zod) z regułami długości, trim, regex (tylko litery + dopuszczalne znaki), walidacją daty.
3. Dla organizerów wymusi `skill_rate` → `undefined` (ignoruj), dla adminów zezwoli; weryfikuj, że admin nie przekazuje wartości spoza 1-10.
4. Wywołuje `createPlayer(supabase, command)` z serwisu.
5. Serwis wykonuje `insert` do `players` (kolumny z `CreatePlayerCommand`) z `returning`/`select` powrotem rekordów.
6. W przypadku błędu Supabase (np. constraint) → rzuć dedykowany wyjątek mapowany w handlerze.
7. Po sukcesie: maskuj `skill_rate` jeżeli użytkownik ≠ admin.
8. Odpowiedz 201 z JSON oraz nagłówkiem `cache-control: no-store` i `Location: /api/players/{id}`.

## 5. Względy bezpieczeństwa

- Tylko role `admin` i `organizer`; `organizer` nie może ustawić `skill_rate`.
- Walidacja i trim stringów zapobiega wstrzyknięciom SQL/HTML.
- Upewnij się, że `date_of_birth` to data ≤ dzisiaj; odrzuć przyszłe daty.
- Wymuś `deleted_at = null` domyślnie (Supabase default) – nie pozwalaj w body.
- Loguj próby ustawienia `skill_rate` przez organizerów w tablicy błędów (jeśli istnieje) lub jako ostrzeżenie.

## 6. Obsługa błędów

- Zod validation → 400.
- Nieautoryzowany → 401.
- Rola niewystarczająca → 403.
- Supabase conflict → 409 (wykryj `error.code === '23505'`).
- Nieoczekiwane błędy → log + 500, bez ujawniania szczegółów.
- Jeśli błąd zapisu logów do tabeli błędów (opcjonalnie `errors`), opakuj w try/catch, aby nie przesłonił głównej odpowiedzi.

## 7. Rozważania dotyczące wydajności

- Operacja insert pojedynczego rekordu – niski koszt.
- Unikaj zbędnych round-tripów: użyj `insert(values).select().single()` aby od razu mieć DTO.
- Wprowadź minimalne ograniczenia długości, aby zapobiec dużym payloadom.

## 8. Etapy wdrożenia

1. W `src/lib/validation/players.ts` dodać `createPlayerSchema` (Zod) wraz z regułami wspomnianymi wyżej i opcją `stripUnknown`.
2. W `players.service.ts` zaimplementować `createPlayer(client, command)` obsługujący maskowanie i mapowanie do DTO.
3. Uzupełnić `src/pages/api/players/index.ts` o gałąź `POST`: autoryzacja, walidacja, wywołanie serwisu, mapowanie błędów.
4. Dodać testy (np. Vitest) dla walidacji (organizer próbujący ustawić `skill_rate`, przyszła data) oraz serwisu (sukces, konflikt).
5. Zweryfikować linter, formatowanie i ewentualnie zaktualizować dokumentację.
