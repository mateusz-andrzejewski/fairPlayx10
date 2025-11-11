# Plan implementacji widoku listy graczy

## 1. Przegląd

Widok listy graczy umożliwia administratorom i organizatorom przeglądanie, wyszukiwanie, filtrowanie oraz zarządzanie profilami graczy w systemie piłkarskim. Główny cel to zapewnienie interfejsu do edycji profili, w tym ukrytego dla innych ról skill rate, dodawania nowych graczy oraz usuwania istniejących z wykorzystaniem soft delete. Widok integruje się z API graczy, zapewniając paginację i walidację danych zgodnie z wymaganiami bezpieczeństwa.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/dashboard/players`. Dostęp ograniczony do ról administratora i organizatora poprzez middleware autoryzacji (implementacja zostanie dodana później zgodnie z TODO w API).

## 3. Struktura komponentów

- **PlayersListView** (główny kontener)
  - **SearchAndFilters** (wyszukiwarka i filtry)
  - **PlayersTable** (tabela graczy)
    - **PlayerRow** (wiersze tabeli)
  - **PlayerDetailsModal** (modal szczegółów)
  - **PlayerCreateForm** (formularz tworzenia)
  - **PlayerEditForm** (formularz edycji)

## 4. Szczegóły komponentów

### PlayersListView

- **Opis komponentu**: Główny komponent widoku odpowiedzialny za zarządzanie stanem aplikacji, renderowanie layoutu oraz koordynację między podkomponentami. Składa się z sekcji wyszukiwania, tabeli oraz modali dla akcji.
- **Główne elementy**: Kontener główny (div z Tailwind), SearchAndFilters, PlayersTable, PlayerDetailsModal, PlayerCreateForm, PlayerEditForm; przyciski akcji (Add Player) z Shadcn/ui Button.
- **Obsługiwane interakcje**: onSearch (aktualizacja filtrów), onFilter (zmiana parametrów), onPlayerSelect (otwarcie modali), onCreate (otwarcie formularza tworzenia), onEdit (otwarcie formularza edycji), onDelete (potwierdzenie usunięcia).
- **Obsługiwana walidacja**: Sprawdzenie roli użytkownika dla wyświetlania skill_rate i przycisków edycji/usunięcia; walidacja długości search stringu (max 100 znaków).
- **Typy**: PlayersListViewModel, PlayerDTO, PaginationDTO.
- **Propsy**: Brak (komponent główny).

### SearchAndFilters

- **Opis komponentu**: Komponent wyszukiwania i filtrów umożliwiający filtrowanie graczy po pozycji i wyszukiwanie po imieniu/nazwisku. Składa się z pola tekstowego i selecta dla pozycji.
- **Główne elementy**: Input (Shadcn/ui) dla search, Select dla position; przycisk Clear Filters.
- **Obsługiwane interakcje**: onSearchChange (debounced), onPositionChange, onClear.
- **Obsługiwana walidacja**: Search string: min 2 znaki dla aktywacji filtru, max 100; pozycja: enum wartości.
- **Typy**: ListPlayersQueryParams (częściowo).
- **Propsy**: filters: ListPlayersQueryParams, onFiltersChange: (filters: ListPlayersQueryParams) => void, isLoading: boolean.

### PlayersTable

- **Opis komponentu**: Tabela wyświetlająca listę graczy z paginacją. Składa się z nagłówków kolumn i wierszy PlayerRow, przycisków akcji w każdym wierszu.
- **Główne elementy**: Table (Shadcn/ui) z kolumnami: Imię, Nazwisko, Pozycja, Skill Rate (ukryty dla nie-admin), Akcje; Pagination komponent.
- **Obsługiwane interakcje**: onPageChange, onRowClick (otwarcie szczegółów), onEditClick, onDeleteClick.
- **Obsługiwana walidacja**: Ukrycie kolumny Skill Rate jeśli !isAdmin; sprawdzenie roli przed wyświetleniem przycisków edycji/usunięcia.
- **Typy**: PlayerDTO[], PaginationDTO, isAdmin: boolean.
- **Propsy**: players: PlayerDTO[], pagination: PaginationDTO, isAdmin: boolean, onPlayerAction: (action: 'view' | 'edit' | 'delete', player: PlayerDTO) => void, onPageChange: (page: number) => void.

### PlayerRow

- **Opis komponentu**: Pojedynczy wiersz tabeli reprezentujący gracza. Wyświetla dane bez skill_rate jeśli nie admin.
- **Główne elementy**: TableRow (Shadcn/ui) z TableCell dla każdego pola; przyciski View, Edit, Delete (IconButton).
- **Obsługiwane interakcje**: onView, onEdit, onDelete.
- **Obsługiwana walidacja**: Brak skill_rate w wyświetlaniu jeśli !isAdmin.
- **Typy**: PlayerDTO, isAdmin: boolean.
- **Propsy**: player: PlayerDTO, isAdmin: boolean, onAction: (action: string) => void.

### PlayerDetailsModal

- **Opis komponentu**: Modal wyświetlający szczegóły gracza. Składa się z pól tylko do odczytu i przycisków akcji.
- **Główne elementy**: Dialog (Shadcn/ui) z polami Label/Input (readOnly), przyciski Edit/Delete.
- **Obsługiwane interakcje**: onEdit, onDelete, onClose.
- **Obsługiwana walidacja**: Ukrycie skill_rate jeśli !isAdmin.
- **Typy**: PlayerDTO, isAdmin: boolean.
- **Propsy**: player: PlayerDTO | null, isAdmin: boolean, onAction: (action: string) => void, open: boolean, onOpenChange: (open: boolean) => void.

### PlayerCreateForm

- **Opis komponentu**: Formularz tworzenia nowego gracza. Składa się z pól wejściowych z walidacją.
- **Główne elementy**: Dialog z Form (react-hook-form), Input dla first_name/last_name, Select dla position, Input dla skill_rate (tylko admin), DatePicker dla date_of_birth; przyciski Submit/Cancel.
- **Obsługiwane interakcje**: onSubmit (walidacja i wywołanie API), onCancel.
- **Obsługiwana walidacja**: first_name/last_name wymagane (min 2, max 50 znaków); position wymagane (enum); skill_rate opcjonalne, tylko admin (1-10); date_of_birth wymagane (format YYYY-MM-DD, wiek min 16 lat).
- **Typy**: PlayerFormViewModel, CreatePlayerCommand.
- **Propsy**: isAdmin: boolean, onSubmit: (data: CreatePlayerCommand) => void, onCancel: () => void, open: boolean, onOpenChange: (open: boolean) => void.

### PlayerEditForm

- **Opis komponentu**: Formularz edycji istniejącego gracza, podobny do CreateForm ale z wstępnymi danymi.
- **Główne elementy**: Dialog z Form, pola jak w CreateForm; przyciski Submit/Cancel.
- **Obsługiwane interakcje**: onSubmit, onCancel.
- **Obsługiwana walidacja**: Jak w CreateForm, plus sprawdzenie czy skill_rate zmieniony tylko przez admina.
- **Typy**: PlayerFormViewModel, UpdatePlayerCommand, PlayerDTO.
- **Propsy**: player: PlayerDTO, isAdmin: boolean, onSubmit: (data: UpdatePlayerCommand) => void, onCancel: () => void, open: boolean, onOpenChange: (open: boolean) => void.

## 5. Typy

- **PlayerDTO**: { id: number, first_name: string, last_name: string, position: PlayerPosition, skill_rate?: number, date_of_birth: string, created_at: string, updated_at: string } - DTO z API, skill_rate opcjonalne dla nie-admin.
- **PlayersListViewModel**: { players: PlayerDTO[], pagination: PaginationDTO, filters: ListPlayersQueryParams, isAdmin: boolean } - Model widoku dla stanu głównego.
- **PlayerFormViewModel**: { first_name: string, last_name: string, position: PlayerPosition, skill_rate?: number, date_of_birth: string } - Dla formularzy, skill_rate opcjonalne.
- **PaginationDTO**: { page: number, limit: number, total: number, total_pages: number } - Z API odpowiedzi.
- **ListPlayersQueryParams**: { page?: number, limit?: number, position?: PlayerPosition, search?: string, include_skill_rate?: boolean } - Dla zapytań API.
- **CreatePlayerCommand**: { first_name: string, last_name: string, position: PlayerPosition, skill_rate?: number, date_of_birth: string } - Dla POST API.
- **UpdatePlayerCommand**: { first_name?: string, last_name?: string, position?: PlayerPosition, skill_rate?: number, date_of_birth?: string } - Dla PATCH API.

## 6. Zarządzanie stanem

Stan zarządzany przez customowe hooki: usePlayersData (stan listy graczy, paginacja, filtry, isLoading, error) oraz usePlayerActions (stan modali, selectedPlayer). Hooki używają useState i useEffect dla synchronizacji z API. Stan lokalny dla formularzy obsługiwany przez react-hook-form. Brak globalnego stanu (np. Redux), aby zachować prostotę.

## 7. Integracja API

Integracja poprzez fetch w hookach. GET /api/players z query params (ListPlayersQueryParams) zwraca PlayersListResponseDTO. GET /api/player/{id} zwraca PlayerDTO. POST /api/player wysyła CreatePlayerCommand, zwraca PlayerDTO. PATCH /api/player/{id} wysyła UpdatePlayerCommand, zwraca PlayerDTO. DELETE /api/player/{id} zwraca 204. Obsługa błędów poprzez catch i toast notifications.

## 8. Interakcje użytkownika

- **Wyszukiwanie**: Wpisanie w SearchAndFilters -> debounced wywołanie onSearch -> odśwież tabela z filtrem.
- **Filtrowanie**: Wybór pozycji -> onFilter -> odśwież tabela.
- **Wyświetlenie szczegółów**: Kliknięcie wiersza -> otwarcie PlayerDetailsModal.
- **Edycja**: Przycisk Edit w wierszu/modalu -> otwarcie PlayerEditForm -> submit -> aktualizacja API, zamknięcie modalu, odśwież tabela.
- **Usunięcie**: Przycisk Delete -> confirm dialog -> soft delete API, usunięcie z tabeli.
- **Dodanie**: Przycisk Add Player -> otwarcie PlayerCreateForm -> submit -> tworzenie API, dodanie do tabeli, zamknięcie.

## 9. Warunki i walidacja

- **Rola użytkownika**: Sprawdzenie isAdmin dla wyświetlania skill_rate, przycisków edycji/usunięcia; walidacja w komponentach poprzez prop isAdmin.
- **Pola formularzy**: first_name/last_name: wymagane, string 2-50 znaków; position: enum wymagany; skill_rate: opcjonalne, 1-10 tylko admin; date_of_birth: wymagany, format YYYY-MM-DD, wiek >=16.
- **API warunki**: include_skill_rate tylko jeśli isAdmin; walidacja po stronie klienta przed wysłaniem.

## 10. Obsługa błędów

Błędy API (400, 409, 500) wyświetlane jako toast (Shadcn/ui). Konflikty (409) w formularzach: komunikat "Gracz już istnieje". Brak danych: pusty stan tabeli. Loading states dla wszystkich akcji. Confirm dialogs dla usunięcia. Edge case: brak uprawnień -> ukrycie elementów zamiast błędu.

## 11. Kroki implementacji

1. Utwórz strukturę katalogów: src/pages/dashboard/players.astro, src/components/players/.
2. Zaimplementuj typy w src/types.ts (rozszerz istniejące).
3. Stwórz hooki: usePlayersData, usePlayerActions w src/lib/hooks/.
4. Zaimplementuj komponenty: zacznij od PlayersListView, potem SearchAndFilters, PlayersTable, PlayerRow.
5. Dodaj modali: PlayerDetailsModal, PlayerCreateForm, PlayerEditForm z react-hook-form.
6. Zintegruj API w hookach z fetch.
7. Dodaj routing w Astro: nowa strona /dashboard/players.
8. Przetestuj walidację, interakcje i błędy.
9. Dodaj style Tailwind i komponenty Shadcn/ui.
10. Przeprowadź code review i refaktoryzację.
