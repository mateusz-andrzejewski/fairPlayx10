# Plan implementacji widoku logowania

## 1. Przegląd

Widok logowania umożliwia użytkownikom uwierzytelnienie się w systemie poprzez podanie adresu email i hasła. Po pomyślnym logowaniu użytkownik zostaje przekierowany do dashboardu głównego.

## 2. Routing widoku

Widok dostępny pod ścieżką `/login`.

## 3. Struktura komponentów

- LoginView (strona Astro)
  - LoginForm (główny komponent React)
    - EmailInput
    - PasswordInput
    - LoginButton
    - RegisterLink
    - ToastContainer

## 4. Szczegóły komponentów

### LoginForm

- Opis komponentu: Główny komponent formularza logowania, zarządzający stanem i obsługujący submit. Składa się z pól input, przycisku i linku.
- Główne elementy: Form z Shadcn/ui, inputy email/hasło, przycisk submit, link nawigacyjny, toast dla błędów.
- Obsługiwane interakcje: onSubmit formularza, onChange pól input.
- Obsługiwana walidacja: Email – regex walidacja; hasło – min 8 znaków, wymagane pola.
- Typy: AuthRequest, AuthResponse, LoginViewModel.
- Propsy: Brak (samodzielny komponent).

### LoginButton

- Opis komponentu: Przycisk do wysłania formularza.
- Główne elementy: Shadcn Button.
- Obsługiwane interakcje: onClick – wywołuje submit.
- Obsługiwana walidacja: Aktywny tylko gdy formularz jest valid.
- Typy: Brak.
- Propsy: disabled: boolean.

### RegisterLink

- Opis komponentu: Link do strony rejestracji.
- Główne elementy: Shadcn Link.
- Obsługiwane interakcje: onClick – nawigacja do /register.
- Obsługiwana walidacja: Brak.
- Typy: Brak.
- Propsy: Brak.

## 5. Typy

- AuthRequest: { email: string; password: string; }
- AuthResponse: { token: string; user: User; expiresIn: number; }
- LoginViewModel: { email: string; password: string; isLoading: boolean; error: string | null; }

## 6. Zarządzanie stanem

Stan zarządzany przez useState w LoginForm: email, password, isLoading, error. Custom hook useAuth dla API calls i zarządzania tokenem.

## 7. Integracja API

POST /api/auth/login z AuthRequest, zwraca AuthResponse lub błąd. Typy: request - AuthRequest, response - AuthResponse.

## 8. Interakcje użytkownika

Użytkownik wypełnia email i hasło, klika login – wywołanie API, przekierowanie lub toast błędu.

## 9. Warunki i walidacja

Email: wymagany, regex; hasło: wymagane, min 8 znaków. Walidacja inline w komponencie, blokuje submit jeśli invalid.

## 10. Obsługa błędów

Błędy API: Toast z komunikatem. Walidacja: Inline błędy pól.

## 11. Kroki implementacji

1. Stworzyć stronę Astro /login.
2. Zaimplementować LoginForm z Shadcn komponentami.
3. Dodać walidację i stan.
4. Zintegrować API call.
5. Dodać obsługę błędów i przekierowanie.
