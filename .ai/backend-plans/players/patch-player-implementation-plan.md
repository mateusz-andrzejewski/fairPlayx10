# API Endpoint Implementation Plan: PATCH /api/players/{id}

## 1. Przegląd punktu końcowego
- Cel: częściowa aktualizacja danych gracza przy zachowaniu kontroli ról (np. `skill_rate` tylko dla admina) i ignorowaniu soft-deleted rekordów.
- Warstwa HTTP: `src/pages/api/players/[id].ts` obsługująca również `PATCH` (współdzielony plik z `GET`).
- Logika domenowa: `updatePlayer` w `src/lib/services/players.service.ts`.

## 2. Szczegóły żądania
- Metoda HTTP: PATCH
- Struktura URL: `/api/players/{id}`
- Parametry:
  - Wymagane: `id` w ścieżce (int > 0)
  - Opcjonalne: brak dodatkowych query params
- Request Body (`application/json`): dowolna kombinacja pól:
  - `first_name` (string 1-100, trim)
  - `last_name` (string 1-100, trim)
  - `position` (enum `player_position`)
  - `skill_rate` (int 1-10; tylko admin)
  - `date_of_birth` (ISO date, opcjonalna, ≤ dziś)
- Wymaga autoryzacji Bearer (`Authorization` header)

## 3. Wykorzystywane typy
- `UpdatePlayerCommand`, `PlayerDTO` z `src/types.ts`
- `ApiErrorResponse`

## 3. Szczegóły odpowiedzi
- Status 200: JSON `PlayerDTO` (z maskowaniem `skill_rate` dla nie-adminów)
- Status 204 opcjonalnie niewskazany – trzymamy się 200 z payloadem
- Status 400: `validation_error` gdy body puste lub nieprzechodzące walidacji
- Status 401: `unauthorized`
- Status 403: `forbidden` gdy rola niewystarczająca lub organizer próbuje zmodyfikować `skill_rate`
- Status 404: `not_found` gdy gracz nie istnieje lub soft-deleted
- Status 409: `conflict` gdy naruszono constraint (np. duplikat, jeśli istnieją)
- Status 500: `internal_error`

## 4. Przepływ danych
1. Handler sprawdza autoryzację; dozwolone role: `admin`, `organizer`.
2. Waliduje `params.id` schematem `playerIdParamSchema`.
3. Odczytuje JSON body i przeprowadza przez `updatePlayerSchema` (Zod). Schema wymaga co najmniej jednego pola (`.refine(Object.keys(parsed).length > 0)`).
4. Organizatorzy: usuwaj `skill_rate` z payloadu; jeśli próbują ustawić → 403.
5. W serwisie `updatePlayer`: sprawdza istnienie aktywnego rekordu (`deleted_at` null). Można użyć `select().eq().is().maybeSingle()` przed aktualizacją lub `update(...).is(...).eq(...).select().maybeSingle()`.
6. Aktualizacja wykorzystuje `update(command).eq("id", id).is("deleted_at", null).select().single()`.
7. Jeżeli brak rekordu → handler mapuje na 404.
8. Po sukcesie maskuj `skill_rate` dla nie-adminów i zwróć 200.

## 5. Względy bezpieczeństwa
- Autoryzacja: tylko `admin` i `organizer`; `skill_rate` modyfikowalny jedynie przez `admin`.
- Walidacja stringów zapobiega XSS/SQL injection.
- Nie zezwalaj na aktualizację kolumn systemowych (`id`, `created_at`, `deleted_at`).
- Loguj próby nieautoryzowanej zmiany `skill_rate` do mechanizmu błędów.

## 6. Obsługa błędów
- Puste body → 400 z komunikatem "No fields to update".
- Błędy typów/długości → 400.
- Brak tokena → 401.
- Rola niewystarczająca/proba zmiany `skill_rate` przez organizer → 403.
- Gracz nie istnieje / soft-deleted → 404.
- Konflikt DB (np. unikalność) → 409 (wykrycie `error.code`).
- Błędy Supabase → log + 500.

## 7. Rozważania dotyczące wydajności
- Aktualizacja jednostkowa – niskie obciążenie.
- Użycie `update(...).select()` pozwala uniknąć podwójnego zapytania.
- Jeśli concurrency istotna, rozważyć optymistyczne blokady (np. warunek `updated_at`), ale domyślnie jednostkowa operacja wystarcza.

## 8. Etapy wdrożenia
1. Dodać `updatePlayerSchema` do `src/lib/validation/players.ts` (Zod, partial, refine na co najmniej jedno pole).
2. W `players.service.ts` zaimplementować `updatePlayer(client, id, payload)` realizując walidację istnienia i maskowanie.
3. Rozszerzyć `src/pages/api/players/[id].ts` o gałąź `PATCH`: autoryzacja, walidacja, wywołanie serwisu, mapowanie błędów.
4. Utworzyć testy dla schematu (puste body, skill_rate > 10) i serwisu (brak rekordu, soft-deleted, maskowanie).
5. Zweryfikować linter oraz ewentualnie dodać dokumentację.

