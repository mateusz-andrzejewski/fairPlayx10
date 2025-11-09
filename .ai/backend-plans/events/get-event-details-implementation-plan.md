# API Endpoint Implementation Plan: GET /api/events/{id}

## 1. Przegląd punktu końcowego

- Cel: zwrócić szczegóły pojedynczego wydarzenia wraz z listą zapisów (`signups`).
- Warstwa HTTP: `src/pages/api/events/[id].ts` (Astro endpoint, `export const prerender = false`).
- Logika biznesowa: funkcja `getEventById` w `src/lib/services/events.service.ts`.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Struktura URL: `/api/events/{id}`
- Parametry:
  - Wymagane: `id` (parametr ścieżki, dodatnia liczba całkowita)
  - Opcjonalne: brak
- Request Body: brak
- Nagłówki: `Authorization: Bearer <JWT>`

## 3. Wykorzystywane typy

- `EventDetailDTO`, `EventSignupDTO`, `EventDTO` z `src/types.ts`
- Walidator `eventIdParamSchema` w `src/lib/validation/events.ts`

## 3. Szczegóły odpowiedzi

- 200: JSON `EventDetailDTO`
- 400: `{ error: "validation_error", message }`
- 401: `{ error: "unauthorized", message }`
- 403: `{ error: "forbidden", message }` (jeśli polityka ról ogranicza dostęp)
- 404: `{ error: "not_found", message }`
- 500: `{ error: "internal_error", message }`

## 4. Przepływ danych

1. Handler pobiera `locals.supabase` i bieżącego użytkownika.
2. Waliduje `params.id` przy użyciu `eventIdParamSchema`.
3. Weryfikuje autoryzację (rola `user`/`organizer`/`admin`; dodatkowa kontrola własności jeśli wymagana).
4. Wywołuje `getEventById(supabase, id)`.
5. Serwis pobiera event z tabeli `events` (filtr `deleted_at IS NULL`) oraz zagnieżdżone `event_signups` poprzez Supabase `select` z relacjami.
6. Po otrzymaniu danych mapuje rekord na `EventDetailDTO`; w przypadku braku wyniku zwraca `null`.
7. Handler zwraca odpowiednio 404 (gdy `null`) lub 200 z `EventDetailDTO`.

## 5. Względy bezpieczeństwa

- Wymagane uwierzytelnienie; rozważyć ograniczenie do organizatora wydarzenia lub admina.
- `deleted_at IS NULL` chroni przed ujawnianiem usuniętych eventów.
- Minimalny zestaw pól `signups` (ID, status, timestamp) bez wrażliwych danych.
- Brak body, więc brak ryzyka payload injection; wciąż walidujemy `id`.

## 6. Obsługa błędów

- Błędny format `id` → 400.
- Brak tokenu → 401.
- Brak uprawnień → 403 (lub 404, jeśli polityka maskuje istnienie zasobu).
- Event nie istnieje / został usunięty → 404.
- Błąd Supabase → log + 500.

## 7. Rozważania dotyczące wydajności

- Indeks na `id` i `deleted_at` zapewnia szybkie wyszukiwanie.
- Dla dużych list zapisów rozważyć paginację w przyszłości; obecnie pełne pobranie.
- Ewentualny caching krótkoterminowy (np. 30s) dla popularnych eventów.

## 8. Etapy wdrożenia

1. Dodać `eventIdParamSchema` do `src/lib/validation/events.ts`.
2. Zaimplementować `getEventById` w `src/lib/services/events.service.ts` (zapytanie + mapowanie DTO).
3. W pliku `src/pages/api/events/[id].ts` zaimplementować handler GET z walidacją, autoryzacją i obsługą 404.
4. Przygotować testy jednostkowe dla walidatora i serwisu (mock Supabase).
5. Uruchomić linter/testy oraz zaktualizować dokumentację API.
