# API Endpoint Implementation Plan: DELETE /api/events/{id}

## 1. Przegląd punktu końcowego
- Cel: przeprowadzić soft delete wydarzenia (ustawienie `deleted_at`), dostępne wyłącznie dla administratorów.
- Warstwa HTTP: `src/pages/api/events/[id].ts` (handler DELETE).
- Logika biznesowa: funkcja `softDeleteEvent` w `src/lib/services/events.service.ts`.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: `/api/events/{id}`
- Parametry:
  - Wymagane: `id` (parametr ścieżki, dodatnia liczba całkowita)
  - Opcjonalne: brak
- Request Body: brak
- Nagłówki: `Authorization: Bearer <JWT>`

## 3. Wykorzystywane typy
- Walidator `eventIdParamSchema` w `src/lib/validation/events.ts`
- Lokalne typy wynikowe w serwisie (np. `SoftDeleteOutcome`) dla czytelności kontroli przepływu

## 3. Szczegóły odpowiedzi
- 204: brak treści
- 400: `{ error: "validation_error", message }`
- 401: `{ error: "unauthorized", message }`
- 403: `{ error: "forbidden", message }`
- 404: `{ error: "not_found", message }`
- 500: `{ error: "internal_error", message }`

## 4. Przepływ danych
1. Handler waliduje parametr `id`.
2. Weryfikuje rolę użytkownika (`admin`).
3. Wywołuje `softDeleteEvent(supabase, id)`.
4. Serwis wykonuje update `update({ deleted_at: now, status: 'cancelled' })` z warunkiem `id = ? AND deleted_at IS NULL`.
5. Jeśli brak zaktualizowanego wiersza → zwraca rezultat `notFound`.
6. Handler zwraca 404 w przypadku `notFound`; w przeciwnym razie `new Response(null, { status: 204 })`.

## 5. Względy bezpieczeństwa
- Twarda kontrola roli (tylko `admin`).
- Soft delete zachowuje historię; event nie jest permanentnie usuwany.
- Opcjonalnie logować operację (kto usunął, ID eventu) do centralnego loggera.
- Brak body → brak ryzyka payload injection; wciąż walidujemy `id`.

## 6. Obsługa błędów
- Walidacja parametru → 400.
- Brak tokenu → 401.
- Rola niewystarczająca → 403.
- Event nie istnieje lub już usunięty → 404.
- Błąd Supabase → log + 500.

## 7. Rozważania dotyczące wydajności
- Jedno zapytanie update – minimalne obciążenie.
- Indeks na `(id, deleted_at)` przyspiesza operację.
- Rozważyć asynchroniczne powiadomienia (np. dla zapisanych graczy) w przyszłości.

## 8. Etapy wdrożenia
1. W `src/lib/validation/events.ts` użyć `eventIdParamSchema` (już zdefiniowane) do walidacji path param.
2. Zaimplementować `softDeleteEvent` w `src/lib/services/events.service.ts` (update z warunkiem `deleted_at IS NULL`).
3. W `src/pages/api/events/[id].ts` dodać handler DELETE z autoryzacją i mapowaniem wyników na statusy HTTP.
4. Przygotować testy jednostkowe serwisu (pierwsze usunięcie → sukces, drugie → 404) oraz weryfikację roli.
5. Uruchomić linter/testy i uaktualnić dokumentację API.

