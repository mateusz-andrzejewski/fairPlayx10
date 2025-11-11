# Plan implementacji widoku rejestracji użytkownika

## 1. Przegląd

Widok rejestracji użytkownika umożliwia nowym użytkownikom rejestrację konta w systemie FairPlay poprzez podanie wymaganych danych osobowych, adresu email, hasła oraz obowiązkowej zgody na przetwarzanie danych zgodnie z RODO. Po pomyślnej rejestracji konto otrzymuje status "pending" i oczekuje na zatwierdzenie przez administratora. Widok jest częścią procesu onboardingu i zapewnia intuicyjny interfejs użytkownika z walidacją danych i obsługą błędów.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/register` jako strona Astro w katalogu `src/pages/register.astro`.

## 3. Struktura komponentów

- **RegisterPage** (strona Astro): Główna strona zawierająca layout i komponent RegisterForm.
- **RegisterForm** (komponent React): Główny komponent formularza rejestracji, zarządzający stanem i logiką.
  - **EmailInput**: Pole wprowadzania adresu email.
  - **PasswordInput**: Pole wprowadzania hasła.
  - **FirstNameInput**: Pole wprowadzania imienia.
  - **LastNameInput**: Pole wprowadzania nazwiska.
  - **PositionSelect**: Lista wyboru pozycji piłkarskiej.
  - **RodoCheckbox**: Checkbox zgody na RODO.
  - **SubmitButton**: Przycisk wysyłania formularza.
- **SuccessMessage** (komponent React): Komponent wyświetlany warunkowo po pomyślnej rejestracji z komunikatem o statusie pending.

## 4. Szczegóły komponentów

### RegisterPage
- **Opis komponentu**: Główna strona Astro dla widoku rejestracji, zawiera podstawowy layout aplikacji oraz komponent RegisterForm. Nie zawiera własnej logiki biznesowej, służy jako kontener.
- **Główne elementy**: Element `<main>` z tytułem strony i komponentem RegisterForm.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji użytkownika.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak własnych typów DTO lub ViewModel.
- **Propsy**: Brak (interfejs komponentu jest pusty, komponent nie przyjmuje propsów).

### RegisterForm
- **Opis komponentu**: Główny komponent formularza rejestracji, zarządza stanem formularza, walidacją danych, obsługą błędów i integracją z API. Składa się z pól wprowadzania danych i przycisku submit.
- **Główne elementy**: Formularz HTML z komponentami dzieci: EmailInput, PasswordInput, FirstNameInput, LastNameInput, PositionSelect, RodoCheckbox, SubmitButton. Używa hooka useRegisterForm do zarządzania stanem.
- **Obsługiwane interakcje**: onChange dla pól (aktualizacja stanu), onSubmit formularza (walidacja i wysyłka).
- **Obsługiwana walidacja**: 
  - Email: format regex /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.
  - Hasło: minimum 8 znaków, zawiera co najmniej jedną cyfrę i jedną wielką literę.
  - Imię i nazwisko: wymagane, maksymalnie 100 znaków.
  - Pozycja: wymagana, jedna z wartości enum PlayerPosition.
  - Zgoda RODO: wymagana (must be true).
- **Typy**: RegisterFormData (ViewModel dla danych formularza), RegisterFormErrors (ViewModel dla błędów walidacji), CreateUserCommand (DTO dla żądania API).
- **Propsy**: Brak (interfejs komponentu jest pusty, komponent nie przyjmuje propsów od rodzica).

### EmailInput
- **Opis komponentu**: Pole wprowadzania adresu email oparte na komponencie Shadcn/ui Input.
- **Główne elementy**: Element `<input type="email">` z etykietą i obsługą błędów.
- **Obsługiwane interakcje**: onChange (aktualizacja wartości email w stanie formularza).
- **Obsługiwana walidacja**: Format email (regex sprawdzany w RegisterForm).
- **Typy**: string (wartość pola).
- **Propsy**: value (string), onChange (funkcja), error (string[]).

### PasswordInput
- **Opis komponentu**: Pole wprowadzania hasła oparte na komponencie Shadcn/ui Input z typem "password".
- **Główne elementy**: Element `<input type="password">` z etykietą i obsługą błędów.
- **Obsługiwane interakcje**: onChange (aktualizacja wartości hasła w stanie formularza).
- **Obsługiwana walidacja**: Siła hasła (minimum 8 znaków, cyfra, wielka litera, sprawdzane w RegisterForm).
- **Typy**: string (wartość pola).
- **Propsy**: value (string), onChange (funkcja), error (string[]).

### FirstNameInput
- **Opis komponentu**: Pole wprowadzania imienia oparte na komponencie Shadcn/ui Input.
- **Główne elementy**: Element `<input type="text">` z etykietą i obsługą błędów.
- **Obsługiwane interakcje**: onChange (aktualizacja wartości imienia w stanie formularza).
- **Obsługiwana walidacja**: Wymagane, maksymalnie 100 znaków (sprawdzane w RegisterForm).
- **Typy**: string (wartość pola).
- **Propsy**: value (string), onChange (funkcja), error (string[]).

### LastNameInput
- **Opis komponentu**: Pole wprowadzania nazwiska oparte na komponencie Shadcn/ui Input.
- **Główne elementy**: Element `<input type="text">` z etykietą i obsługą błędów.
- **Obsługiwane interakcje**: onChange (aktualizacja wartości nazwiska w stanie formularza).
- **Obsługiwana walidacja**: Wymagane, maksymalnie 100 znaków (sprawdzane w RegisterForm).
- **Typy**: string (wartość pola).
- **Propsy**: value (string), onChange (funkcja), error (string[]).

### PositionSelect
- **Opis komponentu**: Lista wyboru pozycji piłkarskiej oparta na komponencie Shadcn/ui Select.
- **Główne elementy**: Element `<select>` z opcjami enum PlayerPosition i obsługą błędów.
- **Obsługiwane interakcje**: onChange (aktualizacja wartości pozycji w stanie formularza).
- **Obsługiwana walidacja**: Wymagana wartość z enum (sprawdzane w RegisterForm).
- **Typy**: PlayerPosition (wartość pola).
- **Propsy**: value (PlayerPosition), onChange (funkcja), error (string[]).

### RodoCheckbox
- **Opis komponentu**: Checkbox zgody na przetwarzanie danych zgodnie z RODO oparty na komponencie Shadcn/ui Checkbox.
- **Główne elementy**: Element `<input type="checkbox">` z etykietą zawierającą link do polityki prywatności i obsługą błędów.
- **Obsługiwane interakcje**: onChange (aktualizacja wartości zgody w stanie formularza).
- **Obsługiwana walidacja**: Wymagane (must be true, sprawdzane w RegisterForm).
- **Typy**: boolean (wartość pola).
- **Propsy**: checked (boolean), onChange (funkcja), error (string[]).

### SubmitButton
- **Opis komponentu**: Przycisk wysyłania formularza oparty na komponencie Shadcn/ui Button.
- **Główne elementy**: Element `<button>` z tekstem "Zarejestruj się" i stanem disabled podczas wysyłki.
- **Obsługiwane interakcje**: onClick (wywołanie handleSubmit w RegisterForm).
- **Obsługiwana walidacja**: Przycisk disabled jeśli formularz jest invalid lub podczas wysyłki.
- **Typy**: boolean (isSubmitting).
- **Propsy**: disabled (boolean), isLoading (boolean).

### SuccessMessage
- **Opis komponentu**: Komponent wyświetlający komunikat po pomyślnej rejestracji, informujący o statusie pending.
- **Główne elementy**: Element `<div>` z tekstem komunikatu.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak (interfejs komponentu jest pusty).

## 5. Typy

Wymagane typy dla implementacji widoku rejestracji obejmują DTO dla komunikacji z API oraz ViewModel dla zarządzania stanem komponentów. Wszystkie typy są oparte na istniejących definicjach w `types.ts` i rozszerzają je o nowe konstrukcje.

- **CreateUserCommand** (DTO dla żądania rejestracji, nowy typ): Typ reprezentujący dane wysyłane do API podczas rejestracji. Pola: email (string, wymagane - adres email użytkownika), password (string, wymagane - hasło użytkownika), first_name (string, wymagane - imię użytkownika), last_name (string, wymagane - nazwisko użytkownika), position (PlayerPosition, wymagane - pozycja piłkarska z enum), consent_date (Date, wymagane - data wyrażenia zgody), consent_version (string, wymagane - wersja polityki prywatności). Typ powiązany z UserInsert z Supabase.

- **RegisterFormData** (ViewModel dla danych formularza, nowy typ): Typ reprezentujący stan danych wprowadzonych w formularzu. Pola: email (string - wartość pola email), password (string - wartość pola hasło), first_name (string - wartość pola imię), last_name (string - wartość pola nazwisko), position (PlayerPosition | '' - wartość pola pozycja, pusta string dla niezaznaczonej), consent (boolean - wartość checkbox zgody). Typ używany w hooku useRegisterForm do zarządzania stanem.

- **RegisterFormErrors** (ViewModel dla błędów walidacji, nowy typ): Typ reprezentujący błędy walidacji dla pól formularza. Pola: email (string[] - tablica komunikatów błędów dla pola email), password (string[] - tablica komunikatów błędów dla pola hasło), first_name (string[] - tablica komunikatów błędów dla pola imię), last_name (string[] - tablica komunikatów błędów dla pola nazwisko), position (string[] - tablica komunikatów błędów dla pola pozycja), consent (string[] - tablica komunikatów błędów dla checkbox zgody). Typ używany do wyświetlania błędów walidacji w komponentach pól.

Odpowiedź API będzie typu UserDTO lub prostego obiektu { success: boolean, message: string }, w zależności od implementacji endpointu.

## 6. Zarządzanie stanem

Zarządzanie stanem w widoku opiera się na React hooks w komponencie RegisterForm. Stan obejmuje dane formularza, błędy walidacji, flagi ładowania i sukcesu. Wymagany jest customowy hook `useRegisterForm`, który enkapsuluje logikę zarządzania stanem formularza, walidacji i integracji z API. Hook zwraca: formData (RegisterFormData), errors (RegisterFormErrors), isSubmitting (boolean), isSuccess (boolean), handleChange (funkcja do aktualizacji pól), handleSubmit (funkcja do wysyłki formularza). Stan jest lokalny w komponencie RegisterForm, bez potrzeby globalnego zarządzania stanem aplikacji.

## 7. Integracja API

Integracja z API odbywa się poprzez wywołanie POST /api/auth/register (endpoint do stworzenia lub założenia, że istnieje). Żądanie wysyła CreateUserCommand jako JSON w body. Odpowiedź to UserDTO (z nowym użytkownikiem w statusie "pending") lub { success: boolean, message: string }. Wywołanie następuje w handleSubmit po walidacji klienta. W przypadku sukcesu: ustaw isSuccess na true, wyświetl toast z sukcesem i SuccessMessage. W przypadku błędu: wyświetl toast z błędem i zaktualizuj errors na podstawie odpowiedzi API.

## 8. Interakcje użytkownika

- **Wypełnianie pól formularza**: Użytkownik wprowadza dane w polach EmailInput, PasswordInput, FirstNameInput, LastNameInput, PositionSelect, RodoCheckbox. Każda zmiana wywołuje onChange, aktualizując formData w stanie.
- **Wysyłanie formularza**: Kliknięcie SubmitButton wywołuje onSubmit, który wykonuje walidację, jeśli pomyślna - wysyła żądanie API, ustawia isSubmitting na true. Po odpowiedzi: jeśli sukces - toast sukcesu, ustaw isSuccess na true, wyświetl SuccessMessage; jeśli błąd - toast błędu, wyświetl błędy w formularzu.
- **Obsługa błędów**: Błędy walidacji wyświetlane inline pod polami. Błędy API wyświetlane w toastach.

## 9. Warunki i walidacja

Warunki weryfikowane przez interfejs dotyczą walidacji danych przed wysłaniem do API i wpływają na stan interfejsu poprzez wyświetlanie błędów i blokowanie submit. Komponent RegisterForm weryfikuje: format email (pole EmailInput, błąd jeśli nie regex), siłę hasła (pole PasswordInput, błąd jeśli <8 znaków bez cyfry/wielkiej litery), wymagane pola (wszystkie pola, błąd jeśli puste), zgodę RODO (pole RodoCheckbox, błąd jeśli false). Warunki te blokują wysyłkę jeśli nie spełnione, wyświetlając błędy w RegisterFormErrors i ustawiając disabled na SubmitButton.

## 10. Obsługa błędów

Potencjalne błędy obsługiwane poprzez: błędy walidacji klienta (wyświetlane w komponentach pól jako komunikaty błędów), błędy API (wyświetlane w toastach z komunikatami z odpowiedzi), błędy sieciowe (toast "Brak połączenia z serwerem"). Przypadki brzegowe: pusty formularz (blokada submit), nieprawidłowy email (błąd walidacji), serwer niedostępny (toast błędu). Obsługa poprzez try-catch w handleSubmit i wyświetlanie odpowiednich komunikatów.

## 11. Kroki implementacji

1. Stworzyć plik `src/pages/register.astro` z podstawowym layoutem i komponentem RegisterForm.
2. Zdefiniować nowe typy w `types.ts`: CreateUserCommand, RegisterFormData, RegisterFormErrors.
3. Zaimplementować custom hook `useRegisterForm` w `src/lib/hooks/useRegisterForm.ts` z zarządzaniem stanem, walidacją i API call.
4. Stworzyć komponenty pól (EmailInput, PasswordInput, etc.) w `src/components/ui/` używając Shadcn/ui.
5. Zaimplementować RegisterForm w `src/components/RegisterForm.tsx` z integracją hooka i komponentów dzieci.
6. Zaimplementować SuccessMessage w `src/components/SuccessMessage.tsx`.
7. Dodać endpoint POST /api/auth/register w `src/pages/api/auth/register.ts` z walidacją i integracją Supabase.
8. Przetestować widok: wypełnienie formularza, walidacja, submit, obsługa błędów, sukces.
