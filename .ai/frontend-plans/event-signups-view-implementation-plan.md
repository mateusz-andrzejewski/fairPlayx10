# Plan implementacji widoku zarządzania zapisami na wydarzenie

## 1. Przegląd

Widok zarządzania zapisami na wydarzenie umożliwia organizatorom i administratorom przeglądanie, zarządzanie oraz aktualizację statusów zapisów uczestników na konkretne wydarzenie. Głównym celem jest zapewnienie intuicyjnego interfejsu do obsługi zapisów, w tym dodawania nowych graczy, potwierdzania lub wycofywania zapisów, z uwzględnieniem ról użytkowników i warunków bezpieczeństwa. Widok jest częścią dashboardu aplikacji FairPlayx10, wykorzystuje mobile-first podejście i integruje się z API wydarzeń.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/dashboard/events/{eventId}/signups`, gdzie `{eventId}` to identyfikator wydarzenia pobrany z parametrów URL. Dostęp ograniczony do użytkowników z rolami organizer lub admin; niezalogowani użytkownicy są przekierowywani do strony logowania.

## 3. Struktura komponentów

- **EventSignupsView** (główny komponent strony)
  - **EventSignupsList** (lista zapisów z paginacją)
    - **SignupCard** (karta pojedynczego zapisu, powtarzalna)
      - **StatusBadge** (wskaźnik statusu)
      - **ActionButtons** (przyciski akcji, zależne od roli)
    - **PaginationControls** (kontrola paginacji)
  - **AddPlayerModal** (modal dodawania gracza, warunkowy dla organizatora)
  - **ConfirmModal** (modal potwierdzenia akcji, ogólny)
  - **LoadingSpinner** (wskaźnik ładowania, warunkowy)
  - **ErrorMessage** (komunikat błędu, warunkowy)

## 4. Szczegóły komponentów

### EventSignupsView

- **Opis komponentu**: Główny komponent widoku odpowiedzialny za zarządzanie stanem ogólnym, ładowanie danych oraz renderowanie głównego layoutu. Składa się z listy zapisów, modalnych okienek i obsługi błędów. Jego przeznaczeniem jest koordynacja wszystkich podkomponentów i integracja z API.
- **Główne elementy**: Kontener główny z nagłówkiem wydarzenia, przyciskiem "Dodaj gracza" (dla organizatora), listą zapisów oraz modalami. Wykorzystuje komponenty z Shadcn/ui takie jak Button, Modal i Card.
- **Obsługiwane interakcje**: Ładowanie danych przy montowaniu, obsługa błędów z toastami, otwieranie/zamykanie modalów, odświeżanie listy po akcjach.
- **Obsługiwana walidacja**: Sprawdzanie obecności i poprawności `eventId` z parametrów URL; weryfikacja roli użytkownika (organizer/admin); zapobieganie akcji dla niezalogowanych użytkowników.
- **Typy**: EventSignupsListDTO (dla danych listy), SignupCardViewModel[] (dla kart), AddPlayerFormData (dla modalu dodawania), ConfirmActionData (dla modalu potwierdzenia).
- **Propsy**: Brak propsów od rodzica (jest to strona główna); przyjmuje `eventId` z kontekstu routingu Astro.

### EventSignupsList

- **Opis komponentu**: Komponent odpowiedzialny za wyświetlanie paginowanej listy zapisów. Składa się z kart zapisów i kontrolek paginacji. Jego przeznaczeniem jest prezentacja danych w czytelnej formie z możliwością filtrowania i nawigacji.
- **Główne elementy**: Lista kart `SignupCard`, komponenty paginacji (np. przyciski "Następna/Poprzednia"), opcjonalne filtry po statusie. Wykorzystuje komponenty Shadcn/ui takie jak List i Pagination.
- **Obsługiwane interakcje**: Zmiana strony paginacji, aplikowanie filtrów, propagacja zdarzeń z kart (np. update status, withdraw).
- **Obsługiwana walidacja**: Sprawdzanie poprawności parametrów paginacji (page >=1, limit >0); weryfikacja istnienia danych w liście.
- **Typy**: EventSignupsListDTO (dla pełnej listy z paginacją), SignupCardViewModel (dla pojedynczych kart).
- **Propsy**: `signups: SignupCardViewModel[]`, `pagination: PaginationMeta`, `onPageChange: (page: number) => void`, `onAction: (action: SignupAction) => void`.

### SignupCard

- **Opis komponentu**: Karta reprezentująca pojedynczy zapis uczestnika. Składa się z danych gracza, statusu i przycisków akcji. Jego przeznaczeniem jest wyświetlanie informacji o zapisie oraz umożliwienie akcji takich jak aktualizacja statusu lub wycofanie.
- **Główne elementy**: Awatar gracza, imię/nazwisko, pozycja, timestamp zapisu, badge statusu, przyciski akcji (Potwierdź, Wycofaj). Wykorzystuje komponenty Shadcn/ui takie jak Card, Badge i Button.
- **Obsługiwane interakcje**: Kliknięcie przycisków akcji (wywołuje callback do rodzica), wyświetlanie szczegółów na hover.
- **Obsługiwana walidacja**: Sprawdzanie roli użytkownika dla widoczności przycisków (np. tylko organizer może potwierdzać); weryfikacja możliwych przejść statusów (pending → confirmed/withdrawn); blokada akcji dla własnych zapisów przez organizatora.
- **Typy**: SignupCardViewModel (główne dane karty), ConfirmActionData (dla akcji wymagających potwierdzenia).
- **Propsy**: `signup: SignupCardViewModel`, `userRole: UserRole`, `onAction: (action: SignupAction) => void`.

### AddPlayerModal

- **Opis komponentu**: Modal umożliwiający organizatorowi dodanie nowego gracza do wydarzenia. Składa się z formularza wyszukiwania gracza i przycisków akcji. Jego przeznaczeniem jest ułatwienie manualnego dodawania uczestników poza one-click signup.
- **Główne elementy**: Formularz z polem wyszukiwania gracza (select lub input z autocomplete), przyciski "Dodaj" i "Anuluj". Wykorzystuje komponenty Shadcn/ui takie jak Modal, Form i Select.
- **Obsługiwane interakcje**: Wyszukiwanie graczy, wybór gracza, submit formularza (wywołuje callback), zamykanie modalu.
- **Obsługiwana walidacja**: Sprawdzanie istnienia wybranego gracza; weryfikacja, czy gracz nie jest już zapisany (unikalność); wymaganie roli organizer/admin.
- **Typy**: AddPlayerFormData (dane formularza), PlayerDTO[] (lista graczy do wyboru).
- **Propsy**: `isOpen: boolean`, `onClose: () => void`, `onSubmit: (data: AddPlayerFormData) => void`, `availablePlayers: PlayerDTO[]`.

### ConfirmModal

- **Opis komponentu**: Ogólny modal potwierdzenia dla akcji wymagających zgody użytkownika, takich jak wycofanie zapisu lub zmiana statusu. Składa się z komunikatu i przycisków Tak/Nie. Jego przeznaczeniem jest zapobieganie przypadkowym akcjom.
- **Główne elementy**: Komunikat potwierdzający akcję, przyciski "Potwierdź" i "Anuluj". Wykorzystuje komponenty Shadcn/ui takie jak Modal i Button.
- **Obsługiwane interakcje**: Kliknięcie przycisku potwierdzenia (wywołuje callback), zamykanie modalu.
- **Obsługiwana walidacja**: Brak specyficznych warunków walidacji (ogólny modal); weryfikacja obecności danych akcji.
- **Typy**: ConfirmActionData (dane akcji do potwierdzenia).
- **Propsy**: `isOpen: boolean`, `actionData: ConfirmActionData`, `onConfirm: () => void`, `onCancel: () => void`.

## 5. Typy

Wymagane typy obejmują rozszerzenia istniejących typów z `@types.ts` oraz nowe ViewModel dla komponentów. Wszystkie typy są zdefiniowane w TypeScript z ścisłym typowaniem.

- **EventSignupsListDTO**: Rozszerzenie istniejącego typu dla listy zapisów z paginacją. Pola: `data: EventSignupDTO[]` (lista zapisów), `pagination: { page: number, limit: number, total: number, totalPages: number }` (metadane paginacji).
- **SignupCardViewModel**: Nowy typ dla karty zapisu, łączący dane zapisu z informacjami gracza. Pola: `id: number` (ID zapisu), `player: { id: number, name: string, position: string }` (dane gracza), `status: 'pending' | 'confirmed' | 'withdrawn'` (status zapisu), `signupTimestamp: string` (data zapisu), `canEdit: boolean` (flaga uprawnień edycji, obliczana na podstawie roli).
- **AddPlayerFormData**: Nowy typ dla danych formularza dodawania gracza. Pola: `playerId: number` (ID wybranego gracza).
- **ConfirmActionData**: Nowy typ dla danych akcji wymagających potwierdzenia. Pola: `action: 'withdraw' | 'updateStatus'` (typ akcji), `signupId: number` (ID zapisu), `newStatus?: 'confirmed' | 'withdrawn'` (nowy status dla update, opcjonalny).
- **PaginationMeta**: Istniejący lub nowy typ dla metadanych paginacji. Pola: `page: number`, `limit: number`, `total: number`, `totalPages: number`.
- **SignupAction**: Nowy typ union dla akcji z kart. Pola: `{ type: 'updateStatus', signupId: number, newStatus: string } | { type: 'withdraw', signupId: number }`.

## 6. Zarządzanie stanem

Zarządzanie stanem odbywa się za pomocą React hooks w głównym komponencie `EventSignupsView`. Wykorzystywany jest custom hook `useEventSignups(eventId: number)`, który enkapsuluje logikę ładowania danych, obsługi akcji i błędów. Stan obejmuje:

- `signups: SignupCardViewModel[]` - lista zapisów, aktualizowana po wywołaniach API.
- `loading: boolean` - flaga ładowania, używana do wyświetlania spinnera.
- `error: string | null` - komunikat błędu, wyświetlany w toastach.
- `pagination: PaginationMeta` - stan paginacji, zarządzany przy zmianach strony.
- `modals: { addPlayerOpen: boolean, confirmOpen: boolean, confirmData: ConfirmActionData | null }` - stan modalnych okienek.

Hook obsługuje efekty uboczne (useEffect dla ładowania początkowego), callbacki dla akcji oraz optymalizację za pomocą useCallback. Nie wymaga zewnętrznych bibliotek jak Redux, gdyż stan jest lokalny i prosty.

## 7. Integracja API

Integracja opiera się na wywołaniach API zdefiniowanych w `@api-plan.md` i zaimplementowanych w `signups.ts` oraz `[signupId].ts`. Używa się `fetch` z Astro dla żądań, z autoryzacją Bearer (odroczona, tymczasowo hardcoded). Typy żądania i odpowiedzi:

- **GET /api/events/{eventId}/signups**: Żądanie z query params (`page`, `limit`, `status`). Odpowiedź: `EventSignupsListDTO`. Używane do ładowania listy.
- **POST /api/events/{eventId}/signups**: Żądanie z body `CreateEventSignupSchema` (np. `{ player_id: number }`). Odpowiedź: `EventSignupDTO`. Używane do dodania gracza.
- **PATCH /api/events/{eventId}/signups/{signupId}**: Żądanie z body `UpdateEventSignupSchema` (np. `{ status: 'confirmed' }`). Odpowiedź: `EventSignupDTO`. Używane do aktualizacji statusu.
- **DELETE /api/events/{eventId}/signups/{signupId}**: Żądanie bez body. Odpowiedź: 204 No Content. Używane do wycofania zapisu.

Wywołania są obsługiwane w custom hooku z try/catch, mapowaniem błędów na toast notifications.

## 8. Interakcje użytkownika

- **Ładowanie widoku**: Przy wejściu na stronę automatycznie ładuje się lista zapisów; użytkownik widzi spinner, a po zakończeniu - listę lub błąd.
- **Dodanie gracza**: Organizator klika "Dodaj gracza" → otwiera się modal → wybiera gracza → submit → toast sukcesu → lista odświeża się.
- **Aktualizacja statusu**: Kliknięcie "Potwierdź" na karcie → modal potwierdzenia → potwierdzenie → wywołanie API → toast sukcesu → status karty aktualizuje się.
- **Wycofanie zapisu**: Kliknięcie "Wycofaj" → modal potwierdzenia → potwierdzenie → wywołanie API → toast sukcesu → zapis usuwa się z listy.
- **Paginacja**: Kliknięcie "Następna strona" → nowa strona ładuje się → lista aktualizuje się.
- **Filtrowanie**: Wybór filtra statusu → ponowne wywołanie API z parametrami → lista filtrowana.

Wszystkie akcje kończą się feedbackiem wizualnym (toast) i aktualizacją stanu.

## 9. Warunki i walidacja

Warunki są weryfikowane na poziomie komponentów zgodnie z API:

- **EventId istnieje**: Sprawdzane w `EventSignupsView` przy montowaniu; jeśli nieprawidłowy, błąd 404 i przekierowanie.
- **Dostęp role-based**: Sprawdzane w hooku i komponentach; przyciski ukrywane dla graczy, błędy API (403) dla niedozwolonych akcji.
- **Możliwe przejścia statusów**: Walidacja w `SignupCard` (np. tylko pending → confirmed); API zwraca 400 dla niedozwolonych.
- **Unikalność zapisów**: Sprawdzana w `AddPlayerModal` (lokalnie) i API (409); uniemożliwia duplikaty.
- **Wolne miejsca**: Nie bezpośrednio w tym widoku, ale API sprawdza przy POST; frontend pokazuje komunikaty błędów.
- **Własny zapis**: Organizator nie może wycofywać własnego zapisu; sprawdzane w hooku.

Warunki wpływają na stan UI: ukrywanie przycisków, blokada submit, wyświetlanie błędów w toastach.

## 10. Obsługa błędów

Błędy są obsługiwane globalnie przez toast notifications (z Shadcn/ui). Scenariusze:

- **Błędy API (400, 403, 404, 409)**: Wyświetlany toast z komunikatem z API (np. "Brak uprawnień"), bez odświeżania listy.
- **Błędy sieci**: Toast "Błąd połączenia" z przyciskiem retry, który ponawia wywołanie.
- **Błędy walidacji**: Toast z details błędu, fokus na polu formularza w modalach.
- **Nieoczekiwane błędy**: Toast ogólny "Wystąpił błąd", logowanie do konsoli.

Komponenty mają fallback UI (np. komunikat błędu zamiast listy), a stany loading zapobiegają wielokrotnym wywołaniom.

## 11. Kroki implementacji

1. Utwórz strukturę folderów: `src/pages/dashboard/events/[eventId]/signups/` i `src/components/event-signups/`.
2. Zdefiniuj typy w `src/types/eventSignupsView.ts`: SignupCardViewModel, AddPlayerFormData, ConfirmActionData.
3. Zaimplementuj custom hook `src/lib/hooks/useEventSignups.ts`: zarządzanie stanem, wywołania API.
4. Utwórz komponenty podstawowe: `SignupCard.tsx`, `AddPlayerModal.tsx`, `ConfirmModal.tsx`.
5. Zaimplementuj `EventSignupsList.tsx`: integracja z hookiem, renderowanie kart i paginacji.
6. Zaimplementuj główny `EventSignupsView.tsx`: layout, obsługa modalów, integracja z routingiem.
7. Dodaj stronę Astro: `src/pages/dashboard/events/[eventId]/signups/index.astro` z importem komponentu React.
8. Przetestuj integrację API: symuluj wywołania, sprawdź toast notifications.
9. Dodaj style Tailwind i komponenty Shadcn/ui: Button, Modal, Card, Badge.
10. Przeprowadź testy: walidacja ról, scenariusze błędów, responsywność mobile-first.
11. Optymalizuj: memoizacja komponentów, lazy loading dla dużych list.
