# API Endpoint Implementation Plan: GET /api/dashboard

## 1. Przegląd punktu końcowego

Zwrotny endpoint pulpitu dostarcza agregację danych kontekstowych dla zalogowanego użytkownika, obejmując profil, nadchodzące wydarzenia, własne zapisy, wydarzenia organizowane oraz – dla administratorów – liczbę oczekujących użytkowników.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Struktura URL: `/api/dashboard`
- Parametry:
  - Wymagane: brak
  - Opcjonalne: brak
- Request Body: brak

## 3. Wykorzystywane typy

- `DashboardDTO`, `UserDTO`, `EventDTO`, `EventSignupDTO` z `src/types.ts`
- Lokalne typy pomocnicze w serwisie do mapowania wyników zapytań Supabase (np. projekcje rekordów)

## 4. Szczegóły odpowiedzi

- Kod 200 z payloadem zgodnym z `DashboardDTO`
- Puste listy dla sekcji bez danych
- Pole `pending_users` obecne tylko dla roli `admin`

## 5. Przepływ danych

- Handler Astro odczytuje `supabase` i `user` z `context.locals`
- Walidacja sesji i aktywnego statusu użytkownika
- Równoległe pobranie danych w serwisie `getDashboardData`:
  - `loadUserProfile(userId)`
  - `loadUpcomingEvents(limit = 5)` z filtrami `event_datetime >= now()`, `deleted_at IS NULL`, statusem wydarzenia opublikowanym
  - `loadMySignups(playerId)` z joinem `event_signups` → `events`, pominięcie rezygnacji
  - `loadOrganizedEvents(userId)` tylko dla ról `organizer` / `admin`
  - `loadPendingUsersCount()` tylko dla roli `admin`
- Mapowanie wyników do DTO i zwrot jako JSON

## 6. Względy bezpieczeństwa

- Wymagana autentykacja Supabase (middleware zapewnia obecność sesji)
- Weryfikacja statusu użytkownika (`status !== 'pending'`), w przeciwnym razie `401`
- Kontrola pola `pending_users` wyłącznie dla roli `admin`
- Filtry `deleted_at IS NULL` oraz dopuszczalne statusy wydarzeń chronią przed ujawnieniem ukrytych danych
- Zwracanie wyłącznie pól zdefiniowanych w DTO (brak wrażliwych danych)

## 7. Obsługa błędów

- `401 Unauthorized`: brak sesji, użytkownik nieaktywny lub brak powiązanego profilu
- `404 Not Found`: profil użytkownika nie istnieje pomimo uwierzytelnienia
- `500 Internal Server Error`: błędy Supabase, wyjątki serwisu, problemy mapowania
- Logowanie błędów przez wspólny logger (`logger.error('dashboard.fetch_failed', { userId, cause })`)

## 8. Rozważania dotyczące wydajności

- Równoległe zapytania (`Promise.all`) minimalizują czas odpowiedzi
- Limit 5 pozycji dla nadchodzących wydarzeń redukuje obciążenie
- Selektywne kolumny w zapytaniach zmniejszają zakres transferu danych
- Wsparcie indeksami na `event_datetime`, `organizer_id`, `player_id`, `status`

## 9. Etapy wdrożenia

1. Dodać serwis `src/lib/services/dashboard/dashboard.service.ts` z funkcją `getDashboardData`.
2. Zaimplementować helpery serwisu wykonujące zapytania Supabase z odpowiednimi filtrami i mapowaniami do DTO.
3. Przygotować testy jednostkowe serwisu (jeśli infrastruktura testowa jest dostępna) dla scenariuszy ról i braku `player_id`.
4. Utworzyć / zaktualizować handler `src/pages/api/dashboard.ts`, który korzysta z serwisu oraz waliduje sesję i status użytkownika.
5. Dodać obsługę błędów `401`, `404`, `500` z jednolitymi komunikatami JSON.
6. Zintegrować logowanie błędów w handlerze/serwisie.
7. Wykonać testy ręczne (np. curl/Postman) i zaktualizować dokumentację API.
