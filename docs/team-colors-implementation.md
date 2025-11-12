# Implementacja kolorów koszulek dla drużyn

## Przegląd

Zaimplementowano system kolorów koszulek dla drużyn, który pozwala graczom i organizatorom łatwo identyfikować drużyny podczas meczów. System wprowadza cztery podstawowe kolory: czarny, biały, czerwony i niebieski.

## Zmiany w bazie danych

### Migracje

1. **20251113000000_add_team_colors.sql**
   - Dodano enum `team_color` z wartościami: black, white, red, blue
   - Dodano kolumnę `team_color` do tabeli `team_assignments`
   - Utworzono indeks dla wydajnego filtrowania po kolorach
   - Automatycznie przypisano kolory do istniejących przypisań

2. **20251113000100_update_team_assignments_rls.sql**
   - Zaktualizowano RLS policy dla `team_assignments`
   - Gracze mogą teraz czytać składy wydarzeń, na które są zapisani
   - Zachowano ograniczenia: tylko admin/organizator może modyfikować przypisania

### Kolumna teams_drawn_at

Istniejąca kolumna `teams_drawn_at` w tabeli `events` jest wykorzystywana do określenia, czy składy zostały zatwierdzone i czy powinny być widoczne dla graczy.

## Zmiany w typach TypeScript

### Nowe typy

```typescript
export type TeamColor = "black" | "white" | "red" | "blue";
```

### Zmodyfikowane typy

- **TeamAssignmentDTO**: Dodano `team_color: TeamColor`
- **ManualTeamAssignmentEntry**: Dodano `team_color: TeamColor`
- **TeamDrawTeamDTO**: Dodano `team_color: TeamColor`
- **TeamViewModel**: Dodano `teamColor: TeamColor`
- **PlayerViewModel**: `skillRate` zmieniono na `number | null` (null dla non-admin)
- **EventDTO**: Dodano `teams_drawn_at?: string | null`

## Zmiany w backend

### TeamAssignmentsService

- **setManualAssignments**: Zapisuje `team_color` przy tworzeniu przypisań
- **listAssignments**: 
  - Pobiera `team_color` z bazy
  - Filtruje `skill_rate` poszczególnych graczy dla non-admin użytkowników
  - Admin widzi skill_rate wszystkich graczy, inni otrzymują `null`

### TeamDrawEngine

- **convertToTeamDrawTeams**: Automatycznie przypisuje kolory drużynom cyklicznie na podstawie numeru drużyny (Team 1 → black, Team 2 → white, Team 3 → red, Team 4 → blue, potem cyklicznie)

### Walidacja

- Zaktualizowano `manualTeamAssignmentEntrySchema` w `teamAssignments.ts` aby walidować `team_color` jako enum

## Zmiany w frontend

### Nowy komponent: TeamAssignmentsView

Komponent wyświetlający składy drużyn dla wszystkich użytkowników:

**Lokalizacja**: `src/components/events/TeamAssignmentsView.tsx`

**Funkcjonalność**:
- Pobiera przypisania drużyn z API `/api/events/{eventId}/teams`
- Grupuje graczy według drużyn
- Wyświetla:
  - Numer drużyny
  - Kolor koszulki (z ikoną i tłumaczeniem)
  - Średni skill rate drużyny (dla wszystkich użytkowników)
  - Listę graczy z pozycjami
  - Skill rate poszczególnych graczy (tylko dla admin)
- Responsywny layout (grid 1-3 kolumny)
- Obsługuje loading states i błędy

### Integracja w EventDetails

**Lokalizacja**: `src/components/events/EventDetails.tsx`

TeamAssignmentsView jest wyświetlany:
- Tylko gdy `event.teams_drawn_at !== null` (składy zatwierdzone)
- Po sekcji "Lista uczestników"
- Przed sekcją "Akcje"
- Dla wszystkich ról (player, organizer, admin)

### Zaktualizowane komponenty

#### TeamStats

**Lokalizacja**: `src/components/TeamStats.tsx`

- Dodano wyświetlanie koloru koszulki z ikoną
- Badge z kolorem w nagłówku karty drużyny
- Kolory wizualizowane za pomocą Tailwind classes

#### useDrawTeams

**Lokalizacja**: `src/lib/hooks/useDrawTeams.ts`

- **transformAssignmentsToTeams**: Parsuje `team_color` z API response
- **runDraw**: Mapuje `team_color` z wyniku algorytmu do TeamViewModel
- **confirmTeams**: Wysyła `team_color` przy zapisywaniu przypisań

## Mapowanie kolorów

### Dostępne kolory

| Wartość DB | Nazwa polska | Klasy Tailwind |
|-----------|--------------|----------------|
| `black`   | Czarny       | `bg-gray-900 text-white` |
| `white`   | Biały        | `bg-white text-gray-900 border border-gray-300` |
| `red`     | Czerwony     | `bg-red-600 text-white` |
| `blue`    | Niebieski    | `bg-blue-600 text-white` |

### Auto-przypisywanie kolorów

Algorytm losowania automatycznie przypisuje kolory według wzoru:
```
Team 1 → black
Team 2 → white
Team 3 → red
Team 4 → blue
Team 5 → black (cyklicznie)
...
```

## Uprawnienia i widoczność danych

### Gracze (role: player)

**Widzą**:
- ✅ Składy drużyn (po zatwierdzeniu)
- ✅ Imiona i nazwiska wszystkich graczy
- ✅ Pozycje graczy
- ✅ Kolory koszulek drużyn
- ✅ Średni skill rate drużyny

**Nie widzą**:
- ❌ Skill rate poszczególnych graczy
- ❌ Widoku losowania (DrawTeamsView)

### Organizatorzy (role: organizer)

**Widzą** wszystko co gracze plus:
- ✅ Widok losowania i zarządzania składami
- ❌ Skill rate poszczególnych graczy (ukryte)

### Administratorzy (role: admin)

**Widzą** wszystko:
- ✅ Pełny widok losowania
- ✅ Skill rate wszystkich graczy (indywidualnie i średnie)
- ✅ Wszystkie statystyki

## Flow użytkownika

### Organizator losuje składy

1. Wchodzi do `DrawTeamsView` (/dashboard/events/{id}/draw)
2. Klika "Losuj drużyny"
3. Algorytm automatycznie przypisuje kolory
4. Przegląda wylosowane składy z kolorami (TeamStats)
5. Może ręcznie edytować (DragDropTeams)
6. Klika "Potwierdź składy"
7. Backend zapisuje `team_assignments` z `team_color`
8. Backend ustawia `teams_drawn_at = NOW()`

### Gracz przegląda składy

1. Wchodzi do `EventDetails` (/dashboard/events/{id})
2. Jeśli `teams_drawn_at !== null`, widzi sekcję "Składy drużyn"
3. `TeamAssignmentsView` pobiera dane z API
4. Widzi:
   - Do której drużyny został przypisany
   - Jaki kolor koszulki ma założyć
   - Z kim gra
   - Średni skill rate swojej drużyny
5. NIE widzi skill rate poszczególnych graczy

## API Endpoints

### GET /api/events/{eventId}/teams

**Dostęp**: 
- Admin: pełny dostęp
- Organizer: tylko swoje wydarzenia
- Player: wydarzenia, na które jest zapisany (po aktualizacji RLS)

**Response dla gracza**:
```json
{
  "data": [
    {
      "id": 1,
      "signup_id": 123,
      "team_number": 1,
      "team_color": "black",
      "assignment_timestamp": "2025-11-13T10:00:00Z",
      "player_id": 45,
      "player": {
        "id": 45,
        "first_name": "Jan",
        "last_name": "Kowalski",
        "position": "forward",
        "skill_rate": null  // Ukryte dla graczy
      }
    }
  ]
}
```

**Response dla admina**:
```json
{
  "data": [
    {
      "id": 1,
      "signup_id": 123,
      "team_number": 1,
      "team_color": "black",
      "assignment_timestamp": "2025-11-13T10:00:00Z",
      "player_id": 45,
      "player": {
        "id": 45,
        "first_name": "Jan",
        "last_name": "Kowalski",
        "position": "forward",
        "skill_rate": 8  // Widoczne dla admina
      }
    }
  ]
}
```

## Testowanie

### Scenariusze testowe

1. **Test losowania z kolorami**
   - Zaloguj się jako organizator
   - Utwórz wydarzenie z zapisanymi graczami
   - Losuj drużyny
   - Sprawdź czy każda drużyna ma przypisany kolor
   - Sprawdź czy kolory są cykliczne dla >4 drużyn

2. **Test widoczności dla gracza**
   - Zaloguj się jako gracz
   - Zapisz się na wydarzenie
   - Poczekaj aż organizator wylosuje składy
   - Wejdź w szczegóły wydarzenia
   - Sprawdź czy widzisz sekcję "Składy drużyn"
   - Sprawdź czy widzisz kolor swojej drużyny
   - Sprawdź czy NIE widzisz skill_rate poszczególnych graczy
   - Sprawdź czy widzisz średni skill_rate drużyny

3. **Test uprawnień API**
   - Spróbuj pobrać `/api/events/{eventId}/teams` jako gracz (nie zapisany)
   - Powinien być błąd 403/404
   - Zapisz się na wydarzenie
   - Ponów request - powinien zadziałać
   - Sprawdź czy skill_rate graczy to `null`

4. **Test RLS policy**
   - W Supabase SQL editor jako gracz spróbuj:
   ```sql
   SELECT * FROM team_assignments 
   WHERE signup_id IN (
     SELECT id FROM event_signups WHERE player_id = {twoje_player_id}
   );
   ```
   - Powinno zwrócić tylko przypisania dla twoich wydarzeń

## Migracja danych

Po uruchomieniu migracji:

1. **Regeneracja typów Supabase**:
   ```bash
   npx supabase gen types typescript --local > src/db/database.types.ts
   ```

2. **Istniejące przypisania**: Automatycznie otrzymają kolory zgodnie z algorytmem w migracji

3. **Kompatybilność**: Kod jest kompatybilny wstecz - jeśli `team_color` jest NULL (teoretycznie), używany jest fallback do "black"

## Przyszłe usprawnienia

1. **Wybór kolorów przez organizatora**: Dodać UI do ręcznej zmiany koloru drużyny w DrawTeamsView
2. **Więcej kolorów**: Rozszerzyć enum o dodatkowe kolory (green, yellow, orange, purple)
3. **Ikony koszulek**: Zamienić Badge na faktyczną ikonę koszulki z kolorem
4. **Powiadomienia**: Wysyłać graczom informację o kolorze koszulki w powiadomieniu o losowaniu
5. **Historia**: Zapisywać historię zmian kolorów w audit_logs

## Zgodność z PRD

Implementacja spełnia wymagania z PRD (prd.md):

✅ **US-010**: "Powiadomienia o składach in-app podpięte pod wydarzenie i z ujawnieniem skill rate drużyny, ale nie poszczególnych graczy"
- Skill rate drużyny widoczny dla wszystkich
- Skill rate graczy ukryty dla non-admin

✅ **US-011**: "Podgląd statystyk (widoczne skill rate drużyn, jak i poszczególnych zawodników bo robi to admin)"
- Admin widzi wszystko
- Organizator widzi statystyki drużyn, ale nie indywidualne skill_rate

✅ Wymaganie: "Gracze widzą z kim grają oraz jaki kolor koszulki"
- TeamAssignmentsView pokazuje pełny skład z kolorami
- Responsywny design mobile-first

✅ Wymaganie: "Kolory podstawowe: czarny, biały, czerwony, niebieski"
- Enum z dokładnie tymi kolorami
- Auto-przypisywanie w algorytmie

