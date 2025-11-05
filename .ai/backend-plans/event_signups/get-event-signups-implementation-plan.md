# API Endpoint Implementation Plan: GET /api/events/{eventId}/signups

## 1. Przegląd punktu końcowego

Zwraca paginowaną listę zapisów na konkretne wydarzenie z możliwością filtrowania po statusie. Dostępny dla organizatorów danego wydarzenia oraz administratorów.

## 2. Szczegóły żądania

- Metoda HTTP: `GET`
- Struktura URL: `/api/events/{eventId}/signups`
- Parametry:
  - Wymagane: `eventId` (parametr ścieżki, dodatnia liczba całkowita)
  - Opcjonalne (query): `page` (domyślnie 1), `limit` (domyślnie 20, max np. 100), `status` (`pending` | `confirmed` | `withdrawn`)
- Request Body: brak

## 3. Wykorzystywane typy

- `ListEventSignupsQueryParams` – reprezentacja zapytań paginacyjnych i filtrujących
- `EventSignupsListResponseDTO` / `PaginatedDataDTO<EventSignupDTO>` – docelowa odpowiedź
- `EventSignupDTO` – element listy
- `PaginationMetaDTO` – metadane paginacji

## 3. Szczegóły odpowiedzi

- `200 OK` zwraca `EventSignupsListResponseDTO`
- `401 Unauthorized` gdy brak sesji
- `403 Forbidden` gdy użytkownik nie jest organizatorem wydarzenia ani administratorem
- `404 Not Found` gdy wydarzenie nie istnieje lub użytkownik nie ma do niego dostępu
- `500 Internal Server Error` dla nieoczekiwanych błędów

## 4. Przepływ danych

1. API route `src/pages/api/events/[eventId]/signups.ts` wywołuje handler `GET`.
2. Z kontekstu (`locals`) pobieramy SupabaseClient oraz informację o użytkowniku/rolach.
3. Walidujemy `eventId` i query przez Zod (`ListEventSignupsQuerySchema`).
4. Serwis `eventSignupsService.listEventSignups(eventId, params, contextUser)` (nowy plik `src/lib/services/event-signups.service.ts`) wykonuje logikę:
   - Sprawdza istnienie wydarzenia i uprawnienia organizatora (np. zapytanie po `events.id` oraz `organizer_id`).
   - Buduje zapytanie do `event_signups` z filtrem `event_id = eventId`, status (jeśli dostarczony) i paginacją (`range` Supabase).
   - Pobiera liczbę rekordów do `total` (np. `select(..., { count: 'exact', head: true })`).
   - Mapuje rekordy do `EventSignupDTO`.
5. Handler składa odpowiedź `200` wraz z metadanymi paginacji.
6. W przypadku błędów biznesowych rzuca kontrolowane wyjątki (np. `NotFoundError`, `ForbiddenError`) obsługiwane przez wspólną warstwę.

## 5. Względy bezpieczeństwa

- Wymagana autoryzacja JWT: pobieramy z `locals.session`.
- Sprawdzamy rolę: tylko `admin` albo organizator wskazanego `eventId`.
- Weryfikujemy, że `signupId` nie jest ujawniane bez przynależności do wydarzenia (brak IDOR).
- Zgodność z RLS: zapytania Supabase działają w kontekście użytkownika, zastępczo dokonywana jest wcześniejsza walidacja uprawnień by uniknąć `403`/`404` wynikających z RLS.

## 6. Obsługa błędów

- Walidacja parametrów zwraca `400` z kodem błędu i opisem.
- Brak uprawnień → `403`.
- Nieistniejące wydarzenie lub brak dostępu → `404`.
- Błędy Supabase (np. problemy sieciowe) logowane i propagowane jako `500` z generowanym identyfikatorem korelacji.

## 7. Rozważania dotyczące wydajności

- Użycie indeksu `idx_event_signups_event_timestamp` przy sortowaniu po `signup_timestamp`.
- Limit górny (np. 100) dla `limit`, by uniknąć dużych wolumenów.
- Możliwość wykorzystania konfigurowalnego czasu buforowania HTTP (Etag/Last-Modified) dla przyszłych optymalizacji – na razie brak cache ze względu na prywatne dane.

## 8. Etapy wdrożenia

1. Dodać schematy Zod (`eventIdParamSchema`, `listEventSignupsQuerySchema`) w dedykowanym module walidacji.
2. Stworzyć serwis `eventSignupsService` z metodą `listEventSignups` wykorzystującą Supabase.
3. Zaimplementować handler `GET` w `src/pages/api/events/[eventId]/signups.ts` korzystający z serwisu i wspólnego formattera odpowiedzi.
4. Dodać testy jednostkowe serwisu (mock Supabase) oraz testy kontraktowe API (np. Vitest) sprawdzające paginację i filtrację.
5. Upewnić się, że logowanie błędów delegowane jest do centralnego loggera (np. `logger.error`).
6. Zaktualizować dokumentację OpenAPI / README jeśli istnieje.

