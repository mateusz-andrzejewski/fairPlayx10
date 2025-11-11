# Plan implementacji widoku listy wydarzeń

## 1. Przegląd

Widok listy wydarzeń to główny feed aplikacji, umożliwiający użytkownikom przeglądanie dostępnych wydarzeń piłkarskich z opcjonalnym filtrowaniem. W zależności od roli użytkownika (gracz, organizator, admin) widok oferuje różne akcje - gracze mogą się zapisywać, organizatorzy tworzyć nowe wydarzenia, a administratorzy zarządzać istniejącymi. Widok jest responsywny, mobile-first, z naciskiem na prostotę UX i bezpieczeństwo dostępu.

## 2. Routing widoku

Widok dostępny pod ścieżką `/dashboard/events`. Wymaga autoryzacji - niezalogowani użytkownicy są przekierowywani na stronę logowania.

## 3. Struktura komponentów

```
EventsPage (główny komponent strony)
├── EventFilters (komponent filtrów)
├── EventsList (lista wydarzeń)
│   ├── EventCard (karta pojedynczego wydarzenia)
│   │   ├── EventActions (przyciski akcji)
│   │   └── EventStatus (status wydarzenia)
└── LoadingState/ErrorState (komponenty stanów ładowania/błędów)
```

## 4. Szczegóły komponentów

### EventsPage

- **Opis komponentu**: Główny komponent strony, odpowiedzialny za zarządzanie stanem widoku, ładowanie danych i obsługę błędów. Koordynuje wszystkie podkomponenty i zarządza cyklem życia widoku.
- **Główne elementy**: Kontener główny z sekcją filtrów i listą wydarzeń, komponenty ładowania i błędów.
- **Obsługiwane interakcje**: Inicjalne ładowanie danych, obsługa błędów API, aktualizacja po zmianach filtrów.
- **Obsługiwana walidacja**: Walidacja autoryzacji użytkownika, sprawdzenie roli dla warunkowego renderowania elementów.
- **Typy**: EventsListResponseDTO, EventFiltersViewModel, UserRole.
- **Propsy**: Brak (komponent strony).

### EventFilters

- **Opis komponentu**: Komponent filtrów umożliwiający użytkownikom filtrowanie wydarzeń po lokalizacji i zakresie dat. Na mobilnych urządzeniach filtry są zwijane w akordeon.
- **Główne elementy**: Formularz z polami lokalizacji (select) i dat (date range picker), przyciski zastosowania i czyszczenia filtrów.
- **Obsługiwane interakcje**: Zmiana wartości filtrów, zatwierdzenie filtrów, czyszczenie filtrów.
- **Obsługiwana walidacja**: Walidacja formatu dat (data_od <= data_do), opcjonalność pól.
- **Typy**: EventFiltersViewModel, ListEventsQueryParams.
- **Propsy**: onFiltersChange: (filters: EventFiltersViewModel) => void, currentFilters: EventFiltersViewModel.

### EventsList

- **Opis komponentu**: Kontener dla listy kart wydarzeń, obsługuje paginację i wyświetlanie pustej listy.
- **Główne elementy**: Grid kart wydarzeń, przyciski paginacji, komunikat pustej listy.
- **Obsługiwane interakcje**: Przewijanie do kolejnych stron, obsługa pustej listy.
- **Obsługiwana walidacja**: Sprawdzenie dostępności danych, walidacja parametrów paginacji.
- **Typy**: EventsListResponseDTO, EventDTO[].
- **Propsy**: events: EventDTO[], pagination: PaginationDTO, onPageChange: (page: number) => void, loading: boolean.

### EventCard

- **Opis komponentu**: Karta prezentująca pojedyncze wydarzenie z kluczowymi informacjami i przyciskami akcji.
- **Główne elementy**: Nagłówek z nazwą i lokalizacją, informacje o dacie/czasie, liczbie wolnych miejsc i koszcie, sekcja akcji.
- **Obsługiwane interakcje**: Kliknięcie w kartę (przejście do szczegółów), akcje przycisków (signup, zarządzanie).
- **Obsługiwana walidacja**: Sprawdzenie statusu wydarzenia (aktywne/wypełnione), dostępności miejsc, roli użytkownika dla akcji.
- **Typy**: EventDTO, UserRole.
- **Propsy**: event: EventDTO, userRole: UserRole, onSignup: (eventId: number) => void, onAction: (action: string, eventId: number) => void.

### EventActions

- **Opis komponentu**: Sekcja przycisków akcji dla karty wydarzenia, warunkowo renderowana w zależności od roli użytkownika i statusu wydarzenia.
- **Główne elementy**: Przycisk zapisu (dla graczy), przyciski edycji/usunięcia (dla organizatorów/adminów), przycisk tworzenia (dla organizatorów).
- **Obsługiwane interakcje**: Kliknięcia przycisków akcji, modal potwierdzenia dla destrukcyjnych akcji.
- **Obsługiwana walidacja**: Sprawdzenie uprawnień użytkownika, statusu wydarzenia, dostępności miejsc.
- **Typy**: EventDTO, UserRole, EventStatus.
- **Propsy**: event: EventDTO, userRole: UserRole, onSignup: () => void, onEdit: () => void, onDelete: () => void, onCreate: () => void.

## 5. Typy

### Istniejące typy z types.ts:
- `EventDTO`: Reprezentuje dane wydarzenia z API (id, name, location, event_datetime, max_places, optional_fee, status, current_signups_count, organizer_id, created_at, updated_at, deleted_at)
- `ListEventsQueryParams`: Parametry filtrowania API (page?, limit?, status?, location?, date_from?, date_to?, organizer_id?)
- `EventsListResponseDTO`: Odpowiedź API z paginacją (data: EventDTO[], pagination: PaginationDTO)

### Nowe typy ViewModel:

```typescript
interface EventFiltersViewModel {
  location?: string;
  dateFrom?: string; // Format: YYYY-MM-DD
  dateTo?: string;   // Format: YYYY-MM-DD
  status?: EventStatus;
}

interface EventCardViewModel extends EventDTO {
  availableSpots: number; // max_places - current_signups_count
  isFull: boolean;        // availableSpots <= 0
  canSignup: boolean;     // userRole === 'player' && !isFull && status === 'active'
  canManage: boolean;     // userRole === 'organizer' || userRole === 'admin'
}

interface EventsPageState {
  events: EventDTO[];
  filters: EventFiltersViewModel;
  pagination: PaginationDTO;
  loading: boolean;
  error: string | null;
  userRole: UserRole;
}
```

## 6. Zarządzanie stanem

Stan widoku zarządzany jest przez custom hook `useEventsList`, który enkapsuluje logikę ładowania danych, filtrowania i obsługi błędów. Hook korzysta z React Query do cache'owania i automatycznych odświeżeń.

Hook `useEventsList`:
- Zarządza stanem filtrów, paginacji i listy wydarzeń
- Obsługuje wywołania API z debounce dla filtrów
- Zapewnia metody do aktualizacji filtrów i nawigacji po stronach
- Obsługuje stany ładowania i błędów
- Automatycznie odświeża dane po zmianach (np. po zapisie na wydarzenie)

## 7. Integracja API

Integracja z endpointem `GET /api/events` poprzez React Query. 

**Typy żądania:**
- Query parameters: ListEventsQueryParams (page, limit, status, location, date_from, date_to, organizer_id)

**Typy odpowiedzi:**
- Sukces: EventsListResponseDTO (data: EventDTO[], pagination: PaginationDTO)
- Błędy: Error responses z kodami 401 (Unauthorized)

Wywołania API są wykonywane przez serwis `events.service.ts`, z obsługą autoryzacji poprzez nagłówki Authorization (JWT token).

## 8. Interakcje użytkownika

- **Filtrowanie wydarzeń**: Użytkownik wybiera filtry w komponencie EventFilters, zatwierdza przyciskiem "Zastosuj" - widok odświeża listę z nowymi parametrami
- **Przeglądanie kart**: Użytkownik może przewijać listę kart, każda karta zawiera kluczowe informacje o wydarzeniu
- **Zapis na wydarzenie**: Gracz klika przycisk "Zapisz się" w karcie - otwiera się modal potwierdzenia, po zatwierdzeniu pokazuje toast sukcesu i odświeża licznik miejsc
- **Nawigacja do szczegółów**: Kliknięcie w kartę wydarzenia przekierowuje do `/dashboard/events/{id}`
- **Zarządzanie wydarzeniami**: Organizator/Admin widzi dodatkowe przyciski edycji/usunięcia - kliknięcie otwiera odpowiednie modale lub przekierowuje
- **Paginacja**: Przyciski "Następna/Poprzednia strona" ładują kolejne porcje danych
- **Responsywność**: Na mobilnych urządzeniach filtry są zwijane w akordeon dla oszczędności miejsca

## 9. Warunki i walidacja

- **Autoryzacja**: Sprawdzana na poziomie middleware - brak tokena przekierowuje do logowania
- **Role-based dostęp**: Komponenty warunkowo renderują elementy na podstawie `userRole` (player/organizer/admin)
- **Status wydarzenia**: Tylko aktywne wydarzenia pokazują przycisk zapisu, wypełnione wydarzenia są wyszarzone
- **Dostępność miejsc**: Licznik `availableSpots` = max_places - current_signups_count, przycisk zapisu ukryty gdy <= 0
- **Walidacja filtrów**: Data "od" nie może być późniejsza niż data "do", lokalizacja z predefiniowanej listy
- **Paginacja**: Parametry page/limit walidowane po stronie API, maksymalny limit = 50
- **Real-time updates**: Po zapisie/odrezygnowaniu automatycznie odświeża liczniki miejsc

## 10. Obsługa błędów

- **Błąd autoryzacji (401)**: Przekierowanie do strony logowania z komunikatem "Sesja wygasła"
- **Błąd dostępu (403)**: Komunikat "Brak uprawnień do wykonania tej akcji"
- **Błąd serwera (500)**: Ogólny komunikat "Wystąpił błąd serwera, spróbuj ponownie później"
- **Błąd sieci**: Toast z komunikatem "Brak połączenia internetowego"
- **Pusta lista**: Przyjazny komunikat "Brak wydarzeń spełniających kryteria" z sugestią zmiany filtrów
- **Błąd walidacji**: Komunikaty specyficzne dla pól (np. "Nieprawidłowy format daty")
- **Fallback UI**: Komponenty ErrorBoundary dla nieprzewidzianych błędów

## 11. Kroki implementacji

1. **Utworzenie struktury komponentów**: Utworzyć foldery i pliki dla wszystkich komponentów w `src/components/events/`

2. **Implementacja typów ViewModel**: Dodać nowe interfejsy do `src/types.ts` lub osobnego pliku `events.types.ts`

3. **Utworzenie custom hooka**: Zaimplementować `useEventsList` w `src/lib/hooks/useEventsList.ts` z integracją React Query

4. **Implementacja EventCard**: Zacząć od najprostszego komponentu - karty wydarzenia z podstawowymi informacjami

5. **Implementacja EventFilters**: Dodać komponent filtrów z obsługą dat i lokalizacji

6. **Implementacja EventsList**: Kontener z obsługą paginacji i pustej listy

7. **Implementacja głównego EventsPage**: Połączyć wszystkie komponenty i dodać obsługę stanów

8. **Dodanie routingu**: Skonfigurować ścieżkę `/dashboard/events` w systemie routingu Astro

9. **Testowanie integracji**: Przetestować ładowanie danych, filtrowanie i interakcje użytkownika

10. **Dodanie obsługi błędów**: Zaimplementować ErrorBoundary i komunikaty błędów

11. **Optymalizacja UX**: Dodać loading states, skeleton loading, toast notifications

12. **Testowanie responsywności**: Zweryfikować wygląd i funkcjonalność na różnych urządzeniach

13. **Code review i refaktoring**: Sprawdzić zgodność z zasadami clean code i poprawić wydajność
