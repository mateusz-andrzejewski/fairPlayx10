# API Endpoint Implementation Plan: GET /api/events

## 1. Przegląd punktu końcowego
- Cel: zwrócić paginowaną listę aktywnych (soft delete aware) wydarzeń z filtrami po statusie, lokalizacji, zakresie dat oraz organizatorze.
- Warstwa HTTP: `src/pages/api/events/index.ts` jako Astro endpoint (`export const prerender = false`).
- Logika biznesowa: funkcja `listEvents` w `src/lib/services/events.service.ts`.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/events`
- Parametry:
  - Wymagane: brak
  - Opcjonalne: `page` (domyślnie 1, int ≥ 1), `limit` (domyślnie 20, int 1–100), `status` (`event_status`), `location` (string ≤ 200, trim), `date_from` (ISO 8601), `date_to` (ISO 8601, ≥ `date_from`), `organizer_id` (int ≥ 1)
- Request Body: brak
- Nagłówki: `Authorization: Bearer <JWT>`

## 3. Wykorzystywane typy
- `ListEventsQueryParams`, `EventsListResponseDTO`, `EventDTO`, `PaginationMetaDTO` z `src/types.ts`
- Lokalny typ walidatora (np. `ParsedListEventsParams`) w `src/lib/validation/events.ts`

## 3. Szczegóły odpowiedzi
- 200: JSON `EventsListResponseDTO`
- 400: `{ error: "validation_error", message, details }`
- 401: `{ error: "unauthorized", message }`
- 403: `{ error: "forbidden", message }` (jeśli polityka ról ogranicza dostęp)
- 500: `{ error: "internal_error", message }`
- Nagłówki: `cache-control: private, no-store`, `content-type: application/json`

## 4. Przepływ danych
1. Handler Astro pobiera `locals.supabase` i `locals.auth.user`.
2. Weryfikuje uwierzytelnienie (401 przy braku) oraz uprawnienia ról.
3. Odczytuje `searchParams`, stosuje `listEventsQuerySchema` (Zod) do walidacji i domyślnych wartości.
4. Wywołuje `listEvents(supabase, params)`.
5. Serwis filtruje rekordy (`deleted_at IS NULL`), stosuje filtry (status, location, date range, organizer), dodaje paginację (`range`, `count: "exact"`).
6. Mapuje rekordy na `EventDTO`, buduje `PaginationMetaDTO` i zwraca `EventsListResponseDTO`.
7. Handler odsyła `Response.json(dto, { status: 200 })`.

## 5. Względy bezpieczeństwa
- Wymagane uwierzytelnienie; weryfikacja roli (`user`/`organizer`/`admin`).
- Sanitizacja `location` (trim, limit długości, escape `%`/`_` przed `ilike`).
- Limit `limit` ≤ 100, `page` ≥ 1, aby uniknąć nadużyć.
- Zapytania Supabase wykonywane z `locals.supabase` (service role) z wymuszeniem `deleted_at IS NULL`.

## 6. Obsługa błędów
- Naruszenie walidacji (Zod) → 400 z listą błędów.
- Brak tokenu → 401.
- Rola bez dostępu → 403.
- Błędy Supabase (`error`) → log (`logger.error`/`console.error`) + 500.
- Pusta lista jest poprawnym przypadkiem (200 z `data: []`).

## 7. Rozważania dotyczące wydajności
- Indeksy na `status`, `organizer_id`, `event_datetime`, `deleted_at`.
- Paginacja i ograniczenie `limit` zmniejsza obciążenie DB.
- Możliwość wprowadzenia cache (np. krótkoterminowego) dla często używanych filtrów.
- Walidacja długości `location` i trim minimalizuje koszty wyszukiwania `ilike`.

## 8. Etapy wdrożenia
1. W pliku `src/lib/validation/events.ts` dodać `listEventsQuerySchema` z walidacją i domyślnymi wartościami.
2. Utworzyć `src/lib/services/events.service.ts` z funkcją `listEvents` (zapytanie Supabase + mapowanie DTO).
3. W `src/pages/api/events/index.ts` zaimplementować handler GET (autoryzacja, walidacja, delegacja do serwisu).
4. Przygotować testy jednostkowe dla walidatora oraz serwisu (mock Supabase), weryfikujące m.in. filtrowanie i paginację.
5. Uruchomić linter/testy i zaktualizować dokumentację API, jeśli dodano nowe parametry.

