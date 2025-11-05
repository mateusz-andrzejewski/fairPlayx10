# API Endpoint Implementation Plan: POST /api/events/{eventId}/draw

## 1. Przegląd punktu końcowego

Uruchamia algorytm losowania drużyn dla wskazanego wydarzenia, balansując składy na podstawie pozycji i skill rate. Wynik jest zwracany do klienta i wykorzystywany do aktualizacji przypisań w `team_assignments`.

## 2. Szczegóły żądania

- Metoda HTTP: `POST`
- Struktura URL: `/api/events/{eventId}/draw`
- Parametry:
  - Wymagane: `eventId` (parametr ścieżki, dodatnia liczba całkowita)
  - Opcjonalne (body): brak parametrów zapytania
- Request Body (`application/json`):
  - `iterations` (opcjonalny, domyślnie 20) – dodatni integer, maks. np. 200
  - `balance_threshold` (opcjonalny, domyślnie 0.07) – liczba z zakresu 0–1

## 3. Wykorzystywane typy

- `RunTeamDrawCommand` – struktura wejściowa z parametrami algorytmu
- `TeamDrawResultDTO`, `TeamDrawTeamDTO`, `TeamDrawPlayerDTO`, `TeamDrawStatsDTO` – wynik algorytmu
- `TeamAssignmentDTO` – reprezentacja zapisanych przypisań po losowaniu

```172:207:src/types.ts
export interface CreateTeamAssignmentsCommand {
  assignments: ManualTeamAssignmentEntry[];
}

export interface RunTeamDrawCommand {
  iterations: number;
  balance_threshold: number;
}

export interface TeamDrawPlayerDTO {
  player_id: PlayerRow["id"];
  player_name: string;
  position: PlayerRow["position"];
  skill_rate: PlayerRow["skill_rate"];
}

export interface TeamDrawStatsDTO {
  avg_skill_rate: number;
  positions: Partial<Record<PlayerPosition, number>>;
}

export interface TeamDrawTeamDTO {
  team_number: TeamAssignmentRow["team_number"];
  players: TeamDrawPlayerDTO[];
  stats: TeamDrawStatsDTO;
}

export interface TeamDrawResultDTO {
  success: boolean;
  teams: TeamDrawTeamDTO[];
  balance_achieved: boolean;
}
```

## 3. Szczegóły odpowiedzi

- `200 OK` z ciałem `TeamDrawResultDTO`
- `400 Bad Request` dla błędnej walidacji lub niewystarczających danych do budowy drużyn
- `401 Unauthorized` gdy brak sesji
- `403 Forbidden` gdy użytkownik nie jest organizatorem wydarzenia ani administratorem
- `404 Not Found` gdy wydarzenie nie istnieje lub użytkownik nie ma do niego dostępu
- `500 Internal Server Error` w przypadku błędów algorytmu lub operacji na bazie

## 4. Przepływ danych

1. Handler `POST` w `src/pages/api/events/[eventId]/draw.ts`.
2. Z `context.locals` pobieramy `supabase`, aktualnego użytkownika (JWT), IP do audytu.
3. Walidujemy `eventId` oraz body przez Zod (`teamDrawCommandSchema`) – ustawiamy wartości domyślne, wymuszamy zakresy (`iterations >= 1`, `balance_threshold` ∈ [0, 1]).
4. Wywołujemy `teamAssignmentsService.runDraw(eventId, command, authContext)` w nowym pliku `src/lib/services/team-assignments.service.ts`.
5. Serwis:
   - Weryfikuje rolę użytkownika (admin lub organizer przypisany do wydarzenia) i istnienie wydarzenia (`events`), dodatkowo może ograniczyć operację do statusów `active`/`completed`.
   - Pobiera potwierdzone zapisy (`event_signups` o statusie `confirmed`) wraz z powiązanymi danymi graczy (`players`).
   - Sprawdza, czy liczba zapisów pozwala na utworzenie co najmniej dwóch drużyn; w przeciwnym wypadku zgłasza `ValidationError`.
   - Przekazuje dane do modułu algorytmu (np. `src/lib/services/team-draw.engine.ts`) implementującego heurystykę balansowania (iteracyjne tasowanie, obliczanie odchylenia skill rate i rozkładu pozycji).
   - Otrzymane drużyny zamienia na przypisania (`signup_id`, `team_number`).
   - W ramach jednej operacji Supabase usuwa dotychczasowe przypisania dla wskazanych zapisów, po czym wstawia nowe (`insert`) i zwraca wynik w formacie DTO.
   - Dodaje wpis do `audit_logs` (`team_assigned` lub `team_reassigned` w zależności od wcześniejszego stanu) z informacją o parametrach algorytmu i identyfikatorze akcji.
6. Handler zwraca `TeamDrawResultDTO`, a w przypadku błędów mapuje wyjątki na odpowiednie kody.

## 5. Względy bezpieczeństwa

- Autoryzacja wymagana: tylko `admin` lub organizer wydarzenia może uruchomić losowanie.
- Walidujemy, że algorytm operuje wyłącznie na zapisach danego wydarzenia (ochrona przed IDOR).
- W `audit_logs` przechowujemy identyfikator użytkownika, parametry wejściowe oraz listę wygenerowanych drużyn (skrótowo), aby zachować ślad działań.
- Sanitizujemy dane wejściowe (Zod) i ograniczamy zakresy wartości, aby przeciwdziałać atakom DoS (np. bardzo duża liczba iteracji).

## 6. Obsługa błędów

- Błędne dane wejściowe (`iterations <= 0`, `balance_threshold` poza zakresem, brak potwierdzonych zapisów) → `400`.
- Brak uprawnień → `403`.
- Wydarzenie nie znalezione/ niedostępne → `404`.
- Problemy podczas zapisu w `team_assignments` → logowanie (`logger.error`) i odpowiedź `500`.
- Błędy algorytmu (np. nieudane balansowanie) → `400` z komunikatem, zawierającym wskazanie na powód (np. zbyt mało graczy).

## 7. Rozważania dotyczące wydajności

- Ograniczamy maksymalną liczbę iteracji (np. 200) i rozmiar drużyn, aby zapobiec długiemu czasu działania.
- Operujemy na danych w pamięci aplikacji po jednorazowym pobraniu z Supabase (minimalizacja liczby zapytań).
- Wstawianie do `team_assignments` wykonujemy zbiorczo (`upsert`/`insert` z tablicą obiektów) zamiast pojedynczych żądań.
- Monitorujemy czas działania algorytmu i logujemy metryki (np. `iterations_used`, `balance_score`).

## 8. Etapy wdrożenia

1. Zdefiniować schemat Zod `teamDrawCommandSchema` (opcjonalne wartości z domyślnymi limitami) i `eventIdParamSchema`.
2. Rozszerzyć `team-assignments.service.ts` o metodę `runDraw`, w tym integrację z Supabase i audytem.
3. Utworzyć moduł algorytmu (np. `team-draw.engine.ts`) z testowalną funkcją `computeBalancedTeams(signups, command)`.
4. Zaimplementować handler `POST` w `src/pages/api/events/[eventId]/draw.ts` używający serwisu i mapowania błędów.
5. Dodać testy: jednostkowe dla algorytmu (różne rozkłady skill rate), integracyjne dla serwisu (mock Supabase), kontraktowe dla API.
6. Ustawić logowanie błędów i metryk (np. `logger.info` z czasem wykonania), dodać wpisy do `audit_logs`.
7. Zaktualizować dokumentację (OpenAPI/README) i podkreślić limity parametrów.

