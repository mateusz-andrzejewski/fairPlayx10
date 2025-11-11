# Plan implementacji widoku wydarzeń

## 1. Przegląd

Widok wydarzeń umożliwia użytkownikom przeglądanie listy dostępnych wydarzeń sportowych z możliwością filtrowania, wyświetlania szczegółów poszczególnych wydarzeń oraz wykonywania akcji takich jak zapis na wydarzenie lub zarządzanie uczestnikami. Widok jest dostępny dla wszystkich zalogowanych użytkowników, ale funkcjonalność zależy od roli (gracz może się zapisywać, organizator może zarządzać, admin ma pełny dostęp). Głównym celem jest zapewnienie intuicyjnego interfejsu do przeglądania i interakcji z wydarzeniami piłkarskimi.

## 2. Routing widoku

Widok wydarzeń jest dostępny pod ścieżką `/dashboard/events` dla listy wydarzeń oraz `/dashboard/events/{id}` dla szczegółów konkretnego wydarzenia. Dostęp wymaga autentykacji - niezalogowani użytkownicy są przekierowywani do strony logowania.

## 3. Struktura komponentów

```
EventsPage (główny layout)
├── EventsList (lista wydarzeń z paginacją)
│   ├── EventFilters (komponent filtrów)
│   └── EventCard[] (karty wydarzeń)
│       ├── EventInfo (podstawowe informacje)
│       ├── EventStats (statystyki: miejsca, koszt)
│       └── SignupButton/ActionButtons (przyciski akcji)
└── EventDetailsPage (osobna strona szczegółów)
    ├── EventHeader (nagłówek z podstawowymi info)
    ├── EventDescription (szczegóły wydarzenia)
    ├── EventSignupsList (lista zapisów)
    │   └── SignupItem[] (pojedyncze zapisy)
    ├── SignupSection (sekcja zapisów dla graczy)
    └── OrganizerActions (akcje dla organizatora)
        ├── AddPlayerButton
        ├── EditEventButton
        └── DrawTeamsButton
```

## 4. Szczegóły komponentów

### EventsList

- **Opis komponentu**: Główny komponent odpowiedzialny za wyświetlanie paginowanej listy wydarzeń w formie kart. Obsługuje filtrowanie, wyszukiwanie i paginację. Jest punktem wejścia dla użytkowników chcących przeglądać dostępne wydarzenia.
- **Główne elementy**: Kontener z siatką kart wydarzeń, komponent paginacji, sekcja filtrów u góry, loading state podczas ładowania danych.
- **Obsługiwane interakcje**: Zmiana filtrów (wywołuje ponowne pobranie danych), kliknięcie w kartę wydarzenia (nawigacja do szczegółów), zmiana strony paginacji, odświeżenie listy.
- **Obsługiwana walidacja**: Walidacja parametrów filtrów (data_from < date_to, prawidłowy format dat), maksymalna długość parametrów wyszukiwania (100 znaków).
- **Typy**: `EventsListViewModel` (zawiera paginowane dane wydarzeń), `EventFiltersViewModel` (parametry filtrów), `EventCardViewModel` (dane pojedynczej karty).
- **Propsy**: `initialFilters?: EventFiltersViewModel`, `onEventClick: (eventId: number) => void`.

### EventCard

- **Opis komponentu**: Karta pojedynczego wydarzenia wyświetlająca kluczowe informacje w kompaktowej formie. Służy do szybkiego przeglądu wydarzeń na liście.
- **Główne elementy**: Obrazek/nagłówek wydarzenia, nazwa i lokalizacja, data/czas, informacje o miejscach (dostępne/zajęte), koszt udziału, przycisk akcji (zapis/navigacja).
- **Obsługiwane interakcje**: Kliknięcie w kartę (nawigacja do szczegółów), kliknięcie przycisku signup (szybki zapis z potwierdzeniem), hover effects dla lepszej UX.
- **Obsługiwana walidacja**: Sprawdzanie czy użytkownik może się zapisać (nie jest już zapisany, wydarzenie ma wolne miejsca, data w przyszłości).
- **Typy**: `EventCardViewModel` (rozszerzony EventDTO z computed properties), `UserRole` (do warunkowego renderowania).
- **Propsy**: `event: EventCardViewModel`, `userRole: UserRole`, `onSignup: (eventId: number) => Promise<void>`, `onNavigate: (eventId: number) => void`.

### EventFilters

- **Opis komponentu**: Komponent formularza z kontrolkami do filtrowania listy wydarzeń. Pozwala na wyszukiwanie po lokalizacji, zakresie dat i statusie wydarzenia.
- **Główne elementy**: Pole wyszukiwania tekstowego, select dla lokalizacji, date pickery dla zakresu dat, przyciski zastosuj/wyczyść filtry.
- **Obsługiwane interakcje**: Wprowadzanie tekstu w pola wyszukiwania, wybór opcji z list, zmiana dat, zatwierdzenie filtrów (wywołuje callback z nowymi parametrami).
- **Obsługiwana walidacja**: Walidacja formatu dat (date_from <= date_to), maksymalna długość wyszukiwania (100 znaków), sprawdzanie czy wybrane lokalizacje są dostępne.
- **Typy**: `EventFiltersViewModel` (interfejs parametrów filtrów), `LocationOption[]` (lista dostępnych lokalizacji).
- **Propsy**: `filters: EventFiltersViewModel`, `availableLocations: LocationOption[]`, `onFiltersChange: (filters: EventFiltersViewModel) => void`, `onReset: () => void`.

### EventDetails

- **Opis komponentu**: Komponent wyświetlający pełne szczegóły pojedynczego wydarzenia wraz z listą zapisanych uczestników. Centralny punkt dla interakcji z konkretnym wydarzeniem.
- **Główne elementy**: Nagłówek z nazwą wydarzenia, sekcja informacji podstawowych, lista uczestników z statusami, przyciski akcji zależne od roli użytkownika.
- **Obsługiwane interakcje**: Powrót do listy, zapis na wydarzenie, rezygnacja z zapisu, dodanie gracza (organizator), edycja wydarzenia, uruchomienie losowania drużyn.
- **Obsługiwana walidacja**: Sprawdzanie uprawnień do akcji (rola użytkownika), sprawdzanie czy wydarzenie pozwala na zapisy (status active, wolne miejsca), walidacja danych przy dodawaniu graczy.
- **Typy**: `EventDetailsViewModel` (EventDetailDTO z dodatkowymi flagami), `EventSignupViewModel[]` (lista zapisów z nazwami graczy).
- **Propsy**: `eventId: number`, `userRole: UserRole`, `currentUserId?: number`.

### EventForm

- **Opis komponentu**: Formularz do tworzenia nowych wydarzeń lub edycji istniejących. Zawiera wszystkie wymagane pola z walidacją i obsługą błędów.
- **Główne elementy**: Pola formularza (nazwa, lokalizacja, data/czas, maksymalna liczba miejsc, opcjonalna opłata), przyciski submit/anuluj, komunikaty błędów.
- **Obsługiwane interakcje**: Wprowadzanie danych w pola, wybór daty/czasu, zatwierdzenie formularza (wysłanie do API), anulowanie (powrót bez zapisywania).
- **Obsługiwana walidacja**: Wymagane pola (nazwa, lokalizacja, data/czas, max_places), przyszła data wydarzenia, max_places > 0, optional_fee >= 0 jeśli podana, maksymalne długości tekstów (200 znaków).
- **Typy**: `CreateEventCommand | UpdateEventCommand` (dane formularza), `EventFormErrors` (błędy walidacji).
- **Propsy**: `event?: EventDTO` (dla edycji), `onSubmit: (data: CreateEventCommand | UpdateEventCommand) => Promise<void>`, `onCancel: () => void`.

## 5. Typy

### DTO (Data Transfer Objects)

- `EventDTO`: Podstawowy DTO wydarzenia zawierający pola: `id`, `name`, `location`, `event_datetime`, `max_places`, `optional_fee`, `status`, `current_signups_count`, `organizer_id`, `created_at`, `updated_at`, `deleted_at`
- `EventDetailDTO`: Rozszerzony EventDTO o pole `signups: EventSignupDTO[]`
- `EventSignupDTO`: DTO zapisu zawierający: `id`, `event_id`, `player_id`, `signup_timestamp`, `status`, `resignation_timestamp`
- `EventsListResponseDTO`: PaginatedDataDTO<EventDTO> - paginowana odpowiedź z listą wydarzeń

### ViewModel Types

- `EventCardViewModel`: Rozszerza EventDTO o computed properties: `isFull: boolean` (czy wszystkie miejsca zajęte), `canSignup: boolean` (czy użytkownik może się zapisać), `daysUntilEvent: number` (dni do wydarzenia), `formattedDate: string` (sformatowana data), `formattedTime: string` (sformatowany czas)
- `EventDetailsViewModel`: Rozszerza EventDetailDTO o: `isOrganizer: boolean` (czy użytkownik jest organizatorem), `isSignedUp: boolean` (czy użytkownik jest zapisany), `canManageSignups: boolean` (czy użytkownik może zarządzać zapisami), `signupsWithNames: EventSignupWithNameViewModel[]` (zapisy z nazwami graczy)
- `EventSignupWithNameViewModel`: Rozszerza EventSignupDTO o: `playerName: string` (imię i nazwisko gracza), `position?: PlayerPosition` (pozycja gracza), `skillRate?: number` (skill rate - tylko dla organizatora/admina)
- `EventFiltersViewModel`: Zawiera pola: `page?: number`, `limit?: number`, `status?: EventStatus`, `location?: string`, `date_from?: string`, `date_to?: string`, `organizer_id?: number`, `search?: string`
- `EventFormViewModel`: Zawiera pola formularza: `name: string`, `location: string`, `event_datetime: string`, `max_places: number`, `optional_fee?: number`, z dodatkowymi polami: `isSubmitting: boolean`, `errors: EventFormErrors`

## 6. Zarządzanie stanem

Stan w widoku wydarzeń jest zarządzany za pomocą custom hooków React z wykorzystaniem useState i useEffect. Główny stan aplikacji jest rozłożony na kilka warstw:

- **Lista wydarzeń**: Zarządzana przez custom hook `useEventsList` który obsługuje filtrowanie, paginację i ładowanie danych. Stan zawiera: `events: EventCardViewModel[]`, `pagination: PaginationMetaDTO`, `filters: EventFiltersViewModel`, `isLoading: boolean`, `error: string | null`

- **Szczegóły wydarzenia**: Hook `useEventDetails` zarządza stanem pojedynczego wydarzenia: `event: EventDetailsViewModel | null`, `isLoading: boolean`, `error: string | null`, `lastUpdated: Date`

- **Formularz wydarzenia**: Hook `useEventForm` obsługuje stan formularza edycji/tworzenia: `formData: EventFormViewModel`, `isSubmitting: boolean`, `errors: EventFormErrors`, `isDirty: boolean`

Dodatkowo używane są toast notifications do wyświetlania komunikatów sukcesu/błędów oraz loading states dla lepszego UX.

## 7. Integracja API

Integracja z API odbywa się poprzez wywołania REST do endpointów Supabase z wykorzystaniem JWT tokenów do autentykacji. Główne integracje:

- **GET /api/events**: Pobieranie listy wydarzeń z parametrami query (ListEventsQueryParams). Typ żądania: GET z query parameters. Typ odpowiedzi: EventsListResponseDTO
- **GET /api/events/{id}**: Pobieranie szczegółów wydarzenia. Typ żądania: GET z path parameter `id: number`. Typ odpowiedzi: EventDetailDTO
- **POST /api/events**: Tworzenie nowego wydarzenia (tylko organizator/admin). Typ żądania: POST z body CreateEventCommand. Typ odpowiedzi: EventDTO
- **PATCH /api/events/{id}**: Edycja wydarzenia (tylko organizator/admin). Typ żądania: PATCH z path parameter `id: number` i body UpdateEventCommand. Typ odpowiedzi: EventDTO
- **POST /api/events/{eventId}/signups**: Zapis na wydarzenie. Typ żądania: POST z path parameter `eventId: number` i body CreateEventSignupCommand. Typ odpowiedzi: EventSignupDTO
- **DELETE /api/events/{eventId}/signups/{signupId}**: Rezygnacja z wydarzenia. Typ żądania: DELETE z path parameters. Typ odpowiedzi: 204 No Content

Wszystkie żądania zawierają Authorization header z Bearer tokenem JWT.

## 8. Interakcje użytkownika

- **Przeglądanie listy wydarzeń**: Użytkownik otwiera stronę wydarzeń, widzi listę kart wydarzeń z paginacją. Może stosować filtry zmieniając parametry wyszukiwania.
- **Filtrowanie wydarzeń**: Użytkownik wprowadza kryteria filtrowania (lokalizacja, zakres dat), klika "Zastosuj" - lista odświeża się z wynikami spełniającymi kryteria.
- **Przejście do szczegółów**: Kliknięcie w kartę wydarzenia przenosi użytkownika do strony szczegółów wydarzenia.
- **Zapis na wydarzenie**: W szczegółach wydarzenia użytkownik klika przycisk "Zapisz się" -> otwiera się modal potwierdzenia -> po potwierdzeniu wysyłane jest żądanie API -> wyświetla się toast sukcesu i przycisk zmienia się na "Zapisany".
- **Rezygnacja z wydarzenia**: Użytkownik klika przycisk "Zrezygnuj" obok swojego zapisu -> modal potwierdzenia -> po potwierdzeniu zapis zostaje usunięty.
- **Dodanie gracza (organizator)**: Organizator klika "Dodaj gracza" -> modal z wyszukiwaniem graczy -> wybór gracza -> zapis zostaje dodany.
- **Edycja wydarzenia (organizator)**: Kliknięcie "Edytuj" otwiera formularz edycji z pre-filled danymi -> zmiany -> zapisanie aktualizuje wydarzenie.

## 9. Warunki i walidacja

Warunki weryfikowane przez komponenty dotyczą głównie uprawnień i stanu biznesowego:

- **Data wydarzenia**: Musi być w przyszłości (event_datetime > now), walidacja na poziomie formularza i API
- **Liczba miejsc**: max_places > 0, current_signups_count <= max_places, sprawdzane przy renderowaniu przycisków i API
- **Uprawnienia**: Organizator może zarządzać tylko swoimi wydarzeniami (organizer_id === currentUserId), admin ma dostęp do wszystkich
- **Status wydarzenia**: Tylko wydarzenia ze statusem 'active' pozwalają na zapisy, sprawdzane w EventCard i EventDetails
- **Unikalność zapisów**: Jeden gracz może mieć tylko jeden zapis na wydarzenie, sprawdzane przez API (409 Conflict)
- **Opcjonalna opłata**: Jeśli podana, musi być >= 0, walidacja w formularzu
- **Długość tekstów**: name i location maksymalnie 200 znaków, walidacja inline w formularzach

Stan UI dostosowuje się do tych warunków - przyciski są ukrywane/wyłączane gdy akcje nie są dozwolone.

## 10. Obsługa błędów

- **Błędy sieciowe**: Wyświetlanie toast z błędem i opcją retry, automatyczne ponawianie dla GET requestów
- **Błędy walidacji**: Inline wyświetlanie błędów w formularzach, czerwone obramowanie pól, komunikaty pod polami
- **Błędy autoryzacji**: Przekierowanie do logowania (401), toast z informacją o braku uprawnień (403)
- **Błędy biznesowe**: Toast z konkretną informacją (np. "Wszystkie miejsca są zajęte", "Jesteś już zapisany")
- **Błędy 404**: Przekierowanie do listy wydarzeń z toast "Wydarzenie nie zostało znalezione"
- **Błędy 409**: Toast "Już jesteś zapisany na to wydarzenie"
- **Błędy serwera (5xx)**: Toast z ogólną informacją o błędzie, logowanie do konsoli dla developerów

## 11. Kroki implementacji

1. **Przygotowanie struktury plików**: Utworzyć katalogi `src/pages/dashboard/events/` i `src/components/events/`, dodać podstawowe pliki TypeScript dla nowych typów ViewModel
2. **Implementacja typów ViewModel**: Dodać nowe typy w `src/types.ts` - EventCardViewModel, EventDetailsViewModel, EventFiltersViewModel, EventFormViewModel
3. **Implementacja custom hooków**: Utworzyć `useEventsList`, `useEventDetails`, `useEventForm` w `src/lib/hooks/`
4. **Implementacja komponentów bazowych**: Zacząć od EventCard - prosty komponent wyświetlający dane wydarzenia z podstawowymi stylami
5. **Implementacja EventFilters**: Formularz filtrów z kontrolkami Shadcn/ui, obsługa zmian stanu
6. **Implementacja EventsList**: Główny komponent listy z integracją hooków, obsługa paginacji i filtrów
7. **Implementacja EventDetails**: Komponent szczegółów z listą zapisów, warunkowe renderowanie dla różnych ról
8. **Implementacja EventForm**: Kompletny formularz z walidacją Zod, obsługa tworzenia i edycji
9. **Integracja stron Astro**: Dodać strony `/dashboard/events/index.astro` i `/dashboard/events/[id].astro`
10. **Dodanie nawigacji**: Zaktualizować menu nawigacyjne aby zawierało link do wydarzeń
11. **Testowanie integracji**: Sprawdzenie wszystkich endpointów API, testowanie różnych scenariuszy użytkowników
12. **Optymalizacja UX**: Dodać loading states, skeleton loading, animacje przejść
13. **Testowanie responsywności**: Upewnić się że widok działa poprawnie na mobile i desktop
14. **Dodanie testów**: Unit testy dla hooków i komponentów, integracyjne testy dla kluczowych ścieżek
