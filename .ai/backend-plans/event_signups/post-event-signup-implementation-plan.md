# API Endpoint Implementation Plan: POST /api/events/{eventId}/signups

## 1. Przegląd punktu końcowego

Pozwala graczowi zapisać się na wydarzenie lub organizatorowi dodać konkretnego gracza. Aktualizuje licznik zapisów i zwraca nowo utworzony rekord zapisu.

## 2. Szczegóły żądania

- Metoda HTTP: `POST`
- Struktura URL: `/api/events/{eventId}/signups`
- Parametry:
  - Wymagane: `eventId` (parametr ścieżki, dodatnia liczba całkowita)
  - Opcjonalne (query): brak
- Request Body (`application/json`):
  - Organizatorki/admini: `{ "player_id": number }`
  - Zalogowany gracz bez `player_id` w body → wykorzystać powiązanie z kontem (`user.player_id`)

## 3. Wykorzystywane typy

- `CreateEventSignupCommand`
- `EventSignupDTO`
- `EventStatus`, `SignupStatus` (enumy walidacyjne)
- Potencjalny `CreateEventSignupPayloadSchema` (Zod) mapujący na `CreateEventSignupCommand`

## 3. Szczegóły odpowiedzi

- `201 Created` zwraca `EventSignupDTO`
- `400 Bad Request` dla błędnych danych wejściowych lub naruszenia ograniczeń (np. brak `player_id` dla organizatora)
- `401 Unauthorized` gdy brak sesji
- `403 Forbidden` gdy rola nie ma uprawnień (np. inny gracz próbujący dodać innego gracza)
- `404 Not Found` gdy wydarzenie nie istnieje lub gracz nie istnieje
- `409 Conflict` gdy gracz jest już zapisany
- `500 Internal Server Error` dla błędów niespodziewanych

## 4. Przepływ danych

1. Handler `POST` w `src/pages/api/events/[eventId]/signups.ts`.
2. Pobranie `SupabaseClient` oraz `locals.session` / `locals.user`.
3. Walidacja `eventId` oraz payloadu Zod-em (`createEventSignupSchema`).
4. Serwis `eventSignupsService.createEventSignup({ eventId, actor, body })`:
   - Ładuje wydarzenie i waliduje status (`active`) oraz brak soft delete (`deleted_at IS NULL`).
   - Sprawdza role: gracz → używa własnego `player_id`; organizator/admin → może podać dowolnego `player_id`.
   - Weryfikuje istnienie gracza oraz brak wcześniejszego zapisu (UNIQUE constraint, pre-check zapytaniem).
   - W transakcji: wstawia rekord do `event_signups` (`insert`) i zwiększa `events.current_signups_count`.
   - Zwraca powstały rekord jako `EventSignupDTO`.
5. Handler zwraca `201` z obiektem DTO.
6. W przypadku błędów biznesowych rzucane są dedykowane wyjątki mapowane na odpowiednie statusy.
7. Logowanie audytowe: zapis w `audit_logs` z akcją `event_signup_created` (opcjonalny krok serwisowy).

## 5. Względy bezpieczeństwa

- Autoryzacja obowiązkowa; używamy danych z tokena JWT (rola, user_id, powiązany `player_id`).
- Rola `player` może tworzyć zapisy tylko dla siebie.
- Rola `organizer` może dodawać zapis tylko do wydarzenia, które organizuje.
- Rola `admin` ma pełen dostęp.
- Zapewnienie braku eskalacji przez walidację `player_id` oraz potwierdzenie własności wydarzenia.

## 6. Obsługa błędów

- Naruszenie limitu miejsc (`current_signups_count >= max_places`) → `400` z komunikatem „event_full”.
- Próba zapisu na wydarzenie nieaktywne (`status != active`) → `400` „event_not_active”.
- Brak powiązanego gracza z kontem → `400` „player_profile_required”.
- Konflikt unikalności → `409` „already_signed_up”.
- Wszystkie błędy Supabase logować (`logger.error`) i mapować na `500` jeśli nie są rozpoznane.

## 7. Rozważania dotyczące wydajności

- Korzystać z istniejących indeksów (`event_id`, `player_id`).
- Aktualizację licznika realizować w tej samej transakcji, aby uniknąć niespójności.
- Minimalizować liczbę round-tripów: np. użyć funkcji RPC lub transakcji w Supabase (multi-step z `supabase.rpc` lub `supabase.transaction`).

## 8. Etapy wdrożenia

1. Przygotować schemat Zod dla payloadu oraz funkcje pomocnicze do sprawdzania ról użytkownika.
2. Rozszerzyć serwis `eventSignupsService` o metodę `createEventSignup` z obsługą walidacji i transakcji.
3. Zaimplementować handler `POST` w `src/pages/api/events/[eventId]/signups.ts`, korzystający z serwisu i wspólnego handlera błędów.
4. Dodać logowanie audytowe w serwisie (jeżeli polityka projektu tego wymaga) oraz error logging.
5. Napisać testy: scenariusze happy path, pełny event, brak uprawnień, konflikt zapisu.
6. Zaktualizować dokumentację API / kontrakty.
