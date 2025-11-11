# Architektura UI dla Platforma FairPlay

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika dla Platformy FairPlay została zaprojektowana jako responsywna, mobile-first aplikacja webowa oparta na Astro 5, React 19, TypeScript 5, Tailwind CSS 4 i komponentach Shadcn/ui. Główny nacisk położono na doświadczenie użytkownika w zakresie organizacji amatorskich meczów piłkarskich, z uwzględnieniem ról użytkowników (admin, organizator, gracz) i kluczowych funkcji jak rejestracja, zarządzanie wydarzeniami, zapisy oraz automatyczne losowanie drużyn. Struktura opiera się na hierarchii widoków z centralnym dashboardem po logowaniu, z warunkowym renderowaniem treści w zależności od roli. Wszystkie widoki są zaprojektowane z myślą o dostępności (WCAG 2.1) i bezpieczeństwie, z ochroną tras opartą na JWT (implementacja odroczona). Zarządzanie stanem odbywa się przez React, błędy są obsługiwane przez toast notifications i walidację klienta. Architektura jest zgodna z planem API, wykorzystując endpointy dla użytkowników, graczy, wydarzeń, zapisów i przypisań drużyn.

## 2. Lista widoków

### Widok logowania
- **Ścieżka widoku**: `/login`
- **Główny cel**: Umożliwić użytkownikom uwierzytelnienie się w systemie poprzez podanie email i hasła.
- **Kluczowe informacje do wyświetlenia**: Formularz z polami email i hasło, przycisk logowania, link do rejestracji, komunikaty błędów.
- **Kluczowe komponenty widoku**: Formularz logowania (Shadcn/ui), przycisk akcji, link nawigacyjny.
- **UX, dostępność i względy bezpieczeństwa**: Prosty, intuicyjny formularz z walidacją klienta; obsługa keyboard navigation i screen readerów; bezpieczne przechowywanie danych (HTTPS); przekierowanie po sukcesie do dashboardu; obsługa błędów z toastami.

### Widok rejestracji
- **Ścieżka widoku**: `/register`
- **Główny cel**: Pozwolić nowym użytkownikom na rejestrację konta z obowiązkową zgodą RODO, kończącą się statusem pending.
- **Kluczowe informacje do wyświetlenia**: Formularz z polami email, hasło, imię, nazwisko, pozycja, zgoda RODO; komunikat o statusie pending po rejestracji.
- **Kluczowe komponenty widoku**: Wieloetapowy formularz rejestracji (Shadcn/ui), checkbox zgody, przycisk submit.
- **UX, dostępność i względy bezpieczeństwa**: Walidacja inline i przed wysłaniem; obsługa błędów z toastami; zgodność z RODO (zgoda obowiązkowa); brak dostępu do funkcji bez zatwierdzenia przez admina.

### Dashboard główny
- **Ścieżka widoku**: `/dashboard`
- **Główny cel**: Dostarczyć spersonalizowany punkt wejścia po logowaniu, z sekcjami zależnymi od roli użytkownika (admin - zarządzanie użytkownikami; organizator - wydarzenia; gracz - nadchodzące wydarzenia).
- **Kluczowe informacje do wyświetlenia**: Najbliższe wydarzenie, lista nadchodzących wydarzeń, sekcje zarządzania (użytkownicy/wydarzenia dla admina/organizatora), powiadomienia o oczekujących akcjach.
- **Kluczowe komponenty widoku**: Karty wydarzeń, lista sekcji, przyciski akcji, sidebar/bottom navigation.
- **UX, dostępność i względy bezpieczeństwa**: Mobile-first layout z adaptacją do desktopu; real-time updates (ręczne odświeżanie na razie); ochrona tras (JWT, komentarze dla ról); dostępność przez semantyczne HTML i ARIA.

### Lista użytkowników (dla admina)
- **Ścieżka widoku**: `/dashboard/users`
- **Główny cel**: Pozwolić adminowi na przeglądanie, wyszukiwanie i zatwierdzanie oczekujących kont użytkowników.
- **Kluczowe informacje do wyświetlenia**: Lista użytkowników z statusem, rolą, wyszukiwarką; szczegóły użytkownika z opcją zatwierdzenia i powiązania z profilem gracza.
- **Kluczowe komponenty widoku**: Tabela użytkowników (Shadcn/ui), formularz wyszukiwania, modale zatwierdzania.
- **UX, dostępność i względy bezpieczeństwa**: Filtrowanie i paginacja dla dużych list; confirm dialogs dla akcji; audit trail dla zmian; tylko dla roli admin.

### Lista graczy (dla admina/organizatora)
- **Ścieżka widoku**: `/dashboard/players`
- **Główny cel**: Umożliwić zarządzanie profilami graczy, w tym edycję skill rate (tylko admin).
- **Kluczowe informacje do wyświetlenia**: Lista graczy z pozycją, nazwiskiem; szczegóły z skill rate (ukryte dla innych ról); opcje dodawania/edycji/usuwania.
- **Kluczowe komponenty widoku**: Tabela graczy, formularze edycji, przyciski akcji.
- **UX, dostępność i względy bezpieczeństwa**: Wyszukiwarka i filtry; walidacja danych; skill rate widoczny tylko dla admina; soft delete.

### Lista wydarzeń
- **Ścieżka widoku**: `/dashboard/events`
- **Główny cel**: Wyświetlić feed wydarzeń z filtrami, umożliwiając przeglądanie i akcje w zależności od roli (tworzenie dla organizatora, signup dla gracza).
- **Kluczowe informacje do wyświetlenia**: Karty wydarzeń z nazwą, datą, lokalizacją, wolnymi miejscami, kosztem; filtry po dacie/lokalizacji; przyciski akcji (signup, zarządzanie).
- **Kluczowe komponenty widoku**: Karty wydarzeń (Shadcn/ui), filtry boczne/collapse, przyciski one-click.
- **UX, dostępność i względy bezpieczeństwa**: Mobile-first z collapsible filtrami na desktopie; real-time liczniki miejsc; toast po signupie; brak dostępu dla niezalogowanych.

### Szczegóły wydarzenia
- **Ścieżka widoku**: `/dashboard/events/{id}`
- **Główny cel**: Przedstawić pełne informacje o wydarzeniu, umożliwiając zapisy, zarządzanie uczestnikami i losowanie drużyn.
- **Kluczowe informacje do wyświetlenia**: Szczegóły wydarzenia, lista zapisów, przycisk losowania; dla organizatora: opcje dodawania graczy, edycji wydarzenia.
- **Kluczowe komponenty widoku**: Karta wydarzenia, lista uczestników, przycisk losowania, modale akcji.
- **UX, dostępność i względy bezpieczeństwa**: One-click signup z modalem potwierdzenia; timestamp dla kolejności; confirm dialogs dla rezygnacji; role-based widoczność.

### Widok losowania drużyn
- **Ścieżka widoku**: `/dashboard/events/{id}/draw`
- **Główny cel**: Uruchomić algorytm losowania lub pozwolić na manualną korektę składów drużyn.
- **Kluczowe informacje do wyświetlenia**: Statystyki drużyn (średni skill rate, pozycje), przycisk uruchomienia algorytmu, drag-and-drop dla edycji; powiadomienia o wyniku.
- **Kluczowe komponenty widoku**: Przycisk akcji, wyświetlacz statystyk, drag-and-drop interface (Shadcn/ui), toast sukcesu/porażki.
- **UX, dostępność i względy bezpieczeństwa**: Fallback do manualnej edycji jeśli algorytm nie osiągnie balansu; skill rate widoczny tylko dla organizatora/admina; retry opcje.

### Formularz tworzenia/edycji wydarzenia (dla organizatora/admina)
- **Ścieżka widoku**: `/dashboard/events/new` lub `/dashboard/events/{id}/edit`
- **Główny cel**: Umożliwić tworzenie lub edycję wydarzeń z walidacją danych.
- **Kluczowe informacje do wyświetlenia**: Formularz z polami nazwa, lokalizacja, data/czas, max miejsc, opłata; komunikaty błędów.
- **Kluczowe komponenty widoku**: Formularz (Shadcn/ui), date picker, przycisk submit.
- **UX, dostępność i względy bezpieczeństwa**: Walidacja przyszłej daty; czas tworzenia <2 min; confirm dla zmian; role-based dostęp.

## 3. Mapa podróży użytkownika

Podróż użytkownika rozpoczyna się od rejestracji (widok rejestracji → status pending → email potwierdzenia), następnie logowania (widok logowania → dashboard główny). Na dashboardzie użytkownik widzi sekcje zależne od roli: gracz przegląda listę wydarzeń (dashboard → lista wydarzeń → szczegóły wydarzenia → one-click signup → toast sukcesu); organizator tworzy wydarzenie (dashboard → formularz wydarzenia → lista wydarzeń); admin zatwierdza użytkowników (dashboard → lista użytkowników → modal zatwierdzania → powiadomienie). Dla losowania: szczegóły wydarzenia → widok losowania → uruchomienie algorytmu → sukces lub manualna edycja → powiadomienia. Główny przypadek użycia (rejestracja → zatwierdzenie → logowanie → dashboard → przegląd wydarzeń → signup → losowanie) jest podzielony na kroki: 1. Rejestracja i oczekiwanie; 2. Zatwierdzenie przez admina; 3. Logowanie i dostęp do funkcji; 4. Interakcja z wydarzeniami; 5. Uczestnictwo w losowaniu.

## 4. Układ i struktura nawigacji

Nawigacja jest oparta na sidebarze na desktopie i bottom navigation na mobile'u, z centralnym dashboardem jako punktem wejścia. Widoki są chronione trasami (JWT odroczony), z przekierowaniem niezalogowanych do logowania. Menu zawiera linki do dashboardu, wydarzeń, graczy/użytkowników (rola-zależne), z breadcrumbs dla głębokich widoków. Przejścia między widokami są płynne, z loading states i error handling.

## 5. Kluczowe komponenty

- **Karta wydarzenia**: Wyświetla kluczowe info wydarzenia z przyciskami akcji; używana w liście wydarzeń i dashboardzie.
- **Formularz uniwersalny**: Na podstawie Shadcn/ui, z walidacją; używany w rejestracji, logowaniu, tworzeniu wydarzeń.
- **Tabela z paginacją**: Dla list użytkowników/graczy/wydarzeń; z wyszukiwaniem i filtrami.
- **Modal potwierdzenia**: Dla akcji jak signup, rezygnacja, zatwierdzenie; z ARIA dla dostępności.
- **Toast notification**: Globalny komponent dla błędów API i sukcesów; z retry opcjami.
- **Drag-and-drop interface**: Dla manualnej edycji drużyn w widoku losowania.
