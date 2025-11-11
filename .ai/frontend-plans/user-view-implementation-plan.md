# Plan implementacji widoku logowania

## 1. Przegląd

Widok logowania umożliwia użytkownikom uwierzytelnienie się w systemie poprzez podanie adresu email i hasła. Głównym celem jest zapewnienie bezpiecznego dostępu do dashboardu aplikacji, z obsługą błędów i przekierowaniem po pomyślnym logowaniu. Widok jest częścią systemu autentykacji opartego na Supabase Auth, z uwzględnieniem ról użytkowników i statusu zatwierdzenia konta.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/login` w aplikacji Astro. Jest to strona publiczna, dostępna bez autoryzacji.

## 3. Struktura komponentów

- **LoginView**: Główny komponent strony, zawierający formularz logowania i obsługę błędów.
  - **LoginForm**: Formularz z polami email i hasło.
    - **EmailInput**: Pole tekstowe dla adresu email.
    - **PasswordInput**: Pole hasła.
    - **LoginButton**: Przycisk wysłania formularza.
    - **RegisterLink**: Link do strony rejestracji.
  - **ErrorToast**: Komponent wyświetlający komunikaty błędów (globalny, renderowany w LoginView).

## 4. Szczegóły komponentów

### LoginView

- **Opis komponentu**: Główny komponent strony logowania, odpowiedzialny za renderowanie formularza, obsługę submitu, przekierowanie po sukcesie i wyświetlanie błędów. Składa się z LoginForm i ErrorToast.
- **Główne elementy**: `<form>` z polami, przycisk submit, link nawigacyjny, toast dla błędów.
- **Obsługiwane zdarzenia**: Submit formularza (wywołanie API logowania), kliknięcie linku rejestracji (nawigacja).
- **Warunki walidacji**: Email musi być w prawidłowym formacie (np. via zod), hasło jest wymagane. Dodatkowa walidacja: Sprawdzenie statusu użytkownika po logowaniu (jeśli pending, wyświetl błąd).
- **Typy**: LoginViewModel {email: string, password: string, isLoading: boolean, error: string | null}, LoginRequest {email: string, password: string}, LoginResponse {user: User, session: Session}.
- **Propsy**: Brak (komponent główny strony).

### LoginForm

- **Opis komponentu**: Formularz logowania z polami wejściowymi i przyciskiem. Obsługuje walidację klienta i submit.
- **Główne elementy**: Shadcn/ui Input dla email i hasła, Button dla submit, Link dla rejestracji.
- **Obsługiwane zdarzenia**: onSubmit (walidacja i wywołanie API), onChange dla pól (aktualizacja stanu).
- **Warunki walidacji**: Email: string, wymagany, prawidłowy format email. Hasło: string, wymagane.
- **Typy**: LoginViewModel dla stanu.
- **Propsy**: onSubmit: (data: LoginRequest) => void (funkcja obsługi submitu).

### LoginButton

- **Opis komponentu**: Przycisk wysłania formularza, z obsługą stanu ładowania.
- **Główne elementy**: Shadcn/ui Button z tekstem "Zaloguj się".
- **Obsługiwane zdarzenia**: onClick (submit formularza, jeśli walidacja przejdzie).
- **Warunki walidacji**: Brak specyficznych, ale przycisk jest disabled podczas ładowania.
- **Typy**: Brak.
- **Propsy**: isLoading: boolean (czy przycisk jest w stanie ładowania).

### RegisterLink

- **Opis komponentu**: Link nawigacyjny do strony rejestracji.
- **Główne elementy**: Shadcn/ui Link z tekstem "Nie masz konta? Zarejestruj się".
- **Obsługiwane zdarzenia**: onClick (nawigacja do /register).
- **Warunki walidacji**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

### ErrorToast

- **Opis komponentu**: Komponent wyświetlający komunikaty błędów jako toast.
- **Główne elementy**: Shadcn/ui Toast z wiadomością błędu.
- **Obsługiwane zdarzenia**: Automatyczne wyświetlanie po błędzie.
- **Warunki walidacji**: Brak.
- **Typy**: string (wiadomość błędu).
- **Propsy**: message: string (tekst błędu).

## 5. Typy

- **LoginRequest (DTO)**: { email: string; password: string } - używany dla żądania do Supabase auth.signInWithPassword.
- **LoginResponse (DTO)**: { user: User; session: Session } - odpowiedź z Supabase, gdzie User to istniejący typ z @types.ts (zawiera id, email, role, status), Session to typ Supabase.
- **LoginViewModel**: { email: string; password: string; isLoading: boolean; error: string | null } - dla zarządzania stanem formularza w komponencie.

## 6. Zarządzanie stanem

Stan jest zarządzany lokalnie w LoginView za pomocą useState dla LoginViewModel (email, password, isLoading, error). Dla globalnej autentykacji używany jest custom hook useAuth, który obsługuje wywołania Supabase, zwraca funkcję login i stan isAuthenticated. Hook centralizuje logikę autentykacji i może być używany w innych komponentach.

## 7. Integracja API

Integracja odbywa się poprzez Supabase auth.signInWithPassword z parametrami LoginRequest. Po sukcesie: przekierowanie do /dashboard. Typy: Żądanie - LoginRequest, Odpowiedź - LoginResponse. Obsługa błędów: Przechwycenie wyjątków i ustawienie error w stanie.

## 8. Interakcje użytkownika

- Użytkownik wypełnia pola email i hasło.
- Kliknięcie przycisku "Zaloguj się" wywołuje walidację i submit.
- Po submit: Wywołanie API, wyświetlenie loading state.
- Sukces: Przekierowanie do /dashboard.
- Błąd: Wyświetlenie toast z komunikatem (np. "Nieprawidłowe dane logowania").
- Kliknięcie linku rejestracji: Nawigacja do /register.

## 9. Warunki i walidacja

- Email: Wymagany, prawidłowy format email (walidacja w komponencie via zod).
- Hasło: Wymagane.
- Status użytkownika: Po logowaniu sprawdź user.status - jeśli "pending", wyświetl błąd "Konto oczekuje zatwierdzenia".
- Wpływ na interfejs: Pola z błędami są wyróżnione, przycisk disabled podczas ładowania, toast dla błędów.

## 10. Obsługa błędów

- Błędy walidacji: Wyświetlenie pod polami (np. "Nieprawidłowy email").
- Błędy API: Toast z komunikatem (np. "Błąd połączenia" dla network, "Nieprawidłowe dane" dla 401).
- Scenariusze brzegowe: Użytkownik pending - toast z informacją o oczekiwaniu na zatwierdzenie. Obsługa: setError w stanie, automatyczne ukrycie toast po czasie.

## 11. Kroki implementacji

1. Utwórz plik strony `src/pages/login.astro` z podstawowym layoutem.
2. Zaimplementuj komponent LoginView w `src/components/LoginView.tsx` z useState dla stanu.
3. Dodaj LoginForm z polami Shadcn/ui i walidacją zod.
4. Zintegruj custom hook useAuth dla wywołania Supabase.
5. Dodaj obsługę submitu, przekierowania i błędów.
6. Dodaj ErrorToast dla komunikatów błędów.
7. Przetestuj walidację, API i interakcje użytkownika.
8. Dodaj style Tailwind i zapewnij dostępność (ARIA).
