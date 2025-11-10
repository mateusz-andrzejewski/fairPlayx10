# API Endpoint Implementation Plan: PATCH /api/event/{id}

## 1. Przegląd punktu końcowego

- Cel: zaktualizować szczegóły istniejącego wydarzenia (np. dane logistyczne, status) przez uprawnionego organizatora lub administratora.
- Warstwa HTTP: `src/pages/api/event/[id].ts` (Astro endpoint; handler PATCH współdzielony z GET/DELETE).
- Logika biznesowa: funkcja `updateEvent` w `src/lib/services/event.service.ts`.

## 2. Szczegóły żądania

- Metoda HTTP: PATCH
- Struktura URL: `/api/event/{id}`
- Parametry:
  - Wymagane: `id` (parametr ścieżki, dodatnia liczba całkowita)
  - Body: dowolny podzbiór `UpdateEventCommand` (`name`, `location`, `event_datetime`, `max_places`, `optional_fee`, `status`)
- Request Body: JSON, co najmniej jedno pole
- Nagłówki: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

## 3. Wykorzystywane typy

- `UpdateEventCommand`, `EventDTO` z `src/types.ts`
- Walidatory `eventIdParamSchema`, `updateEventBodySchema` w `src/lib/validation/event.ts`

## 3. Szczegóły odpowiedzi

- 200: JSON `EventDTO`
- 400: `{ error: "validation_error", message, details }`
- 401: `{ error: "unauthorized", message }`
- 403: `{ error: "forbidden", message }`
- 404: `{ error: "not_found", message }`
- 500: `{ error: "internal_error", message }`

## 4. Przepływ danych

1. Handler waliduje `params.id` (`eventIdParamSchema`).
2. Odczytuje body (`await request.json()`) i waliduje `updateEventBodySchema` (trim, min 1 pole, walidacja wartości).
3. Weryfikuje rolę użytkownika (`organizer` może edytować własne wydarzenie, `admin` dowolne).
4. Wywołuje `updateEvent(supabase, id, payload, currentUser)`.
5. Serwis:
   - Pobiera event (`select`, `deleted_at IS NULL`), sprawdza istnienie i własność (`organizer_id`).
   - Weryfikuje reguły biznesowe (np. `event_datetime` > teraz, `max_places` > 0, niedozwolone przejścia statusów).
   - Buduje obiekt aktualizacji z `updated_at = now` i tylko zmienionymi polami.
   - Wykonuje `.update().eq("id", id).select().single()`; brak wiersza → 404.
6. Zwraca zaktualizowany `EventDTO`.
7. Handler odsyła `Response.json(dto, { status: 200 })`.

## 5. Względy bezpieczeństwa

- Tylko właściciel (organizer) lub admin może aktualizować.
- Pole `organizer_id` nie jest dostępne do zmiany.
- Walidacja statusów – np. tylko admin może ustawić `cancelled`, `completed` nie wraca do `draft`.
- `event_datetime` w przyszłości, `max_places` > 0, `optional_fee` ≥ 0.
- Obsługa soft-delete: edycja niedozwolona dla `deleted_at` ≠ null.

## 6. Obsługa błędów

- Błędne parametry/body → 400 z opisem.
- Brak tokenu → 401.
- Niewystarczające uprawnienia → 403.
- Event nie istnieje / usunięty lub nie należy do użytkownika → 404.
- Błąd Supabase → log + 500.

## 7. Rozważania dotyczące wydajności

- Pojedynczy update – niskie obciążenie.
- Indeksy na `organizer_id`, `deleted_at` ułatwiają weryfikację własności.
- Minimalny patch (tylko zmienione pola) obniża ryzyko nadpisania danych.

## 8. Etapy wdrożenia

1. Zdefiniować `updateEventBodySchema` w `src/lib/validation/event.ts` (wraz z regułą „co najmniej jedno pole”).
2. Zaimplementować `updateEvent` w `src/lib/services/event.service.ts` (pobranie, autoryzacja, walidacja domenowa, update).
3. Dodać obsługę PATCH w `src/pages/api/event/[id].ts`.
4. Przygotować testy jednostkowe dla walidatora i serwisu (różne role, błędne statusy, daty w przeszłości).
5. Uruchomić linter/testy oraz zaktualizować dokumentację API.
