# Plan implementacji widoku Lista użytkowników

## 1. Przegląd

Widok "Lista użytkowników" umożliwia administratorom przeglądanie, wyszukiwanie i zatwierdzanie oczekujących kont użytkowników w systemie FairPlay. Głównym celem jest zarządzanie rejestracjami użytkowników, w tym nadawanie ról i łączenie kont z profilami graczy. Widok jest dostępny tylko dla użytkowników z rolą admin i stanowi kluczowy element procesu onboardingu nowych użytkowników platformy.

## 2. Routing widoku

Widok dostępny jest pod ścieżką `/dashboard/users` i wymaga autoryzacji z rolą admin. Brak dostępu dla innych ról skutkuje przekierowaniem lub wyświetleniem strony błędu.

## 3. Struktura komponentów

```
UsersListPage (główna strona)
├── UsersFilters (panel filtrów)
├── UsersTable (tabela z użytkownikami)
├── UserDetailsModal (modal szczegółów)
├── ApproveUserForm (formularz zatwierdzania)
└── ConfirmDeleteDialog (dialog potwierdzenia usunięcia)
```

## 4. Szczegóły komponentów

### UsersListPage

- **Opis komponentu**: Główna strona widoku listy użytkowników, odpowiedzialna za layout, routing i koordynację między komponentami potomnymi.
- **Główne elementy**: Layout z nagłówkiem, UsersFilters, UsersTable, conditional rendering modali i dialogów.
- **Obsługiwane zdarzenia**: onFilterChange, onUserSelect, onApproveSubmit, onDeleteConfirm.
- **Warunki walidacji**: Sprawdzenie roli admin przy mount, przekierowanie przy braku dostępu.
- **Typy**: UsersListResponseDTO, UsersFiltersVM, UserDTO.
- **Propsy**: Brak (komponent strony Astro).

### UsersFilters

- **Opis komponentu**: Panel filtrów i wyszukiwania składający się z pola tekstowego i dropdownów dla statusu i roli.
- **Główne elementy**: Shadcn/ui Input, Select, Button dla resetowania filtrów.
- **Obsługiwane zdarzenia**: onSearchChange (debounced), onFilterChange, onReset.
- **Warunki walidacji**: Walidacja długości search string (min 1 znak), prawidłowe wartości enum dla filtrów.
- **Typy**: UsersFiltersVM.
- **Propsy**: filters: UsersFiltersVM, onFiltersChange: (filters: UsersFiltersVM) => void.

### UsersTable

- **Opis komponentu**: Tabela wyświetlająca użytkowników w formie wierszy z paginacją, wykorzystująca Shadcn/ui DataTable.
- **Główne elementy**: Table, TableHeader, TableRow, TableCell, Pagination, StatusBadge, RoleBadge, ActionsCell.
- **Obsługiwane zdarzenia**: onSortChange, onPageChange, onUserDetails, onApprove, onDelete.
- **Warunki walidacji**: Wyświetlanie przycisku "Zatwierdź" tylko dla status === 'pending'.
- **Typy**: UsersListResponseDTO, UserTableRowVM.
- **Propsy**: users: UsersListResponseDTO, loading: boolean, onAction: (action: UserAction) => void.

### UserDetailsModal

- **Opis komponentu**: Modal wyświetlający szczegóły wybranego użytkownika w trybie read-only oraz formularz zatwierdzania dla kont pending.
- **Główne elementy**: Dialog, UserInfoDisplay (readonly fields), ApproveUserForm (conditional), CloseButton.
- **Obsługiwane zdarzenia**: onClose, onApproveSubmit.
- **Warunki walidacji**: Wyświetlanie ApproveUserForm tylko gdy user.status === 'pending'.
- **Typy**: UserDTO, ApproveUserFormVM.
- **Propsy**: user: UserDTO, open: boolean, onClose: () => void, onApprove: (command: ApproveUserCommand) => void.

### ApproveUserForm

- **Opis komponentu**: Formularz zatwierdzania użytkownika z wyborem roli i opcjonalnym powiązaniem z profilem gracza.
- **Główne elementy**: Shadcn/ui Form, Select dla roli, Input/Autocomplete dla player_id, SubmitButton.
- **Obsługiwane zdarzenia**: onSubmit, onRoleChange, onPlayerSelect.
- **Warunki walidacji**: Wymagane pole role, opcjonalne player_id (jeśli podane, musi istnieć w bazie).
- **Typy**: ApproveUserCommand, ApproveUserFormVM.
- **Propsy**: user: UserDTO, onSubmit: (command: ApproveUserCommand) => Promise<void>.

### ConfirmDeleteDialog

- **Opis komponentu**: Dialog potwierdzenia soft delete użytkownika z ostrzeżeniem o konsekwencjach.
- **Główne elementy**: AlertDialog, WarningMessage, CancelButton, ConfirmButton.
- **Obsługiwane zdarzenia**: onConfirm, onCancel.
- **Warunki walidacji**: Blokada usunięcia własnego konta (actorId !== userId).
- **Typy**: UserDTO.
- **Propsy**: user: UserDTO, open: boolean, onConfirm: () => void, onCancel: () => void.

## 5. Typy

### Istniejące typy (z types.ts):
- `UserDTO`: {id: number, email: string, first_name: string, last_name: string, role: UserRole, status: UserStatus, player_id: number | null, created_at: string, updated_at: string, deleted_at: string | null}
- `ListUsersQueryParams`: {page?: number, limit?: number, status?: UserStatus, role?: UserRole, search?: string}
- `UsersListResponseDTO`: PaginatedDataDTO<UserDTO>
- `ApproveUserCommand`: {role: UserRole, player_id?: number}

### Nowe typy ViewModel:

**UserTableRowVM** (rozszerzenie UserDTO dla potrzeb UI):
```typescript
interface UserTableRowVM extends UserDTO {
  fullName: string;        // computed: `${first_name} ${last_name}`
  statusColor: 'red' | 'green' | 'gray'; // dla wizualizacji statusu
  canApprove: boolean;     // computed: status === 'pending'
  canDelete: boolean;      // zawsze true dla admina
}
```

**UsersFiltersVM** (stan filtrów):
```typescript
interface UsersFiltersVM {
  search: string;
  status: UserStatus | 'all';
  role: UserRole | 'all';
  page: number;
  limit: number;
}
```

**ApproveUserFormVM** (stan formularza zatwierdzania):
```typescript
interface ApproveUserFormVM {
  role: UserRole;
  player_id?: number;
  isSubmitting: boolean;
  errors: {
    role?: string;
    player_id?: string;
  };
}
```

**UserAction** (unions dla akcji tabeli):
```typescript
type UserAction =
  | { type: 'details'; userId: number }
  | { type: 'approve'; userId: number }
  | { type: 'delete'; userId: number };
```

## 6. Zarządzanie stanem

Stan widoku zarządzany jest przez główny komponent UsersListPage przy użyciu React hooks. Wykorzystywane są następujące hooki:

- `useState` dla lokalnego stanu (filters, selectedUser, modals visibility)
- `useEffect` dla side effects (initial load, filter changes)
- Custom hook `useUsersList` dla zarządzania listą użytkowników i API calls
- Custom hook `useUserApproval` dla procesu zatwierdzania
- Custom hook `useUserDeletion` dla usuwania użytkowników

Stan jest zorganizowany hierarchicznie - UsersListPage zarządza stanem globalnym widoku, podczas gdy komponenty potomne otrzymują potrzebne dane przez propsy i wywołują callbacki dla zmian.

## 7. Integracja API

Widok integruje się z następującymi endpointami:

- **GET /api/users**: Pobieranie paginowanej listy użytkowników z filtrami
  - Request: query params (page, limit, status, role, search)
  - Response: UsersListResponseDTO
  - Headers: Authorization: Bearer {token}

- **PATCH /api/users/{id}/approve**: Zatwierdzanie użytkownika
  - Request: body ApproveUserCommand
  - Response: UserDTO (zaktualizowany użytkownik)
  - Headers: Authorization: Bearer {token}

- **DELETE /api/users/{id}**: Soft delete użytkownika
  - Request: brak body
  - Response: 204 No Content
  - Headers: Authorization: Bearer {token}

Wszystkie wywołania API obsługują loading states, error handling i automatyczne odświeżanie listy po mutacjach.

## 8. Interakcje użytkownika

1. **Wyszukiwanie**: Wpisanie tekstu w pole wyszukiwania → debounce 300ms → wywołanie API → aktualizacja tabeli
2. **Filtrowanie**: Zmiana wartości w dropdownach → natychmiastowe wywołanie API → aktualizacja tabeli
3. **Paginacja**: Kliknięcie przycisku strony → wywołanie API → aktualizacja tabeli
4. **Szczegóły użytkownika**: Kliknięcie przycisku "Szczegóły" → otwarcie modalu z danymi użytkownika
5. **Zatwierdzanie**: W modalu kliknięcie "Zatwierdź" → otwarcie formularza → wybór roli i gracza → submit → toast sukcesu → zamknięcie modalu → odświeżenie listy
6. **Usuwanie**: Kliknięcie "Usuń" → dialog potwierdzenia → potwierdzenie → wywołanie API → toast sukcesu → odświeżenie listy
7. **Reset filtrów**: Kliknięcie "Wyczyść" → reset wszystkich filtrów → wywołanie API

## 9. Warunki i walidacja

### Warunki dostępu:
- Tylko użytkownicy z rolą 'admin' mają dostęp do widoku
- Sprawdzenie wykonywane przy mount komponentu

### Walidacja formularzy:
- **ApproveUserForm**: Pole role jest wymagane, player_id opcjonalne ale musi istnieć jeśli podane
- **UsersFilters**: Search minimum 1 znak, prawidłowe wartości enum dla filtrów

### Warunki biznesowe:
- Przycisk "Zatwierdź" widoczny tylko dla użytkowników ze statusem 'pending'
- Nie można usunąć własnego konta
- Formularz zatwierdzania dostępny tylko dla statusu 'pending'

Walidacja wykonywana jest zarówno po stronie klienta (form validation) jak i serwera (API validation) z odpowiednim wyświetlaniem błędów.

## 10. Obsługa błędów

- **401 Unauthorized**: Przekierowanie do strony logowania
- **403 Forbidden**: Wyświetlenie strony błędu dostępu
- **400 Bad Request**: Wyświetlenie błędów walidacji w formularzach
- **404 Not Found**: Toast z informacją o nieznalezieniu użytkownika
- **409 Conflict**: Toast z informacją o niemożności wykonania akcji
- **500 Internal Server Error**: Ogólny komunikat błędu z opcją retry
- **Network errors**: Offline handling z możliwością retry

Błędy wyświetlane są za pomocą Shadcn/ui Toast komponentów z odpowiednimi komunikatami w języku polskim.

## 11. Kroki implementacji

1. Utworzyć strukturę plików komponentów w `src/components/dashboard/users/`
2. Zaimplementować typy ViewModel w `src/types.ts`
3. Utworzyć custom hooki: `useUsersList`, `useUserApproval`, `useUserDeletion`
4. Zaimplementować UsersListPage jako stronę Astro `/dashboard/users`
5. Zaimplementować UsersFilters z debounced search i filtrami
6. Zaimplementować UsersTable z Shadcn/ui DataTable i paginacją
7. Zaimplementować UserDetailsModal z conditional ApproveUserForm
8. Zaimplementować ApproveUserForm z walidacją i autocomplete dla graczy
9. Zaimplementować ConfirmDeleteDialog
10. Dodać loading states i error handling
11. Przetestować integrację z API endpointami
12. Dodać responsive design dla mobile
13. Przetestować przypadki brzegowe i error scenarios
