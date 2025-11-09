# API Endpoint Implementation Plan: DELETE /api/events/{eventId}/signups/{signupId}

## 1. Przegląd punktu końcowego

Pozwala użytkownikowi wycofać zapis z wydarzenia. Gracz może wycofać własny zapis, organizator lub administrator może usunąć dowolny zapis w danym wydarzeniu.

## 2. Szczegóły żądania

- Metoda HTTP: `DELETE`
- Struktura URL: `/api/events/{eventId}/signups/{signupId}`
- Parametry:
  - Wymagane: `eventId`, `signupId` (parametry ścieżki, dodatnie liczby całkowite)
  - Opcjonalne (query): brak
- Request Body: brak

## 3. Wykorzystywane typy

- Reużycie `EventSignupDTO` (do ewentualnych logów lub odpowiedzi roboczej)
- Dedykowany model komend `DeleteEventSignupCommand` (opcjonalny alias w serwisie)

## 3. Szczegóły odpowiedzi

- `204 No Content` dla sukcesu (brak body)
- `401 Unauthorized` gdy brak sesji
- `403 Forbidden` gdy brak uprawnień do wycofania zapisu
- `404 Not Found` gdy wydarzenie lub zapis nie istnieje albo nie przynależy do użytkownika
- `500 Internal Server Error` dla nieoczekiwanych błędów

## 4. Przepływ danych

1. Handler `DELETE` w `src/pages/api/events/[eventId]/signups/[signupId].ts`.
2. Walidacja parametrów ścieżki (Zod).
3. Serwis `eventSignupsService.deleteEventSignup({ eventId, signupId, actor })`:
   - Pobiera zapis wraz z `event_id` i `player_id`.
   - Jeśli rola `player`, weryfikuje, że zapis należy do `actor.player_id`.
   - Organizator może usuwać zapisy tylko dla własnych wydarzeń; admin dowolne.
   - W transakcji:
     - Aktualizuje `event_signups` ustawiając `status = 'withdrawn'` i `resignation_timestamp = now()` lub fizycznie usuwa rekord (`delete`). Preferowane podejście: aktualizacja statusu, by zachować historię.
     - Dekrementuje `events.current_signups_count` gdy status zmienia się z `pending/confirmed`.
   - Opcjonalnie zapisuje wpis w `audit_logs` (`event_signup_deleted`).
4. Handler zwraca status `204` bez body.

## 5. Względy bezpieczeństwa

- Walidacja uprawnień w serwisie (gracz może tylko swój zapis, organizator tylko własne wydarzenie).
- Spójność z RLS: usunięcie/aktualizacja wykonywane przez użytkownika z właściwą rolą.
- Upewnienie się, że brak możliwości manipulacji `eventId` / `signupId` (sprawdzamy powiązanie w serwisie).

## 6. Obsługa błędów

- Próba usunięcia zapisu innego gracza przez zwykłego gracza → `403` z kodem `not_allowed`.
- Brak rekordu → `404`.
- Konflikty transakcyjne lub problemy Supabase → `500` (zalogowane).

## 7. Rozważania dotyczące wydajności

- Operacja na pojedynczym rekordzie; kluczowe by ograniczyć liczbę zapytań (połączenie pobrania i walidacji w jednym zapytaniu `select`).
- W przypadku aktualizacji statusu zamiast usuwania fizycznego można wykorzystać indeks `idx_event_signups_status` dla raportów.
- Dekrementacja liczników w tej samej transakcji zapobiega niespójności.

## 8. Etapy wdrożenia

1. Przygotować schemat walidacji parametrów (`eventId`, `signupId`).
2. Rozszerzyć serwis `eventSignupsService` o metodę `deleteEventSignup` z logiką uprawnień i aktualizacji statusu/licznika.
3. Zaimplementować handler `DELETE` w `src/pages/api/events/[eventId]/signups/[signupId].ts` zwracający `204`.
4. Dodać testy (wycofanie własnego zapisu, brak uprawnień, brak rekordu).
5. Zaimplementować logowanie błędów oraz (opcjonalnie) wpisy audytowe.
6. Uaktualnić dokumentację.
