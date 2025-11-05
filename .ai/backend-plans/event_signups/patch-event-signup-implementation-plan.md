# API Endpoint Implementation Plan: PATCH /api/events/{eventId}/signups/{signupId}

## 1. Przegląd punktu końcowego

Aktualizuje status istniejącego zapisu, np. zatwierdzenie lub oznaczenie jako wycofany. Dostępny dla organizatora danego wydarzenia i administratora.

## 2. Szczegóły żądania

- Metoda HTTP: `PATCH`
- Struktura URL: `/api/events/{eventId}/signups/{signupId}`
- Parametry:
  - Wymagane: `eventId`, `signupId` (parametry ścieżki, dodatnie liczby całkowite)
  - Opcjonalne (query): brak
- Request Body (`application/json`): `{ "status": "pending" | "confirmed" | "withdrawn" }`

## 3. Wykorzystywane typy

- `UpdateEventSignupCommand`
- `EventSignupDTO`
- `SignupStatus` enum (ograniczenie domyślne)
- Schemat Zod `updateEventSignupSchema`

## 3. Szczegóły odpowiedzi

- `200 OK` zwraca zaktualizowany `EventSignupDTO`
- `400 Bad Request` gdy status nieprawidłowy lub niedozwolona zmiana
- `401 Unauthorized` gdy brak sesji
- `403 Forbidden` przy braku uprawnień
- `404 Not Found` gdy wydarzenie lub zapis nie istnieje (lub nie należy do wydarzenia)
- `500 Internal Server Error` dla nieoczekiwanych błędów

## 4. Przepływ danych

1. Handler `PATCH` w `src/pages/api/events/[eventId]/signups/[signupId].ts`.
2. Walidacja parametrów i body przy użyciu Zod.
3. Serwis `eventSignupsService.updateEventSignupStatus({ eventId, signupId, status, actor })`:
   - Pobiera zapis (JOIN z `events` w celu potwierdzenia `event_id`).
   - Sprawdza uprawnienia aktora (organizator wydarzenia lub admin).
   - Waliduje dozwolone przejścia statusów (np. `pending -> confirmed|withdrawn`, `confirmed -> withdrawn`, brak powrotu do `pending`).
   - Aktualizuje rekord (`update`) i ustawia `resignation_timestamp` gdy status = `withdrawn`.
   - W razie zmiany na `withdrawn` aktualizuje `events.current_signups_count` (dekrementacja w transakcji).
4. Handler zwraca `200` z nowym stanem.
5. Wrzuca wpis audytowy (`audit_logs`) opisujący zmianę statusu (opcjonalnie, jeśli polityka).

## 5. Względy bezpieczeństwa

- Sprawdzenie roli (organizer wydarzenia / admin) po stronie serwisu.
- Weryfikacja, że `signupId` należy do `eventId` by zapobiec IDOR.
- RLS Supabase wymaga roli; zapytania powinny działać w roli użytkownika. Jeśli potrzebne rozszerzone uprawnienia, rozważyć `service role` wykonywaną na backendzie.

## 6. Obsługa błędów

- Niepoprawny status → `400` z kodem `invalid_status`.
- Niedozwolone przejście statusu → `400` `invalid_status_transition`.
- Brak zapisu → `404`.
- Brak uprawnień → `403`.
- Błędy aktualizacji (np. konflikt transakcji) → logowanie + `500`.

## 7. Rozważania dotyczące wydajności

- Operacja na pojedynczym rekordzie – koszt niski.
- Transakcja łączona (update signup + ewentualna dekrementacja licznika) zapewnia spójność.
- Ograniczyć liczbę zapytań: wczytać zapis z `select(...).maybeSingle()` i na jego podstawie warunkowo wykonywać kolejne kroki.

## 8. Etapy wdrożenia

1. Dodać schemat walidacyjny Zod dla parametrów i body.
2. Dodać metodę `updateEventSignupStatus` w serwisie z logiką walidacji przejść i aktualizacji liczników.
3. Zaimplementować handler `PATCH` w `src/pages/api/events/[eventId]/signups/[signupId].ts` z obsługą wyjątków.
4. Dodać testy jednostkowe serwisu oraz testy API (zmiana statusu, brak uprawnień, błędny status).
5. Zapewnić logowanie błędów oraz ewentualny wpis audytowy.
6. Zaktualizować dokumentację API.

