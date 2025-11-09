# API Endpoint Implementation Plan: GET /api/players

## 1. Przegląd punktu końcowego

- Cel: zwrócić paginowaną listę aktywnych graczy z filtrami po pozycji oraz wyszukiwaniem tekstowym, z opcjonalnym ujawnieniem `skill_rate` dla administratorów.
- Warstwa HTTP: `src/pages/api/players/index.ts` jako Astro endpoint z `export const prerender = false`.
- Główna logika biznesowa: nowy serwis `src/lib/services/players.service.ts` (funkcja `listPlayers`).

-## 2. Szczegóły żądania

- Metoda HTTP: GET
- Struktura URL: `/api/players`
- Parametry:
  - Wymagane: brak
  - Opcjonalne: `page` (domyślnie 1, int ≥ 1), `limit` (domyślnie 20, int 1-100), `position` (enum `player_position`), `search` (string max 255, trim), `include_skill_rate` (boolean; efekty tylko dla admina)
- Request Body: brak
- Nagłówki: `Authorization: Bearer <JWT>` obowiązkowy; `Content-Type` zbędny

## 3. Wykorzystywane typy

- `ListPlayersQueryParams`, `PlayersListResponseDTO`, `PlayerDTO`, `PaginationMetaDTO` z `src/types.ts`
- Lokalne typy odpowiedzi błędów (np. `ApiErrorResponse`) współdzielone z innymi endpointami

## 3. Szczegóły odpowiedzi

- Status 200: JSON `PlayersListResponseDTO` z `data` oraz `pagination`
- Status 400: `{ error: "validation_error", message, details }` przy niedozwolonych parametrach
- Status 401: `{ error: "unauthorized", message }` gdy brak/invalid token
- Status 403: `{ error: "forbidden", message }` gdy rola ≠ `admin`/`organizer` (lista może być dostępna dla organizerów bez `skill_rate`)
- Status 500: `{ error: "internal_error", message }` dla błędów Supabase/innych wyjątków
- Nagłówki: `cache-control: private, no-store`, `content-type: application/json`

## 4. Przepływ danych

1. Handler pobiera `locals.supabase` oraz `locals.user` (ustalone w middleware) lub tworzony jest helper do poboru użytkownika z tokena.
2. Walidacja autoryzacji: wymaga roli `admin` lub `organizer`; w przeciwnym razie 403.
3. Odczytaj `searchParams`, zmapuj do plain object.
4. Zastosuj `listPlayersQuerySchema` (Zod) dla domyślnych wartości, zakresów i sanitizacji.
5. Wywołaj `listPlayers(supabase, params, canSeeSkillRate)` gdzie `canSeeSkillRate = user.role === "admin" && params.include_skill_rate`.
6. W serwisie: filtruj `deleted_at` na NULL, ustaw `.select("id, first_name, last_name, position, skill_rate, date_of_birth, created_at, updated_at")`, `.order("created_at", { ascending: false })`.
7. Zastosuj `.eq("position", params.position)` jeśli obecne, `.ilike` dla `search` na `first_name`/`last_name` (z escape), `.range(from, to)` dla paginacji oraz `{ count: "exact" }`.
8. Po uzyskaniu wyników ukryj `skill_rate` (np. ustaw `null`) jeśli `canSeeSkillRate === false`.
9. Oblicz `total_pages`, zbuduj DTO i zwróć z kodem 200.

## 5. Względy bezpieczeństwa

- Autoryzacja roli: tylko `admin` i `organizer`; `skill_rate` ujawniany jedynie dla `admin`, nawet jeśli query param ustawiony.
- Sanityzacja wyszukiwania: escape `%` i `_` przed użyciem w `ilike`.
- Ograniczenie `limit` i `page` zapobiega atakom DOS przez duże zakresy.
- Zapytania Supabase w kontekście serwera (service key) muszą wymuszać `deleted_at IS NULL` aby nie ujawniać soft-deleted rekordów.

## 6. Obsługa błędów

- Walidacja (Zod) → 400 z listą naruszeń.
- Brak tokena/niezalogowany → 401.
- Rola niewystarczająca → 403.
- Błędy Supabase (np. `error` w odpowiedzi) → logowanie `console.error` + 500.
- Gdy `count === 0` → zwróć pustą listę z 200 (nie jest to błąd).

## 7. Rozważania dotyczące wydajności

- Użyj indeksów na `position`, `deleted_at`, `created_at`; rekomendacja dodania kompozytu (`deleted_at`, `position`).
- Limity paginacji zmniejszają transfer oraz obciążenie DB.
- Możliwość cache w pamięci dla list bez filtrów (opcjonalnie) – jeśli w przyszłości wymagane, wprowadzić etag.
- Rozważ limitowanie `search` do 255 znaków i wycinanie białych znaków przed budową zapytania.

## 8. Etapy wdrożenia

1. Stworzyć `src/lib/validation/players.ts` z `listPlayersQuerySchema` oraz helperem `sanitizeSearchQuery` (re-usable).
2. Utworzyć `src/lib/services/players.service.ts` i zaimplementować `listPlayers` zgodnie z sekcją 4.
3. Dodać endpoint `src/pages/api/players/index.ts`: walidacja tokenu, roli, query params, wywołanie serwisu, zwrot odpowiedzi.
4. Zapewnić testy jednostkowe dla walidacji i serwisu (mock Supabase), weryfikujące maskowanie `skill_rate`.
5. Upewnić się, że linter i formatowanie przechodzą oraz zaktualizować dokumentację, jeśli rozszerzono parametry.
