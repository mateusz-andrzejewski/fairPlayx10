# API Endpoint Implementation Plan: POST /api/events/{eventId}/teams

## 1. Przegląd punktu końcowego

Pozwala organizatorom i administratorom ręcznie przypisać uczestników wydarzenia do drużyn, tworząc lub aktualizując rekordy w `team_assignments` na podstawie dostarczonych `signup_id` oraz numerów drużyn.

## 2. Szczegóły żądania

- Metoda HTTP: `POST`
- Struktura URL: `/api/events/{eventId}/teams`
- Parametry:
  - Wymagane: `eventId` (parametr ścieżki, dodatnia liczba całkowita)
  - Opcjonalne: brak parametrów query
- Request Body (`application/json`):
  - `assignments` – tablica obiektów, gdzie każdy zawiera:
    - `signup_id` (wymagany, integer > 0)
    - `team_number` (wymagany, integer > 0)

## 3. Wykorzystywane typy

- `ManualTeamAssignmentEntry` – element wejściowy pojedynczego przypisania
- `CreateTeamAssignmentsCommand` – komenda z tablicą przypisań
- `TeamAssignmentDTO` – wynikowe rekordy zapisane w bazie

```170:175:src/types.ts
export type ManualTeamAssignmentEntry = Pick<TeamAssignmentRow, "signup_id" | "team_number">;

export interface CreateTeamAssignmentsCommand {
  assignments: ManualTeamAssignmentEntry[];
}
```

## 3. Szczegóły odpowiedzi

- `201 Created` z tablicą utworzonych/zanowionych rekordów `TeamAssignmentDTO`
- `400 Bad Request` dla błędnej walidacji lub niespójności danych
- `401 Unauthorized` gdy brak sesji
- `403 Forbidden` gdy użytkownik nie ma uprawnień
- `404 Not Found` gdy wydarzenie nie istnieje lub zapisy nie należą do wydarzenia
- `500 Internal Server Error` dla błędów Supabase lub wewnętrznych

## 4. Przepływ danych

1. Handler `POST` w `src/pages/api/events/[eventId]/teams.ts` (wspólny plik z `GET`, rozróżnienie po metodzie).
2. Z `context.locals` pobieramy `supabase`, aktualnego użytkownika, IP.
3. Walidujemy `eventId` oraz body przez Zod (`createTeamAssignmentsSchema`) – m.in. minimalna liczba elementów, unikalność `signup_id`, dodatnie `team_number`.
4. Wywołujemy `teamAssignmentsService.setManualAssignments(eventId, command, authContext)` w `src/lib/services/team-assignments.service.ts`.
5. Serwis:
   - Potwierdza uprawnienia (admin lub organizer wydarzenia) i istnienie wydarzenia.
   - Pobiera z `event_signups` zestaw `signup_id` należących do wydarzenia, filtrując statusy (np. ignorując `withdrawn`) i zapewniając zgodność z dostarczonymi ID.
   - Weryfikuje, czy żaden z `team_number` nie narusza ograniczeń logiki biznesowej (np. zdefiniowana liczba drużyn, brak zerowych wartości).
   - Wykonuje operację aktualizacji w `team_assignments`: usuwa bieżące przypisania dla przekazanych `signup_id`, następnie dokonuje zbiorczego `upsert` (z aktualizacją `assignment_timestamp`).
   - Rejestruje wpis w `audit_logs` (`team_assigned`/`team_reassigned`) z listą zmian oraz identyfikatorem użytkownika.
6. Handler zwraca `201` z listą aktualnych przypisań dla przekazanych `signup_id`.

## 5. Względy bezpieczeństwa

- Autoryzacja oparta na sesji Supabase; brak sesji → `401`.
- Uprawnienia: tylko `admin` lub organizer wydarzenia może ustawiać przypisania.
- Sprawdzamy, czy wszystkie `signup_id` należą do wydarzenia (ochrona przed IDOR).
- Walidujemy `team_number` (dodatni) i długość tablicy, aby zapobiegać manipulacji i przeciążeniom.
- Ograniczamy odpowiedź do wymaganych pól DTO.

## 6. Obsługa błędów

- Niepoprawny JSON/struktura → `400` z komunikatem walidacyjnym.
- `signup_id` spoza wydarzenia → `404` (lub `400`, w zależności od przyjętej polityki); komunikat wskazuje problematyczne ID.
- Duplikaty `signup_id` → `400` z listą duplikatów.
- Konflikty RLS lub brak uprawnień → `403`.
- Błędy Supabase podczas operacji zbiorczych → `500`, logowane w centralnym loggerze z identyfikatorem korelacji.

## 7. Rozważania dotyczące wydajności

- Używamy zbiorczego `upsert` zamiast pojedynczych wywołań.
- Walidacje wykonujemy w aplikacji, aby zminimalizować round-trip do bazy w razie błędów.
- Przy dużych tablicach można wprowadzić limit (np. 100 przypisań na żądanie) – do rozważenia i komunikacji w dokumentacji.
- Indeks `idx_team_assignments_signup` przyspiesza wyszukiwanie i aktualizację.

## 8. Etapy wdrożenia

1. Zdefiniować schemat Zod `createTeamAssignmentsSchema` (w tym sprawdzanie duplikatów) oraz `eventIdParamSchema`.
2. Rozbudować `team-assignments.service.ts` o metodę `setManualAssignments` z obsługą Supabase i audytu.
3. Dodać obsługę metody `POST` w `src/pages/api/events/[eventId]/teams.ts`, wykorzystując nowy serwis.
4. Przygotować testy jednostkowe serwisu (scenariusze: brak uprawnień, duplikaty, brakujący signup, sukces) oraz testy kontraktowe API.
5. Zapewnić logowanie (info/error) i wpisy do `audit_logs`, uwzględniające listę zmienionych przypisań.
6. Uaktualnić dokumentację API i komunikaty w UI dotyczące ograniczeń/formatu danych.

