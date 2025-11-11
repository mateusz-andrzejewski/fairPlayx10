# Plan implementacji widoku listy graczy

## 1. Przegląd

Widok listy graczy umożliwia administratorom i organizatorom przeglądanie, wyszukiwanie oraz zarządzanie profilami graczy w systemie FairPlay. Głównym celem jest zapewnienie intuicyjnego interfejsu do zarządzania bazą graczy z pełną funkcjonalnością CRUD, przy jednoczesnym zachowaniu ścisłej kontroli dostępu do wrażliwych danych jak ocena umiejętności (skill_rate), która jest widoczna wyłącznie dla administratorów. Widok integruje się z API graczy i wykorzystuje responsywny design mobile-first.

## 2. Routing widoku

Ścieżka widoku: `/dashboard/players`

Widok będzie dostępny wyłącznie dla użytkowników z rolami `admin` lub `organizer`. Użytkownicy bez odpowiednich uprawnień zostaną przekierowani na dashboard główny.

## 3. Struktura komponentów

- **PlayersListPage** - Główny komponent strony Astro
  - **SearchAndFilters** - Komponent wyszukiwania i filtrowania
  - **PlayersTable** - Tabela z listą graczy i kontrolami paginacji
    - **PlayerTableRow** - Wiersz tabeli dla pojedynczego gracza
      - **ActionButtons** - Przyciski akcji (szczegóły, edycja, usunięcie)
  - **PlayerForm** - Modal formularza do tworzenia/edycji gracza
  - **PlayerDetailsModal** - Modal ze szczegółami gracza (tylko do odczytu)
  - **ConfirmDeleteDialog** - Dialog potwierdzenia usunięcia gracza

## 4. Szczegóły komponentów

### PlayersListPage

- **Opis komponentu**: Główny komponent strony implementowany jako strona Astro. Odpowiada za inicjalizację stanu, ładowanie danych oraz koordynację między komponentami podrzędnymi. Zawiera layout z nagłówkiem, przyciskiem "Dodaj gracza" oraz kontenerem na komponenty tabeli i filtrów.

- **Główne elementy**: Layout Astro z sekcją tytułu, przyciskiem akcji głównej, obszarem filtrów oraz kontenerem tabeli. Wykorzystuje Shadcn/ui Dialog dla modali i Toast dla powiadomień.

- **Obsługiwane interakcje**:
  - Ładowanie danych przy montowaniu komponentu
  - Obsługa kliknięcia przycisku "Dodaj gracza"
  - Koordynacja między wyszukiwaniem, filtrowaniem a tabelą
  - Zarządzanie stanem wszystkich modali i dialogów

- **Obsługiwana walidacja**:
  - Sprawdzenie roli użytkownika przy renderowaniu (tylko admin/organizer)
  - Walidacja dostępu do funkcji edycji skill_rate
  - Kontrola stanu ładowania przed wykonaniem akcji

- **Typy**:
  - `PlayerListItemVM` - rozszerzony DTO gracza dla widoku listy
  - `SearchFiltersVM` - stan filtrów wyszukiwania
  - `PaginationMetaDTO` - metadane paginacji

- **Propsy**:
  - Brak propsów - komponent główny strony

### SearchAndFilters

- **Opis komponentu**: Komponent odpowiedzialny za wyszukiwanie tekstowe oraz filtrowanie graczy. Implementuje debounce dla wyszukiwania oraz select dla filtrowania pozycji. Zawiera przycisk czyszczenia filtrów.

- **Główne elementy**: Input tekstowy z ikoną wyszukiwania, Select dla pozycji gracza, przycisk "Wyczyść filtry". Wykorzystuje Shadcn/ui Input i Select.

- **Obsługiwane interakcje**:
  - Zmiana tekstu wyszukiwania z debounce 300ms
  - Zmiana filtra pozycji
  - Kliknięcie przycisku czyszczenia filtrów

- **Obsługiwana walidacja**:
  - Walidacja formatu wyszukiwania (min 2 znaki dla optymalizacji)
  - Sprawdzenie poprawności wartości pozycji z enum

- **Typy**:
  - `SearchFiltersVM` - stan filtrów
  - `PlayerPosition` - enum pozycji gracza

- **Propsy**:
  - `filters: SearchFiltersVM` - aktualny stan filtrów
  - `onFiltersChange: (filters: SearchFiltersVM) => void` - callback na zmianę filtrów
  - `isLoading: boolean` - stan ładowania

### PlayersTable

- **Opis komponentu**: Tabela wyświetlająca listę graczy z paginacją. Implementuje sortowanie, paginację oraz akcje wierszowe. Wykorzystuje Shadcn/ui Table z opcjami responsywnymi.

- **Główne elementy**: Nagłówek tabeli z kolumnami (Imię i nazwisko, Pozycja, Skill Rate, Akcje), ciało tabeli z wierszami graczy, kontrolki paginacji. Kolumna Skill Rate ukryta dla użytkowników niebędących adminami.

- **Obsługiwane interakcje**:
  - Kliknięcie nagłówków kolumn dla sortowania
  - Zmiana strony paginacji
  - Zmiana liczby elementów na stronie
  - Akcje wierszowe (szczegóły, edycja, usunięcie)

- **Obsługiwana walidacja**:
  - Kontrola widoczności kolumny skill_rate na podstawie roli
  - Walidacja parametrów paginacji
  - Sprawdzenie dostępności akcji na podstawie uprawnień

- **Typy**:
  - `PlayerListItemVM[]` - lista graczy do wyświetlenia
  - `PaginationMetaDTO` - metadane paginacji

- **Propsy**:
  - `players: PlayerListItemVM[]` - lista graczy
  - `pagination: PaginationMetaDTO` - dane paginacji
  - `isLoading: boolean` - stan ładowania
  - `userRole: UserRole` - rola użytkownika dla kontroli dostępu
  - `onPageChange: (page: number) => void` - callback zmiany strony
  - `onEdit: (player: PlayerDTO) => void` - callback edycji gracza
  - `onDelete: (player: PlayerDTO) => void` - callback usunięcia gracza
  - `onViewDetails: (player: PlayerDTO) => void` - callback wyświetlenia szczegółów

### PlayerForm

- **Opis komponentu**: Modal z formularzem do tworzenia nowego gracza lub edycji istniejącego. Wykorzystuje React Hook Form z walidacją Zod oraz Shadcn/ui Form components.

- **Główne elementy**: Formularz z polami: imię, nazwisko, pozycja, data urodzenia, skill rate (tylko dla admina). Przyciski "Zapisz" i "Anuluj". Pole skill_rate ukryte/wyłączone dla nie-adminów.

- **Obsługiwane interakcje**:
  - Wypełnianie pól formularza
  - Wysyłanie formularza
  - Anulowanie edycji
  - Walidacja w czasie rzeczywistym

- **Obsługiwana walidacja**:
  - Imię i nazwisko: wymagane, max 100 znaków
  - Pozycja: wymagana, wartość z enum
  - Data urodzenia: opcjonalna, prawidłowa data
  - Skill rate: 1-10 dla admina, ukryte dla innych
  - Unikalność kombinacji imię+nazwisko

- **Typy**:
  - `PlayerFormVM` - dane formularza
  - `CreatePlayerCommand | UpdatePlayerCommand` - komendy API

- **Propsy**:
  - `player?: PlayerDTO` - gracz do edycji (null dla tworzenia)
  - `isOpen: boolean` - stan otwarcia modala
  - `isSubmitting: boolean` - stan wysyłania
  - `userRole: UserRole` - rola użytkownika
  - `onSubmit: (data: PlayerFormVM) => Promise<void>` - callback wysłania
  - `onCancel: () => void` - callback anulowania

### PlayerDetailsModal

- **Opis komponentu**: Modal wyświetlający szczegółowe informacje o graczu w trybie tylko do odczytu. Używany do szybkiego podglądu danych bez możliwości edycji.

- **Główne elementy**: Lista pól gracza w czytelnym formacie, przycisk "Zamknij". Pole skill_rate ukryte dla nie-adminów.

- **Obsługiwane interakcje**:
  - Wyświetlanie danych gracza
  - Zamykanie modala
  - Opcjonalne przejście do edycji

- **Obsługiwana walidacja**:
  - Kontrola widoczności skill_rate
  - Sprawdzenie istnienia gracza

- **Typy**:
  - `PlayerDTO` - dane gracza do wyświetlenia

- **Propsy**:
  - `player: PlayerDTO` - dane gracza
  - `isOpen: boolean` - stan otwarcia modala
  - `userRole: UserRole` - rola użytkownika
  - `onClose: () => void` - callback zamknięcia
  - `onEdit?: (player: PlayerDTO) => void` - opcjonalny callback edycji

### ConfirmDeleteDialog

- **Opis komponentu**: Dialog potwierdzenia miękkiego usunięcia gracza. Wyświetla ostrzeżenie o nieodwracalności operacji (w kontekście aplikacji).

- **Główne elementy**: Komunikat ostrzeżenia z danymi gracza, przyciski "Usuń" i "Anuluj". Wykorzystuje Shadcn/ui AlertDialog.

- **Obsługiwane interakcje**:
  - Potwierdzenie usunięcia
  - Anulowanie akcji

- **Obsługiwana walidacja**:
  - Sprawdzenie roli użytkownika (tylko admin)
  - Weryfikacja istnienia gracza

- **Typy**:
  - `PlayerDTO` - dane gracza do usunięcia

- **Propsy**:
  - `player: PlayerDTO` - gracz do usunięcia
  - `isOpen: boolean` - stan otwarcia dialogu
  - `isDeleting: boolean` - stan usuwania
  - `onConfirm: () => Promise<void>` - callback potwierdzenia
  - `onCancel: () => void` - callback anulowania

## 5. Typy

```typescript
// Rozszerzony DTO gracza dla widoku listy
interface PlayerListItemVM extends PlayerDTO {
  fullName: string; // Obliczone: `${first_name} ${last_name}`
  canEditSkillRate: boolean; // Na podstawie roli użytkownika
  canDelete: boolean; // Na podstawie roli użytkownika
}

// Model formularza gracza
interface PlayerFormVM {
  id?: number; // null dla tworzenia, number dla edycji
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  skill_rate: number | null; // null jeśli nie admin
  date_of_birth: string | null;
  isEditing: boolean;
  canEditSkillRate: boolean;
}

// Stan filtrów wyszukiwania
interface SearchFiltersVM {
  search: string;
  position: PlayerPosition | null;
  page: number;
  limit: number;
}
```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany przez custom hook `usePlayersManagement`, który:

- Łączy wszystkie API calls (GET, POST, PATCH, DELETE /api/players)
- Zarządza stanem ładowania i błędami dla wszystkich operacji
- Implementuje paginację z synchronizacją z URL query params
- Sprawdza uprawnienia użytkownika przed wykonaniem akcji
- Integruje się z systemem powiadomień toast
- Obsługuje debounce dla wyszukiwania (300ms)
- Zarządza stanem wszystkich modali i dialogów

Hook zwraca:

- `players: PlayerListItemVM[]` - lista graczy
- `pagination: PaginationMetaDTO` - metadane paginacji
- `loading: boolean` - ogólny stan ładowania
- `error: string | null` - błąd do wyświetlenia
- `filters: SearchFiltersVM` - aktualne filtry
- `modalStates` - stany wszystkich modali
- `actions` - funkcje do wykonywania operacji CRUD

## 7. Integracja API

Widok integruje się z endpointami API graczy:

- **GET /api/players** - pobieranie listy graczy
  - Query params: `page`, `limit`, `search`, `position`, `include_skill_rate`
  - Request type: `ListPlayersQueryParams`
  - Response type: `PlayersListResponseDTO`

- **POST /api/players** - tworzenie gracza
  - Request body: `CreatePlayerCommand`
  - Response type: `PlayerDTO`

- **PATCH /api/players/{id}** - aktualizacja gracza
  - Request body: `UpdatePlayerCommand`
  - Response type: `PlayerDTO`

- **DELETE /api/players/{id}** - miękkie usunięcie gracza
  - Response type: `void`

Wszystkie wywołania API obsługują autoryzację JWT i role-based dostęp.

## 8. Interakcje użytkownika

1. **Wyszukiwanie graczy**: Użytkownik wpisuje tekst w polu wyszukiwania → debounce 300ms → automatyczne wywołanie API → odświeżenie tabeli
2. **Filtrowanie pozycji**: Wybór pozycji z dropdown → natychmiastowe wywołanie API → odświeżenie tabeli
3. **Paginacja**: Kliknięcie przycisku strony → wywołanie API z nową stroną → odświeżenie tabeli
4. **Wyświetlanie szczegółów**: Kliknięcie ikony "oko" w wierszu → otwarcie modala ze szczegółami gracza
5. **Edycja gracza**: Kliknięcie ikony "edytuj" w wierszu → otwarcie modala formularza z wypełnionymi danymi
6. **Tworzenie gracza**: Kliknięcie przycisku "Dodaj gracza" → otwarcie pustego formularza
7. **Usuwanie gracza**: Kliknięcie ikony "kosz" w wierszu → otwarcie dialogu potwierdzenia → potwierdzenie → wywołanie API usunięcia
8. **Czyszczenie filtrów**: Kliknięcie przycisku "Wyczyść" → reset filtrów → wywołanie API bez filtrów

## 9. Warunki i walidacja

### Warunki dostępu:

- Widok dostępny tylko dla ról `admin` i `organizer`
- Pole `skill_rate` widoczne/edytowalne tylko dla roli `admin`
- Akcje CRUD sprawdzane pod kątem uprawnień użytkownika

### Walidacja pól formularza:

- `first_name`: wymagane, 1-100 znaków, tylko litery i spacje
- `last_name`: wymagane, 1-100 znaków, tylko litery i spacje
- `position`: wymagane, wartość z enum `PlayerPosition`
- `skill_rate`: opcjonalne dla admina, wartość 1-10
- `date_of_birth`: opcjonalne, prawidłowa data w przeszłości

### Warunki biznesowe:

- Unikalność kombinacji imię + nazwisko
- Data urodzenia nie może być w przyszłości
- Paginação: page >= 1, limit między 10-100

Wszystkie warunki walidacji są egzekwowane zarówno po stronie klienta (React Hook Form + Zod) jak i serwera (API validation).

## 10. Obsługa błędów

- **Błędy API**: Wyświetlane jako toast notifications z odpowiednimi komunikatami
- **Błędy walidacji**: Wyświetlane przy polach formularza z szczegółowymi opisami
- **Błędy autoryzacji**: Przekierowanie na dashboard lub ukrycie niedostępnych funkcji
- **Błędy sieci**: Retry button z wykładniczym backoff
- **Błędy biznesowe**: Specyficzne komunikaty (np. "Gracz już istnieje")
- **Global error boundary**: Dla nieprzewidzianych błędów z opcją odświeżenia strony

## 11. Kroki implementacji

1. **Przygotowanie struktury plików**
   - Utworzenie folderu `/src/pages/dashboard/players/`
   - Utworzenie komponentów w `/src/components/players/`
   - Dodanie typów ViewModel do `/src/types.ts`

2. **Implementacja API endpoints**
   - Utworzenie `/src/pages/api/players/index.ts` (GET, POST)
   - Utworzenie `/src/pages/api/players/[id].ts` (PATCH, DELETE)
   - Integracja z istniejącym `PlayersService`

3. **Implementacja custom hooka `usePlayersManagement`**
   - Zarządzanie stanem i API calls
   - Integracja z autoryzacją i toast notifications
   - Obsługa paginacji i filtrów

4. **Implementacja komponentów podstawowych**
   - `SearchAndFilters` z debounce
   - `PlayersTable` z Shadcn/ui
   - `PlayerTableRow` z akcjami

5. **Implementacja modali i formularzy**
   - `PlayerForm` z React Hook Form + Zod
   - `PlayerDetailsModal` tylko do odczytu
   - `ConfirmDeleteDialog` z Shadcn/ui

6. **Implementacja strony głównej**
   - `PlayersListPage` jako strona Astro
   - Integracja wszystkich komponentów
   - Obsługa responsywności

7. **Testowanie i optymalizacja**
   - Testy jednostkowe komponentów
   - Testy integracyjne z API
   - Optymalizacja wydajności (lazy loading, memoizacja)
   - Testy usability i dostępności
