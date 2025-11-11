# Plan implementacji widoku losowania drużyn

## 1. Przegląd

Widok losowania drużyn umożliwia organizatorom i administratorom uruchomienie automatycznego algorytmu losowania składów drużyn dla wybranego wydarzenia lub dokonanie manualnej korekty składów poprzez interfejs drag-and-drop. Głównym celem jest zapewnienie sprawiedliwego podziału graczy na podstawie ich pozycji i poziomu umiejętności (skill rate), z możliwością ręcznej interwencji w przypadku, gdy algorytm nie osiągnie optymalnego balansu. Widok wyświetla statystyki drużyn, takie jak średni skill rate i rozkład pozycji, oraz obsługuje powiadomienia o wynikach losowania.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/dashboard/events/{id}/draw`, gdzie `{id}` to identyfikator wydarzenia. Dostęp ograniczony do użytkowników z rolami organizatora lub administratora.

## 3. Struktura komponentów

- **DrawTeamsView**: Główny komponent widoku, zarządza stanem aplikacji i renderuje podkomponenty.
  - **TeamStats**: Podkomponent wyświetlający statystyki drużyn (średni skill rate, pozycje).
  - **DrawButton**: Podkomponent z przyciskiem uruchomienia algorytmu losowania.
  - **DragDropTeams**: Podkomponent z interfejsem drag-and-drop do manualnej edycji składów drużyn.
    - **TeamColumn**: Podkomponent reprezentujący pojedynczą drużynę w interfejsie drag-and-drop.
    - **PlayerCard**: Podkomponent reprezentujący kartę gracza do przeciągania.

## 4. Szczegóły komponentów

### DrawTeamsView

- **Opis komponentu**: Główny komponent widoku, odpowiedzialny za inicjalizację danych wydarzenia, zarządzanie stanem drużyn oraz obsługę interakcji użytkownika. Składa się z paska nawigacyjnego, sekcji statystyk, przycisku losowania i obszaru drag-and-drop. Używa customowego hooka do pobierania i aktualizacji danych.
- **Główne elementy**: `<div>` kontener z `<h1>` tytułem, komponentami TeamStats, DrawButton i DragDropTeams jako dziećmi.
- **Obsługiwane interakcje**: Uruchomienie losowania (onDraw), manualne przypisanie graczy (onAssignTeams), odświeżenie danych (onRefresh).
- **Obsługiwana walidacja**: Sprawdzenie minimalnej liczby uczestników (min. graczy wymaganych dla losowania), dostępności roli użytkownika, osiągnięcia balansu po manualnej edycji (różnica średniego skill rate <=7%).
- **Typy**: DrawTeamsViewModel, TeamViewModel, PlayerViewModel.
- **Propsy**: eventId: number (identyfikator wydarzenia).

### TeamStats

- **Opis komponentu**: Komponent prezentacyjny wyświetlający statystyki dla każdej drużyny, takie jak średni skill rate i rozkład pozycji. Nie obsługuje interakcji, tylko prezentuje dane.
- **Główne elementy**: Lista `<div>` dla każdej drużyny z `<span>` dla statystyk.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak (dane pochodzą z API i są walidowane wcześniej).
- **Typy**: TeamViewModel.
- **Propsy**: teams: TeamViewModel[] (lista drużyn ze statystykami).

### DrawButton

- **Opis komponentu**: Przycisk akcji do uruchomienia automatycznego algorytmu losowania. Wyświetla stan ładowania podczas przetwarzania.
- **Główne elementy**: `<button>` z ikoną i tekstem "Uruchom losowanie".
- **Obsługiwane interakcje**: onClick - wywołuje API POST /api/events/{eventId}/draw.
- **Obsługiwana walidacja**: Sprawdzenie roli użytkownika (tylko organizator/admin), dostępności minimalnej liczby graczy.
- **Typy**: Brak nowych typów.
- **Propsy**: onDraw: () => void, isLoading: boolean, disabled: boolean.

### DragDropTeams

- **Opis komponentu**: Interfejs drag-and-drop umożliwiający manualne przenoszenie graczy między drużynami. Aktualizuje statystyki w czasie rzeczywistym.
- **Główne elementy**: Kontener z kolumnami drużyn (TeamColumn) zawierającymi karty graczy (PlayerCard).
- **Obsługiwane interakcje**: onDrop - przeniesienie gracza między drużynami, wywołuje onAssignTeams.
- **Obsługiwana walidacja**: Sprawdzenie balansu po każdej zmianie (różnica skill rate <=7%), możliwość zapisu tylko jeśli balans osiągnięty.
- **Typy**: TeamViewModel, PlayerViewModel.
- **Propsy**: teams: TeamViewModel[], onAssignTeams: (assignments: Assignment[]) => void.

## 5. Typy

- **Istniejące typy z types.ts**: Event, Player, Signup, TeamAssignment.
- **Nowe typy ViewModel**:
  - **DrawTeamsViewModel**: { eventId: number; teams: TeamViewModel[]; isLoading: boolean; error: string | null; balanceAchieved: boolean; }
  - **TeamViewModel**: { teamNumber: number; players: PlayerViewModel[]; avgSkillRate: number; positions: Record<string, number>; } - avgSkillRate to number (średnia ocena umiejętności), positions to obiekt z kluczami pozycji (np. "forward": 5).
  - **PlayerViewModel**: { id: number; name: string; position: string; skillRate: number; } - rozszerza Player o skillRate widoczny tylko dla admina.
- **DTO z API**: DrawResponse { success: boolean; teams: Team[]; balance_achieved: boolean; }, Team { team_number: number; players: Player[]; stats: { avg_skill_rate: number; positions: Record<string, number>; } }, Assignment { signup_id: number; team_number: number; }.

## 6. Zarządzanie stanem

Stan zarządzany jest za pomocą React hooks w komponencie DrawTeamsView. Używa useState dla teams, isLoading i error. Customowy hook useDrawTeams obsługuje pobieranie danych (GET /api/events/{eventId}/teams), uruchomienie losowania (POST /api/events/{eventId}/draw) i manualne przypisywanie (POST /api/events/{eventId}/teams). Hook zwraca funkcje do aktualizacji stanu i obsługi błędów z toast notifications.

## 7. Integracja API

Integracja odbywa się poprzez customowy hook useDrawTeams, który używa fetch do wywołań API. Dla POST /api/events/{eventId}/draw: request body { iterations: 20, balance_threshold: 0.07 }, response typu DrawResponse. Dla POST /api/events/{eventId}/teams: request body { assignments: Assignment[] }, response array Assignment. Dla GET: response { data: TeamAssignment[] }.

## 8. Interakcje użytkownika

- **Kliknięcie "Uruchom losowanie"**: Wywołuje API draw, wyświetla loading, po sukcesie aktualizuje teams i pokazuje toast sukcesu lub ostrzeżenie o braku balansu z opcją retry.
- **Przeciągnięcie gracza między drużynami**: Aktualizuje lokalny stan teams, przelicza statystyki, sprawdza balans; po zwolnieniu wywołuje onAssignTeams jeśli balans OK.
- **Odświeżenie widoku**: Przycisk lub automatyczne po zmianach, wywołuje GET teams.

## 9. Warunki i walidacja

- **Minimalna liczba uczestników**: Sprawdzana przed uruchomieniem draw (min. graczy z event settings), jeśli nie - przycisk disabled i toast błędu.
- **Rola użytkownika**: Walidacja w hooku useDrawTeams poprzez sprawdzenie kontekstu autoryzacji (rola organizator/admin).
- **Balans drużyn**: Po każdej zmianie w drag-and-drop, przelicza różnicę avgSkillRate; jeśli >7%, wyświetla ostrzeżenie i blokuje zapis.
- **Dostępność skill rate**: Widoczny tylko dla admina, ukryty dla organizatora poprzez conditional rendering.

## 10. Obsługa błędów

Błędy API obsługiwane przez try-catch w hooku, wyświetlanie toastów z komunikatami błędów (np. "Błąd podczas losowania"). Scenariusze: Niepowodzenie algorytmu - fallback do manualnej edycji z toastem "Balans nie osiągnięty, przejdź do ręcznej edycji". Retry opcje dla błędów sieciowych. Edge case: Brak graczy - przekierowanie lub komunikat.

## 11. Kroki implementacji

1. Utworzyć plik strony Astro: `src/pages/dashboard/events/[id]/draw.astro` z routingiem i podstawowym layoutem.
2. Zaimplementować customowy hook `useDrawTeams` w `src/lib/hooks/useDrawTeams.ts` z integracją API (GET, POST draw, POST teams).
3. Dodać nowe typy ViewModel do `src/types.ts`.
4. Stworzyć komponent DrawTeamsView w `src/components/DrawTeamsView.tsx` z zarządzaniem stanem.
5. Zaimplementować TeamStats w `src/components/TeamStats.tsx` jako komponent prezentacyjny.
6. Zaimplementować DrawButton w `src/components/DrawButton.tsx` z obsługą onClick i loading state.
7. Zaimplementować DragDropTeams używając biblioteki react-dnd w `src/components/DragDropTeams.tsx`, z TeamColumn i PlayerCard.
8. Dodać walidację warunków (rola, balans) w komponentach i hooku.
9. Zintegrować toast notifications dla sukcesów/błędów używając Shadcn/ui.
10. Przetestować interakcje, obsłużyć edge cases i dodać responsywność z Tailwind.
