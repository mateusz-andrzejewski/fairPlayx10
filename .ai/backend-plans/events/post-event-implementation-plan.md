# API Endpoint Implementation Plan: POST /api/events

## 1. Przegląd punktu końcowego

- Cel: utworzyć nowe wydarzenie przypisane do aktualnego organizatora (lub admina działającego w jego imieniu).
- Warstwa HTTP: `src/pages/api/events/index.ts` (Astro endpoint z handlerem POST).
- Logika biznesowa: funkcja `createEvent` w `src/lib/services/events.service.ts`.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: `/api/events`
- Parametry:
  - Wymagane: brak w query/path
  - Body (wymagane): `name`, `location`, `event_datetime`, `max_places`, `optional_fee`
- Request Body: JSON zgodny z `CreateEventCommand`
- Nagłówki: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

## 3. Wykorzystywane typy

- `CreateEventCommand`, `EventDTO` (lub `EventDetailDTO` jeśli zwracamy rozbudowaną odpowiedź) z `src/types.ts`
- Walidator `createEventBodySchema` w `src/lib/validation/events.ts`

## 3. Szczegóły odpowiedzi

- 201: JSON nowo utworzonego `EventDTO`
- 400: `{ error: "validation_error", message, details }`
- 401: `{ error: "unauthorized", message }`
- 403: `{ error: "forbidden", message }`
- 500: `{ error: "internal_error", message }`

## 4. Przepływ danych

1. Handler weryfikuje uwierzytelnienie oraz rolę (`organizer` lub `admin`).
2. Odczytuje `await request.json()` i waliduje z `createEventBodySchema` (trim stringów, zakresy liczb, `event_datetime` > teraz).
3. Ustalany jest `organizer_id` po stronie serwera (domyślnie `locals.user.id`); jeśli admin ma tworzyć w imieniu innego organizatora, dodać opcjonalne pole i walidację.
4. Wywołanie `createEvent(supabase, payload, organizerId)`.
5. Serwis wykonuje `insert` do `events` z domyślnym `status = 'draft'`, `current_signups_count = 0`, `deleted_at = null`, `organizer_id` ustawionym przez serwer i `select().single()` dla uzyskania danych.
6. Mapuje wynik na `EventDTO` i zwraca do handlera.
7. Handler odsyła `Response.json(dto, { status: 201 })`.

## 5. Względy bezpieczeństwa

- Tylko role `organizer`/`admin` mogą tworzyć wydarzenia.
- Serwer kontroluje `organizer_id`; body tego pola nie powinno nadpisywać.
- Walidacja `event_datetime` (przyszłość), `max_places` (> 0), `optional_fee` (≥ 0 lub null).
- Sanitizacja stringów (`trim`, limit 200 znaków) zapobiega potencjalnym nadużyciom.
- Rozważyć rate limiting dla tworzenia eventów.

## 6. Obsługa błędów

- Walidacja Zod → 400 z `details`.
- Brak tokenu → 401.
- Rola niewystarczająca → 403.
- Naruszenie constraintów PG / Supabase (`check`, `not null`) → mapować na 400 (zrozumiały komunikat).
- Nieprzewidziane błędy → log + 500.

## 7. Rozważania dotyczące wydajności

- Operacja jednostkowego insertu – niskie koszty.
- Unikać zbędnych zapytań weryfikacyjnych (np. event conflict) chyba że potrzebne biznesowo.
- Wprowadzić walidację po stronie aplikacji, aby minimalizować błędy DB.

## 8. Etapy wdrożenia

1. Zdefiniować `createEventBodySchema` w `src/lib/validation/events.ts` (walidacja pól, trim, defaulty).
2. Zaimplementować `createEvent` w `src/lib/services/events.service.ts` (insert + mapowanie DTO).
3. Dodać obsługę POST w `src/pages/api/events/index.ts` (autoryzacja, walidacja, delegacja).
4. Przygotować testy jednostkowe (walidator i serwis z mock Supabase) obejmujące błędne daty, opłaty, role.
5. Wykonać linter/testy oraz ewentualnie uzupełnić dokumentację API.
