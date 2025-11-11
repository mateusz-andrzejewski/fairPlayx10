# Plan implementacji widoku Dashboard głównego

## 1. Przegląd

Dashboard główny to spersonalizowany punkt wejścia po logowaniu, dostarczający sekcje zależne od roli użytkownika (admin - zarządzanie użytkownikami; organizator - wydarzenia; gracz - nadchodzące wydarzenia). Główny cel to wyświetlanie najbliższego wydarzenia, listy nadchodzących wydarzeń oraz sekcji zarządzania z powiadomieniami o oczekujących akcjach. Widok jest zaprojektowany jako mobile-first z adaptacją do desktopu, z ochroną tras opartą na JWT i obsługą błędów przez toast notifications.

## 2. Routing widoku

Ścieżka widoku: `/dashboard`. Widok jest chroniony i wymaga autoryzacji użytkownika.

## 3. Struktura komponentów

- **Dashboard**: Główny komponent kontenerowy
  - **Header**: Nagłówek z informacjami użytkownika
  - **Navigation**: Sidebar (desktop) / Bottom navigation (mobile)
  - **MainContent**: Główna zawartość
    - **WelcomeSection**: Sekcja powitalna z najbliższym wydarzeniem
    - **UpcomingEventsList**: Lista nadchodzących wydarzeń
    - **ManagementSections**: Sekcje zarządzania (rola-zależne)
      - **UserManagementSection** (tylko admin)
      - **EventManagementSection** (admin/organizator)
      - **PlayerManagementSection** (admin/organizator)
    - **NotificationsPanel**: Panel powiadomień

## 4. Szczegóły komponentów

### Dashboard

- **Opis komponentu**: Główny komponent widoku, odpowiedzialny za ładowanie danych, zarządzanie stanem i renderowanie role-zależnych sekcji.
- **Główne elementy**: Header, Navigation, MainContent z warunkowymi sekcjami.
- **Obsługiwane interakcje**: Ładowanie danych przy montowaniu, obsługa błędów ładowania.
- **Obsługiwana walidacja**: Sprawdzanie roli użytkownika dla wyświetlania sekcji.
- **Typy**: DashboardViewModel, EventDTO, UserDTO.
- **Propsy**: Brak (komponent główny).

### Header

- **Opis komponentu**: Wyświetla informacje o zalogowanym użytkowniku i przycisk wylogowania.
- **Główne elementy**: Avatar, imię użytkownika, przycisk logout.
- **Obsługiwane interakcje**: Kliknięcie logout -> przekierowanie do /login.
- **Obsługiwana walidacja**: Brak.
- **Typy**: UserDTO.
- **Propsy**: currentUser: UserDTO.

### Navigation

- **Opis komponentu**: Responsywna nawigacja z linkami do sekcji dashboardu.
- **Główne elementy**: Lista linków (Dashboard, Wydarzenia, Użytkownicy/Gracze - rola-zależne).
- **Obsługiwane interakcje**: Kliknięcie linku -> nawigacja.
- **Obsługiwana walidacja**: Filtrowanie linków na podstawie roli.
- **Typy**: Role (enum).
- **Propsy**: userRole: Role.

### WelcomeSection

- **Opis komponentu**: Wyświetla najbliższe wydarzenie z przyciskami akcji.
- **Główne elementy**: Karta wydarzenia, przycisk "Zobacz szczegóły".
- **Obsługiwane interakcje**: Kliknięcie przycisku -> nawigacja do szczegółów wydarzenia.
- **Obsługiwana walidacja**: Sprawdzanie czy użytkownik jest zapisany.
- **Typy**: EventDTO.
- **Propsy**: nearestEvent: EventDTO | null.

### UpcomingEventsList

- **Opis komponentu**: Lista kart wydarzeń z paginacją.
- **Główne elementy**: Lista EventCard, przycisk "Więcej".
- **Obsługiwane interakcje**: Kliknięcie karty -> szczegóły; paginacja.
- **Obsługiwana walidacja**: Brak.
- **Typy**: EventDTO[].
- **Propsy**: events: EventDTO[], onLoadMore: () => void.

### ManagementSections

- **Opis komponentu**: Kontener dla sekcji zarządzania, renderowany warunkowo na podstawie roli.
- **Główne elementy**: UserManagementSection, EventManagementSection, PlayerManagementSection.
- **Obsługiwane interakcje**: Delegacja do podkomponentów.
- **Obsługiwana walidacja**: Sprawdzanie roli dla każdej sekcji.
- **Typy**: Role.
- **Propsy**: userRole: Role, sectionsData: { users: UserDTO[], events: EventDTO[], players: PlayerDTO[] }.

### NotificationsPanel

- **Opis komponentu**: Wyświetla powiadomienia o oczekujących akcjach.
- **Główne elementy**: Lista powiadomień z przyciskami akcji.
- **Obsługiwane interakcje**: Kliknięcie akcji -> wykonanie (np. zatwierdzenie użytkownika).
- **Obsługiwana walidacja**: Brak.
- **Typy**: NotificationDTO[].
- **Propsy**: notifications: NotificationDTO[].

## 5. Typy

- **EventDTO**: { id: number, name: string, date: string, location: string, maxSpots: number, cost: number, currentSignups: number }
- **UserDTO**: { id: number, email: string, firstName: string, lastName: string, role: Role, status: UserStatus }
- **PlayerDTO**: { id: number, userId: number, position: Position, skillRate: number, name: string }
- **NotificationDTO**: { id: number, type: string, message: string, actionUrl: string }
- **DashboardViewModel**: { currentUser: UserDTO, nearestEvent: EventDTO | null, upcomingEvents: EventDTO[], notifications: NotificationDTO[], managementData: { users: UserDTO[], events: EventDTO[], players: PlayerDTO[] } | null }
- **Role**: enum { admin, organizer, player }
- **UserStatus**: enum { pending, active, inactive }
- **Position**: enum { goalkeeper, defender, midfielder, forward }

## 6. Zarządzanie stanem

Zarządzanie stanem odbywa się przez customowy hook `useDashboardData`, który ładuje dane przy montowaniu komponentu Dashboard. Hook używa `useState` dla loading/error states oraz `useEffect` do wywołań API. Stan obejmuje: loading (boolean), error (string | null), dashboardData (DashboardViewModel). Hook obsługuje refetch po akcjach użytkownika.

## 7. Integracja API

Integracja z endpointami: GET /api/events (dla wydarzeń), GET /api/users (dla admina), GET /api/players (dla admina/organizatora). Typy żądania: brak ciała, parametry query dla paginacji. Typy odpowiedzi: { data: EventDTO[] }, { data: UserDTO[] }, { data: PlayerDTO[] }. Wywołania przez `fetch` z autoryzacją JWT w headers.

## 8. Interakcje użytkownika

- Logowanie: Przekierowanie na /dashboard.
- Przegląd wydarzeń: Kliknięcie karty -> nawigacja do /dashboard/events/{id}.
- Zarządzanie użytkownikami (admin): Kliknięcie sekcji -> lista użytkowników.
- Powiadomienia: Kliknięcie akcji -> wykonanie API call i odświeżenie danych.

## 9. Warunki i walidacja

- Rola użytkownika: Sprawdzana w Dashboard, wpływa na renderowanie sekcji (np. UserManagementSection tylko dla admin).
- Status użytkownika: Tylko active użytkownicy mają dostęp.
- Data wydarzeń: Wyświetlane tylko przyszłe wydarzenia.
- Prawa dostępu: API zwraca 403 dla niedozwolonych akcji.

## 10. Obsługa błędów

Błędy ładowania danych: Wyświetlanie toast z komunikatem błędu. Błędy API: Toast z retry opcją. Brak dostępu: Przekierowanie na /login. Edge case: Brak wydarzeń -> wyświetlanie pustej listy z komunikatem.

## 11. Kroki implementacji

1. Utworzyć komponent Dashboard w src/pages/dashboard.astro.
2. Zaimplementować hook useDashboardData w src/lib/hooks/useDashboardData.ts.
3. Stworzyć komponenty Header, Navigation, MainContent w src/components/dashboard/.
4. Dodać typy w src/types.ts.
5. Zintegrować wywołania API w hooku.
6. Dodać obsługę błędów i loading states.
7. Zaimplementować role-based rendering.
8. Przetestować widok na różnych urządzeniach.
9. Dodać unit testy dla komponentów.
10. Przeprowadzić code review i optymalizację wydajności.
