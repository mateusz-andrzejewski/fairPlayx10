# Specyfikacja Techniczna - Moduł Autentykacji Platformy FairPlay

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Podział odpowiedzialności Frontend

Aplikacja wykorzystuje hybrydowy model renderowania Astro 5 (SSR) z komponentami React 19 dla interaktywności.

#### 1.1.1 Strony Astro (.astro) - Renderowanie Server-Side

**Strona `/pages/login.astro`**
- **Odpowiedzialność**: Renderowanie serwera strony logowania, kontrola dostępu dla niezalogowanych
- **Struktura**: 
  - Layout wrapper (`Layout.astro`) z meta-tagami SEO
  - Kontener centralny z tytułem i opisem
  - Osadzenie komponentu React `LoginView` z dyrektywą `client:load`
  - Osadzenie `ToastProvider` dla powiadomień
- **Middleware**: Nie wymaga autentykacji, ale jeśli użytkownik jest zalogowany, możliwe przekierowanie do `/dashboard`
- **Meta**: `title="Logowanie - FairPlay"`

**Strona `/pages/register.astro`**
- **Odpowiedzialność**: Renderowanie serwera strony rejestracji
- **Struktura**:
  - Layout wrapper z meta-tagami
  - Kontener centralny z komunikatem powitalnym
  - Osadzenie komponentu React `RegisterForm` z dyrektywą `client:load`
  - Osadzenie `ToastProvider`
- **Middleware**: Publiczny dostęp, możliwe przekierowanie jeśli użytkownik jest zalogowany
- **Meta**: `title="Rejestracja - FairPlay"`

**Strona `/pages/index.astro`**
- **Odpowiedzialność**: Strona główna (landing page) dla niezalogowanych użytkowników
- **Struktura**: Komponent `Welcome.astro`
- **Middleware**: Publiczny dostęp, bez przekierowania
- **Uwaga PRD**: "Dla niezalogowanych tylko strona logowania" - wymaga modyfikacji routingu aby niezalogowani widzieli tylko login/register

**Nowa strona `/pages/forgot-password.astro`** (do utworzenia)
- **Odpowiedzialność**: Strona odzyskiwania hasła
- **Struktura**:
  - Layout wrapper
  - Kontener z formularzem resetowania hasła
  - Komponent React `ForgotPasswordForm` z `client:load`
  - `ToastProvider`
- **Middleware**: Publiczny dostęp
- **Meta**: `title="Odzyskiwanie hasła - FairPlay"`

**Nowa strona `/pages/reset-password.astro`** (do utworzenia)
- **Odpowiedzialność**: Strona ustawiania nowego hasła po otrzymaniu linku resetującego
- **Struktura**:
  - Layout wrapper
  - Kontener z formularzem nowego hasła
  - Komponent React `ResetPasswordForm` z `client:load`
  - Walidacja tokenu z URL
- **Middleware**: Publiczny dostęp, weryfikacja tokenu resetowania
- **Meta**: `title="Resetowanie hasła - FairPlay"`

**Nowa strona `/pages/pending-approval.astro`** (do utworzenia)
- **Odpowiedzialność**: Strona informująca o oczekiwaniu na zatwierdzenie konta
- **Struktura**:
  - Layout wrapper
  - Komunikat o statusie pending
  - Instrukcje dla użytkownika
  - Link do wylogowania
- **Middleware**: Wymaga sesji Supabase, ale akceptuje status "pending"
- **Meta**: `title="Oczekiwanie na zatwierdzenie - FairPlay"`

#### 1.1.2 Komponenty React (.tsx) - Interaktywność Client-Side

**Komponent `LoginView.tsx`** (istniejący)
- **Odpowiedzialność**: Kontener widoku logowania, zarządzanie stanem ViewModelu
- **Struktura**:
  - Wykorzystuje custom hook `useLoginViewModel`
  - Renderuje `LoginForm`
  - Obsługuje callback `onSubmit`
  - Obsługuje stan ładowania i błędów globalnych
- **Props**: Brak (standalone component)

**Komponent `LoginForm.tsx`** (istniejący)
- **Odpowiedzialność**: Prezentacja formularza logowania, walidacja lokalna
- **Struktura**:
  - Przyjmuje props: `viewModel`, `onViewModelChange`, `onSubmit`
  - Renderuje `EmailInput`, `PasswordInput` (z `./ui/`)
  - Renderuje `LoginButton` i `RegisterLink`
  - Lokalna walidacja przez Zod schema przed submitem
- **Walidacja**:
  - Email: wymagane, format email (regex)
  - Password: wymagane, min 8 znaków
- **Komunikaty błędów**: Wyświetlane inline pod polami

**Hook `useLoginForm.ts`** (do aktualizacji)
- **Odpowiedzialność**: Logika biznesowa formularza logowania
- **Stan**:
  - `formData: { email: string, password: string }`
  - `errors: { email: string[], password: string[] }`
  - `isSubmitting: boolean`
- **Metody**:
  - `validateField(name, value)`: Walidacja pojedynczego pola
  - `validateForm()`: Walidacja całego formularza
  - `handleChange(name, value)`: Aktualizacja pola, czyszczenie błędów
  - `handleSubmit(e)`: Submit formularza z wywołaniem API
- **Walidacja**:
  - Email regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
  - Password: min 8 znaków
- **API Call**: `POST /api/auth/login` (do utworzenia)
- **Obsługa sukcesu**: Toast + przekierowanie do `/dashboard`
- **Obsługa błędów**:
  - Nieprawidłowe dane → wyświetlenie błędu w formularzu
  - Konto pending → przekierowanie do `/pending-approval`
  - Błąd sieciowy → toast z komunikatem
  - Timeout 30s

**Komponent `RegisterForm.tsx`** (istniejący)
- **Odpowiedzialność**: Prezentacja formularza rejestracji
- **Struktura**:
  - Wykorzystuje hook `useRegisterForm`
  - Renderuje pola: `EmailInput`, `PasswordInput`, `FirstNameInput`, `LastNameInput`, `PositionSelect`, `RodoCheckbox`
  - Renderuje `SubmitButton`
  - Po sukcesie wyświetla `SuccessMessage`
- **Walidacja**: Delegowana do hooka
- **Komunikaty błędów**: Inline pod polami

**Hook `useRegisterForm.ts`** (do aktualizacji)
- **Odpowiedzialność**: Logika biznesowa formularza rejestracji
- **Stan**:
  - `formData: RegisterFormData` (email, password, first_name, last_name, position, consent)
  - `errors: RegisterFormErrors`
  - `isSubmitting: boolean`
  - `isSuccess: boolean`
- **Metody**:
  - `validateField(name, value)`
  - `validateForm()`
  - `handleChange(name, value)`
  - `handleSubmit(e)`
- **Walidacja**:
  - Email: wymagane, regex email
  - Password: wymagane, regex `/^(?=.*[A-Z])(?=.*\d).{8,}$/` (min 8 znaków, wielka litera, cyfra)
  - First name: wymagane, max 100 znaków
  - Last name: wymagane, max 100 znaków
  - Position: wymagane, jeden z enum `PlayerPosition`
  - Consent (RODO): wymagane (boolean true)
- **API Call**: `POST /api/auth/register` (do utworzenia)
- **Obsługa sukcesu**: `isSuccess = true`, toast z komunikatem o oczekiwaniu na zatwierdzenie
- **Obsługa błędów**:
  - Email zajęty → błąd w polu email
  - Błąd serwera → toast
  - Timeout 30s

**Komponent `SuccessMessage.tsx`** (istniejący)
- **Odpowiedzialność**: Komunikat sukcesu po rejestracji
- **Struktura**:
  - Card z ikoną sukcesu
  - Tekst informujący o pending status
  - Link do strony logowania

**Nowy komponent `ForgotPasswordForm.tsx`** (do utworzenia)
- **Odpowiedzialność**: Formularz żądania resetu hasła
- **Struktura**:
  - Hook `useForgotPasswordForm`
  - `EmailInput`
  - `SubmitButton`
  - Komunikat sukcesu (email wysłany)
- **API Call**: `POST /api/auth/forgot-password`
- **Walidacja**: Email (wymagane, format)

**Nowy komponent `ResetPasswordForm.tsx`** (do utworzenia)
- **Odpowiedzialność**: Formularz ustawiania nowego hasła
- **Struktura**:
  - Hook `useResetPasswordForm`
  - `PasswordInput` (nowe hasło)
  - `PasswordInput` (potwierdzenie hasła)
  - `SubmitButton`
- **API Call**: `POST /api/auth/reset-password`
- **Walidacja**: 
  - Hasło: regex password
  - Potwierdzenie: musi być identyczne
  - Token z URL (automatyczne)

**Nowy hook `useAuth.ts`** (istniejący, do rozszerzenia)
- **Odpowiedzialność**: Globalne zarządzanie sesją użytkownika
- **Stan**:
  - `isAuthenticated: boolean`
  - `user: UserDTO | null`
  - `isLoading: boolean`
- **Metody**:
  - `login(credentials: AuthRequest): Promise<AuthResponse>`
  - `logout(): Promise<void>`
  - `refreshSession(): Promise<void>` (nowa)
- **Integracja Supabase**:
  - `supabaseClient.auth.getSession()` - pobieranie sesji
  - `supabaseClient.auth.onAuthStateChange()` - subskrypcja zmian
  - `supabaseClient.auth.signInWithPassword()` - logowanie
  - `supabaseClient.auth.signOut()` - wylogowanie
- **Tryb deweloperski**: Obsługa `isDashboardAuthDisabled()` z fallbackiem na API `/api/auth/session`

#### 1.1.3 Komponenty UI (Shadcn/ui)

Wykorzystanie istniejących komponentów z `./components/ui/`:
- `EmailInput` - pole email z walidacją
- `PasswordInput` - pole hasła z możliwością pokazania/ukrycia
- `FirstNameInput` - pole imienia
- `LastNameInput` - pole nazwiska
- `PositionSelect` - select pozycji gracza
- `RodoCheckbox` - checkbox zgody RODO z linkiem do polityki
- `SubmitButton` - przycisk submit z indykatorem ładowania
- `Button`, `Input`, `Label`, `Card`, `Alert` - podstawowe komponenty

### 1.2 Scenariusze użytkownika i walidacja

#### 1.2.1 Scenariusz: Rejestracja nowego użytkownika (US-001)

**Przebieg happy path:**
1. Użytkownik przechodzi na `/register`
2. Wypełnia formularz: email, hasło, imię, nazwisko, pozycja, zgoda RODO
3. Kliknięcie "Zarejestruj się" → walidacja lokalna (React)
4. Submit → POST `/api/auth/register`
5. Backend: walidacja Zod, utworzenie użytkownika w Supabase Auth
6. Backend: wpis do `public.users` z statusem `pending`
7. Backend: utworzenie profilu w `public.players` (opcjonalnie automatyczne powiązanie)
8. Odpowiedź sukcesu → komponent `SuccessMessage`
9. Komunikat: "Twoje konto oczekuje na zatwierdzenie przez administratora"
10. Link do `/login`

**Walidacja frontend (React):**
- Email: niepusty, format email regex
- Hasło: min 8 znaków, min 1 wielka litera, min 1 cyfra
- Imię: niepuste, max 100 znaków
- Nazwisko: niepuste, max 100 znaków
- Pozycja: wybrana (nie pusta wartość)
- RODO: zaznaczone (true)

**Komunikaty błędów frontend:**
- "Adres email jest wymagany"
- "Nieprawidłowy format adresu email"
- "Hasło musi mieć minimum 8 znaków, zawierać cyfrę i wielką literę"
- "Imię jest wymagane"
- "Nazwisko jest wymagane"
- "Pozycja jest wymagana"
- "Zgoda na przetwarzanie danych jest wymagana"

**Walidacja backend (API):**
- Email: unique w tabeli `users`
- Hasło: Supabase Auth policy (min 8 znaków)
- Wszystkie pola: zgodność z Zod schema
- Timestamp zgody RODO: automatyczne `now()`
- Wersja zgody: stała wartość (np. "1.0")

**Komunikaty błędów backend:**
- Status 400: "Adres email jest już zajęty"
- Status 400: "Nieprawidłowe dane wejściowe" + szczegóły walidacji
- Status 500: "Wystąpił błąd serwera. Spróbuj ponownie później."
- Status 408: "Przekroczono limit czasu żądania"

**Obsługa edge cases:**
- Email już istnieje → błąd w polu email + toast
- Błąd sieciowy → toast ogólny
- Timeout (30s) → toast z informacją o czasie
- Supabase Auth niedostępny → toast + logowanie błędu
- Duplikat podczas race condition → transakcja bazodanowa

#### 1.2.2 Scenariusz: Logowanie użytkownika (US-002)

**Przebieg happy path:**
1. Użytkownik przechodzi na `/login`
2. Wypełnia email i hasło
3. Kliknięcie "Zaloguj się" → walidacja lokalna
4. Submit → POST `/api/auth/login`
5. Backend: weryfikacja credentials przez Supabase Auth
6. Backend: sprawdzenie statusu użytkownika w `public.users`
7. Backend: zwrot tokenu sesji i danych `UserDTO`
8. Frontend: zapis sesji (Supabase client) + aktualizacja `useAuth`
9. Przekierowanie do `/dashboard`

**Walidacja frontend:**
- Email: niepusty, format email
- Hasło: niepuste, min 8 znaków

**Komunikaty błędów frontend:**
- "Adres email jest wymagany"
- "Nieprawidłowy format adresu email"
- "Hasło jest wymagane"
- "Hasło musi mieć minimum 8 znaków"

**Walidacja backend:**
- Credentials: weryfikacja przez Supabase Auth
- Status konta: musi być `approved`
- Soft delete: `deleted_at` musi być `null`

**Komunikaty błędów backend:**
- Status 401: "Nieprawidłowy email lub hasło"
- Status 403: "Twoje konto oczekuje na zatwierdzenie przez administratora"
- Status 403: "Konto zostało dezaktywowane"
- Status 500: "Wystąpił błąd podczas logowania"

**Obsługa edge cases:**
- Konto pending → przekierowanie do `/pending-approval` + komunikat
- Konto soft-deleted → traktowane jak nieistniejące
- Nieprawidłowe credentials → ogólny komunikat (security best practice)
- Rate limiting Supabase → toast z prośbą o odczekanie

#### 1.2.3 Scenariusz: Wylogowanie użytkownika (US-016)

**Przebieg:**
1. Użytkownik klika przycisk "Wyloguj" w nawigacji dashboardu
2. Wywołanie `logout()` z `useAuth`
3. `supabaseClient.auth.signOut()`
4. Czyszczenie lokalnego stanu (user, isAuthenticated)
5. Przekierowanie do `/login`

**Obsługa:**
- Sukces → toast opcjonalny ("Wylogowano pomyślnie")
- Błąd Supabase → logowanie błędu, ale mimo to czyszczenie stanu lokalnego
- Redirect → zawsze do `/login`, nawet w przypadku błędu

#### 1.2.4 Scenariusz: Odzyskiwanie hasła

**Przebieg - Żądanie resetu:**
1. Użytkownik na stronie `/login` klika "Nie pamiętam hasła"
2. Przekierowanie do `/forgot-password`
3. Wprowadzenie emaila
4. Submit → POST `/api/auth/forgot-password`
5. Backend: wywołanie `supabase.auth.resetPasswordForEmail()`
6. Backend: Supabase wysyła email z linkiem
7. Komunikat sukcesu: "Email z instrukcjami został wysłany"

**Przebieg - Ustawienie nowego hasła:**
1. Użytkownik klika link w emailu
2. Redirect do `/reset-password?token=XXX&type=recovery`
3. Formularz nowego hasła
4. Submit → POST `/api/auth/reset-password`
5. Backend: weryfikacja tokenu, aktualizacja hasła przez Supabase
6. Komunikat sukcesu + redirect do `/login`

**Walidacja:**
- Email (forgot): format email
- Nowe hasło: regex password
- Potwierdzenie hasła: identyczne z nowym
- Token: automatyczna weryfikacja przez Supabase

**Komunikaty błędów:**
- "Adres email jest wymagany"
- "Link resetowania wygasł lub jest nieprawidłowy"
- "Hasła nie są identyczne"

#### 1.2.5 Scenariusz: Oczekiwanie na zatwierdzenie (związane z US-003)

**Przebieg:**
1. Użytkownik z pending status próbuje zalogować
2. Backend wykrywa `status = 'pending'`
3. Zwrot statusu 403 z kodem `PENDING_APPROVAL`
4. Frontend przekierowuje do `/pending-approval`
5. Wyświetlenie komunikatu o oczekiwaniu
6. Możliwość wylogowania

**Komunikat:**
- Tytuł: "Konto oczekuje na zatwierdzenie"
- Treść: "Twoje konto zostało utworzone i oczekuje na zatwierdzenie przez administratora. Otrzymasz powiadomienie email po zatwierdzeniu."
- Akcja: Przycisk "Wyloguj"

### 1.3 Obsługa niezalogowanych użytkowników

**Zgodnie z PRD (sekcja 3, Wydarzenia):**
> "Dla niezalogowanych tylko strona logowania - niezalogowany nie ma informacji o niczym."

**Implementacja:**
1. Middleware (`src/middleware/index.ts`) sprawdza sesję dla wszystkich stron poza whitelist
2. Whitelist stron publicznych:
   - `/login`
   - `/register`
   - `/forgot-password`
   - `/reset-password`
   - Assety statyczne (`/favicon.png`, `/assets/*`)
3. Dla wszystkich innych ścieżek: redirect do `/login` jeśli brak sesji
4. Landing page `/` - opcje:
   - **Opcja A** (zalecana): Redirect do `/login` jeśli niezalogowany, do `/dashboard` jeśli zalogowany
   - **Opcja B**: Strona powitalna z przyciskami "Zaloguj" i "Zarejestruj"

**Modyfikacje middleware:**
- Funkcja `requiresUserContext(pathname)` - rozszerzona o wszystkie ścieżki
- Biała lista publicznych stron
- Przekierowanie niezalogowanych do `/login`
- Przekierowanie zalogowanych z `/login` do `/dashboard` (opcjonalne)

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura API Endpoints

Wszystkie endpointy w katalogu `/pages/api/auth/`:

#### 2.1.1 Endpoint `POST /api/auth/register`

**Plik:** `src/pages/api/auth/register.ts`

**Odpowiedzialność:**
- Walidacja danych wejściowych formularza rejestracji
- Utworzenie użytkownika w Supabase Auth
- Utworzenie profilu użytkownika w `public.users`
- Opcjonalne utworzenie profilu gracza w `public.players`
- Zwrot komunikatu sukcesu

**Request Body (Zod Schema):**
```typescript
{
  email: string,           // email, unique
  password: string,        // min 8 znaków, wielka litera, cyfra
  first_name: string,      // max 100 znaków
  last_name: string,       // max 100 znaków
  position: PlayerPosition, // enum
  consent: boolean         // musi być true
}
```

**Response 201 Created:**
```typescript
{
  success: true,
  message: "Rejestracja zakończona sukcesem. Konto oczekuje na zatwierdzenie.",
  user: {
    id: number,
    email: string,
    status: "pending"
  }
}
```

**Response 400 Bad Request:**
```typescript
{
  success: false,
  error: "VALIDATION_ERROR" | "EMAIL_TAKEN",
  message: string,
  details?: Record<string, string[]> // pola z błędami
}
```

**Response 500 Internal Server Error:**
```typescript
{
  success: false,
  error: "INTERNAL_ERROR",
  message: "Wystąpił błąd serwera"
}
```

**Logika implementacji:**
1. Walidacja request body przez Zod schema
2. Normalizacja email: `.trim().toLowerCase()`
3. Sprawdzenie unikalności email w `public.users`
4. Utworzenie użytkownika w Supabase Auth: `supabase.auth.signUp()`
5. Pobranie UUID użytkownika z Supabase Auth
6. Utworzenie rekordu w `public.users`:
   - Mapowanie Supabase Auth UUID → `public.users.id` (serial)
   - Status: `pending`
   - Role: `player` (default)
   - Consent_date: `now()`
   - Consent_version: "1.0"
7. Opcjonalnie: utworzenie rekordu w `public.players` i powiązanie z `users.player_id`
8. Logowanie audytu (opcjonalne na tym etapie)
9. Zwrot odpowiedzi 201

**Uwaga na mapowanie ID:**
Schemat bazy używa `serial` (integer) dla `public.users.id`, ale Supabase Auth używa UUID dla `auth.users.id`. 
**Rozwiązanie:** 
- Dodać kolumnę `auth_id uuid` w `public.users` dla mapowania
- Lub migracja całej tabeli na UUID (zalecane dla zgodności)

#### 2.1.2 Endpoint `POST /api/auth/login`

**Plik:** `src/pages/api/auth/login.ts`

**Odpowiedzialność:**
- Walidacja credentials
- Weryfikacja przez Supabase Auth
- Sprawdzenie statusu konta w `public.users`
- Zwrot tokenu sesji i danych użytkownika

**Request Body (Zod Schema):**
```typescript
{
  email: string,    // email format
  password: string  // min 1 znak (weryfikacja w Auth)
}
```

**Response 200 OK:**
```typescript
{
  success: true,
  user: UserDTO,
  session: {
    access_token: string,
    refresh_token: string,
    expires_in: number,
    expires_at: number
  }
}
```

**Response 401 Unauthorized:**
```typescript
{
  success: false,
  error: "INVALID_CREDENTIALS",
  message: "Nieprawidłowy email lub hasło"
}
```

**Response 403 Forbidden:**
```typescript
{
  success: false,
  error: "PENDING_APPROVAL" | "ACCOUNT_DISABLED",
  message: string
}
```

**Logika implementacji:**
1. Walidacja request body
2. Normalizacja email
3. Wywołanie `supabase.auth.signInWithPassword()`
4. Jeśli błąd Supabase Auth → 401 Unauthorized
5. Pobranie profilu użytkownika z `public.users` po `auth_id` lub `email`
6. Sprawdzenie `status`:
   - `pending` → 403 z kodem `PENDING_APPROVAL`
   - `approved` → kontynuacja
7. Sprawdzenie `deleted_at IS NULL`
8. Zwrot sesji i `UserDTO`

**Bezpieczeństwo:**
- Rate limiting (Supabase wbudowane)
- Logowanie prób nieudanych (audit log)
- Generyczne komunikaty błędów (bez ujawniania czy email istnieje)

#### 2.1.3 Endpoint `POST /api/auth/logout`

**Plik:** `src/pages/api/auth/logout.ts`

**Odpowiedzialność:**
- Wylogowanie użytkownika z Supabase Auth
- Czyszczenie cookies sesyjnych

**Request:** Brak body (sesja w cookies/header)

**Response 200 OK:**
```typescript
{
  success: true,
  message: "Wylogowano pomyślnie"
}
```

**Logika implementacji:**
1. Pobranie sesji z `locals.supabase` (middleware)
2. Wywołanie `supabase.auth.signOut()`
3. Czyszczenie cookies sesji Supabase (automatyczne przez SDK)
4. Zwrot 200

#### 2.1.4 Endpoint `POST /api/auth/forgot-password`

**Plik:** `src/pages/api/auth/forgot-password.ts`

**Odpowiedzialność:**
- Wysłanie emaila z linkiem resetowania hasła

**Request Body:**
```typescript
{
  email: string
}
```

**Response 200 OK:**
```typescript
{
  success: true,
  message: "Jeśli konto z tym emailem istnieje, wysłano instrukcje resetowania hasła"
}
```
*(Zawsze sukces dla bezpieczeństwa, nawet jeśli email nie istnieje)*

**Logika implementacji:**
1. Walidacja email
2. Normalizacja email
3. Wywołanie `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${BASE_URL}/reset-password` })`
4. Supabase wysyła email z tokenem
5. Zwrot 200 (zawsze, niezależnie od istnienia konta)

#### 2.1.5 Endpoint `POST /api/auth/reset-password`

**Plik:** `src/pages/api/auth/reset-password.ts`

**Odpowiedzialność:**
- Ustawienie nowego hasła po weryfikacji tokenu

**Request Body:**
```typescript
{
  password: string,        // nowe hasło
  confirmPassword: string, // potwierdzenie
  token: string            // z URL
}
```

**Response 200 OK:**
```typescript
{
  success: true,
  message: "Hasło zostało zmienione"
}
```

**Response 400 Bad Request:**
```typescript
{
  success: false,
  error: "INVALID_TOKEN" | "PASSWORD_MISMATCH",
  message: string
}
```

**Logika implementacji:**
1. Walidacja body
2. Sprawdzenie zgodności `password === confirmPassword`
3. Weryfikacja tokenu przez Supabase: `supabase.auth.verifyOtp({ token_hash: token, type: 'recovery' })`
4. Aktualizacja hasła: `supabase.auth.updateUser({ password: newPassword })`
5. Zwrot 200

#### 2.1.6 Endpoint `GET /api/auth/session` (istniejący, do aktualizacji)

**Plik:** `src/pages/api/auth/session.ts`

**Odpowiedzialność:**
- Weryfikacja i zwrot aktualnej sesji użytkownika
- Użycie w `useAuth` hook dla client-side

**Aktualizacje:**
- Dodać obsługę statusu `pending` (zwrot 403)
- Dodać sprawdzenie `deleted_at`
- Zwrócić pełny `UserDTO` z rolą i statusem

### 2.2 Walidacja danych - Zod Schemas

**Lokalizacja:** `src/lib/validation/auth.ts` (nowy plik)

**Schema rejestracji:**
```typescript
export const registerSchema = z.object({
  email: z.string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, "Hasło musi mieć minimum 8 znaków")
    .regex(/^(?=.*[A-Z])(?=.*\d)/, "Hasło musi zawierać wielką literę i cyfrę"),
  first_name: z.string()
    .min(1, "Imię jest wymagane")
    .max(100, "Imię może mieć maksymalnie 100 znaków")
    .trim(),
  last_name: z.string()
    .min(1, "Nazwisko jest wymagane")
    .max(100, "Nazwisko może mieć maksymalnie 100 znaków")
    .trim(),
  position: z.enum(['forward', 'midfielder', 'defender', 'goalkeeper'], {
    errorMap: () => ({ message: "Pozycja jest wymagana" })
  }),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Zgoda jest wymagana" })
  })
});
```

**Schema logowania:**
```typescript
export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, "Hasło jest wymagane")
});
```

**Schema forgot password:**
```typescript
export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email")
    .toLowerCase()
    .trim()
});
```

**Schema reset password:**
```typescript
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Hasło musi mieć minimum 8 znaków")
    .regex(/^(?=.*[A-Z])(?=.*\d)/, "Hasło musi zawierać wielką literę i cyfrę"),
  confirmPassword: z.string(),
  token: z.string().min(1, "Token jest wymagany")
}).refine(data => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"]
});
```

### 2.3 Obsługa wyjątków

**Centralna obsługa błędów w endpointach:**

**Pattern:**
```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Walidacja
    // Logika biznesowa
    return new Response(JSON.stringify({ success: true, ... }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleAuthError(error);
  }
};
```

**Helper `handleAuthError`:**
Lokalizacja: `src/lib/utils/auth-errors.ts` (nowy plik)

```typescript
export function handleAuthError(error: unknown): Response {
  // Błędy Zod
  if (error instanceof z.ZodError) {
    return new Response(JSON.stringify({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Nieprawidłowe dane wejściowe',
      details: formatZodErrors(error)
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Błędy Supabase Auth
  if (error instanceof AuthError) {
    return formatSupabaseAuthError(error);
  }

  // Błędy custom
  if (error instanceof PendingApprovalError) {
    return new Response(JSON.stringify({
      success: false,
      error: 'PENDING_APPROVAL',
      message: 'Konto oczekuje na zatwierdzenie'
    }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  // Ogólny błąd
  console.error('[Auth Error]', error);
  return new Response(JSON.stringify({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Wystąpił błąd serwera'
  }), { status: 500, headers: { 'Content-Type': 'application/json' } });
}
```

**Kody błędów:**
- `VALIDATION_ERROR` - błąd walidacji danych wejściowych
- `EMAIL_TAKEN` - email już istnieje
- `INVALID_CREDENTIALS` - nieprawidłowe dane logowania
- `PENDING_APPROVAL` - konto oczekuje na zatwierdzenie
- `ACCOUNT_DISABLED` - konto zostało dezaktywowane (soft-deleted)
- `INVALID_TOKEN` - nieprawidłowy lub wygasły token
- `PASSWORD_MISMATCH` - hasła nie są identyczne
- `INTERNAL_ERROR` - ogólny błąd serwera

**Logowanie błędów:**
- Console.error dla błędów 500
- Audit log dla nieudanych prób logowania (opcjonalne)
- Integracja z zewnętrznym systemem monitoringu (przyszłość)

### 2.4 Aktualizacja middleware

**Plik:** `src/middleware/index.ts`

**Rozszerzenia:**

1. **Whitelist publicznych stron:**
```typescript
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path)) ||
         pathname.startsWith('/assets/') ||
         pathname === '/favicon.png';
}
```

2. **Rozszerzona logika `requiresUserContext`:**
```typescript
function requiresUserContext(pathname: string): boolean {
  if (isPublicPath(pathname)) {
    return false;
  }
  // Wszystkie pozostałe ścieżki wymagają autentykacji
  return true;
}
```

3. **Obsługa przekierowania dla zalogowanych na `/login`:**
```typescript
// Po sprawdzeniu sesji:
if (context.url.pathname === '/login' && context.locals.user) {
  return context.redirect('/dashboard');
}
```

4. **Obsługa statusu pending:**
```typescript
if (userProfile.status === 'pending') {
  // Jeśli próbuje dostać się do dashboardu, przekieruj do pending-approval
  if (context.url.pathname.startsWith('/dashboard')) {
    return context.redirect('/pending-approval');
  }
  // Pozwól na dostęp do /pending-approval i /api/auth/logout
  if (context.url.pathname === '/pending-approval' || 
      context.url.pathname === '/api/auth/logout') {
    context.locals.user = userProfile;
    context.locals.actor = toRequestActor(userProfile);
    return next();
  }
  // Dla innych ścieżek, przekieruj do pending-approval
  return context.redirect('/pending-approval');
}
```

5. **Obsługa soft-delete:**
```typescript
// W zapytaniu o profil użytkownika:
.is("deleted_at", null)

// Jeśli deleted_at nie jest null, traktuj jak brak użytkownika:
if (!userProfile || userProfile.deleted_at !== null) {
  return context.redirect("/login");
}
```

## 3. SYSTEM AUTENTYKACJI - Integracja Supabase Auth z Astro

### 3.1 Architektura integracji

**Komponenty systemu:**
1. **Supabase Auth** - zarządzanie autentykacją, tokens, sesje
2. **Supabase Database** - przechowywanie profili użytkowników
3. **Astro Middleware** - server-side weryfikacja sesji
4. **React Hooks** - client-side zarządzanie stanem autentykacji
5. **API Endpoints** - mostek pomiędzy frontendem a Supabase

**Flow danych:**
```
Client (React) 
  ↕ 
Supabase Client SDK 
  ↕ 
Supabase Auth Service
  ↕
Astro API Endpoints
  ↕
Supabase Database (public.users)
  ↕
Astro Middleware (SSR)
```

### 3.2 Konfiguracja Supabase Client

**Istniejący plik:** `src/db/supabase.client.ts`

**Aktualizacje:**

1. **Dodanie konfiguracji Auth:**
```typescript
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'fairplay-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // PKCE flow dla większego bezpieczeństwa
  }
});
```

2. **Helper do utworzenia server-side client:**
```typescript
export function createServerSupabaseClient(
  cookieStore?: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options?: any) => void;
  }
) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Nie persystuj na serwerze
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: cookieStore ? {
        'Authorization': `Bearer ${cookieStore.get('sb-access-token')}`
      } : {}
    }
  });
}
```

### 3.3 Mapowanie użytkowników Supabase Auth ↔ public.users

**Problem:** Supabase Auth używa UUID, nasza tabela `public.users` używa serial (integer).

**Rozwiązanie (zalecane): Migracja na UUID**

**Nowa migracja:** `supabase/migrations/20251112000000_migrate_users_to_uuid.sql`

```sql
-- 1. Dodaj kolumnę auth_id jako UUID
ALTER TABLE users ADD COLUMN auth_id UUID UNIQUE;

-- 2. Utwórz indeks
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- 3. Zaktualizuj foreign keys (jeśli istnieją)
-- (Zależne od innych tabel referencyjnych)

-- 4. Dodaj trigger synchronizacji z auth.users
CREATE OR REPLACE FUNCTION sync_user_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Przy nowym użytkowniku w auth.users, utwórz rekord w public.users
  INSERT INTO public.users (auth_id, email, first_name, last_name, role, status, consent_date, consent_version)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'player',
    'pending',
    NOW(),
    '1.0'
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth();
```

**Alternatywne rozwiązanie:** Trzymaj oba ID (serial i UUID) z kolumną `auth_id` jako foreign key.

### 3.4 Proces rejestracji z Supabase Auth

**Krok po kroku w endpoincie `/api/auth/register`:**

1. **Walidacja danych:**
```typescript
const validatedData = registerSchema.parse(await request.json());
```

2. **Rejestracja w Supabase Auth:**
```typescript
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: validatedData.email,
  password: validatedData.password,
  options: {
    data: {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      position: validatedData.position
    },
    emailRedirectTo: `${BASE_URL}/login`
  }
});
```

3. **Utworzenie profilu w public.users:**
```typescript
const { data: userProfile, error: profileError } = await supabase
  .from('users')
  .insert({
    auth_id: authData.user!.id,
    email: validatedData.email,
    first_name: validatedData.first_name,
    last_name: validatedData.last_name,
    role: 'player',
    status: 'pending',
    consent_date: new Date().toISOString(),
    consent_version: '1.0'
  })
  .select()
  .single();
```

4. **Opcjonalnie: utworzenie profilu gracza:**
```typescript
const { data: playerProfile } = await supabase
  .from('players')
  .insert({
    first_name: validatedData.first_name,
    last_name: validatedData.last_name,
    position: validatedData.position,
    skill_rate: null // Będzie ustawione przez admina
  })
  .select()
  .single();

// Powiąż gracza z użytkownikiem
await supabase
  .from('users')
  .update({ player_id: playerProfile.id })
  .eq('auth_id', authData.user!.id);
```

5. **Wylogowanie użytkownika (aby wymagał logowania po zatwierdzeniu):**
```typescript
await supabase.auth.signOut();
```

### 3.5 Proces logowania z Supabase Auth

**Krok po kroku w endpoincie `/api/auth/login`:**

1. **Walidacja danych:**
```typescript
const { email, password } = loginSchema.parse(await request.json());
```

2. **Logowanie przez Supabase Auth:**
```typescript
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (authError) {
  throw new InvalidCredentialsError();
}
```

3. **Pobranie profilu z public.users:**
```typescript
const { data: userProfile, error: profileError } = await supabase
  .from('users')
  .select('*')
  .eq('auth_id', authData.user.id)
  .is('deleted_at', null)
  .single();

if (!userProfile) {
  throw new AccountNotFoundError();
}
```

4. **Sprawdzenie statusu:**
```typescript
if (userProfile.status !== 'approved') {
  throw new PendingApprovalError();
}
```

5. **Zwrot sesji:**
```typescript
return new Response(JSON.stringify({
  success: true,
  user: userProfile,
  session: {
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token,
    expires_in: authData.session.expires_in,
    expires_at: authData.session.expires_at
  }
}), {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Set-Cookie': `sb-access-token=${authData.session.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`
  }
});
```

### 3.6 Proces wylogowania

**W endpoincie `/api/auth/logout`:**

```typescript
export const POST: APIRoute = async ({ locals }) => {
  try {
    const { error } = await locals.supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      // Kontynuuj mimo błędu - wyczyść sesję po stronie klienta
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Wylogowano pomyślnie'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'sb-access-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
      }
    });
  } catch (error) {
    return handleAuthError(error);
  }
};
```

**W hooku `useAuth`:**

```typescript
const logout = async () => {
  if (authDisabled) {
    setIsAuthenticated(false);
    setUser(null);
    return;
  }

  await supabaseClient.auth.signOut();
  setIsAuthenticated(false);
  setUser(null);
  window.location.href = '/login';
};
```

### 3.7 Odświeżanie sesji

**Automatyczne odświeżanie (Supabase SDK):**
- Supabase Client automatycznie odświeża tokeny przy użyciu refresh token
- Konfiguracja `autoRefreshToken: true` w supabaseClient

**Manualne odświeżanie (opcjonalne):**
```typescript
// W useAuth hook
const refreshSession = async () => {
  const { data, error } = await supabaseClient.auth.refreshSession();
  if (error) {
    console.error('Session refresh error:', error);
    // Przekieruj do logowania
    window.location.href = '/login';
  }
};
```

### 3.8 Weryfikacja sesji w Middleware

**Aktualizacja `src/middleware/index.ts`:**

```typescript
// Pobierz sesję z Supabase
const {
  data: { session },
  error: sessionError,
} = await supabaseClient.auth.getSession();

if (sessionError || !session?.user) {
  return context.redirect("/login");
}

// Pobierz profil użytkownika
const { data: userProfile, error: profileError } = await supabaseClient
  .from("users")
  .select("*")
  .eq("auth_id", session.user.id)
  .is("deleted_at", null)
  .single();

if (profileError || !userProfile) {
  // Użytkownik w Auth, ale brak profilu - edge case
  await supabaseClient.auth.signOut();
  return context.redirect("/login");
}

// Sprawdź status
if (userProfile.status !== "approved") {
  if (context.url.pathname.startsWith("/dashboard")) {
    return context.redirect("/pending-approval");
  }
}

// Ustaw w kontekście
context.locals.user = userProfile;
context.locals.actor = toRequestActor(userProfile);
```

### 3.9 Obsługa ról i uprawnień

**Helper functions w `src/lib/utils/auth.ts`** (istniejące, bez zmian):
- `isAdmin(role: UserRole): boolean`
- `isOrganizer(role: UserRole): boolean`
- `isPlayer(role: UserRole): boolean`
- `canManageEventSignups(role: UserRole): boolean`
- `canSignUpForEvents(role: UserRole): boolean`

**Wykorzystanie w komponentach:**
```typescript
import { isAdmin } from '@/lib/utils/auth';

function AdminPanel({ user }: { user: UserDTO }) {
  if (!isAdmin(user.role)) {
    return null; // Lub redirect
  }
  return <div>Admin Panel</div>;
}
```

**Wykorzystanie w API endpoints:**
```typescript
export const POST: APIRoute = async ({ locals, request }) => {
  const actor = requireActor(locals);
  
  if (!isAdmin(actor.role)) {
    return new Response(JSON.stringify({
      error: 'FORBIDDEN',
      message: 'Brak uprawnień'
    }), { status: 403 });
  }
  
  // Logika dla admina
};
```

### 3.10 Bezpieczeństwo i best practices

1. **HTTPS Only:**
   - Produkcja wymaga HTTPS dla bezpieczeństwa cookies
   - `Secure` flag na cookies

2. **HttpOnly Cookies:**
   - Tokeny przechowywane w HttpOnly cookies
   - Zabezpieczenie przed XSS

3. **SameSite:**
   - `SameSite=Strict` dla cookies
   - Ochrona przed CSRF

4. **Rate Limiting:**
   - Supabase wbudowane limity
   - Opcjonalnie własne rate limiting w middleware dla API endpoints

5. **CORS:**
   - Konfiguracja Supabase dla dozwolonych domen
   - Astro automatic CORS handling

6. **Hasła:**
   - Nigdy nie loguj haseł
   - Supabase zarządza hashowaniem (bcrypt)
   - Wymagania: min 8 znaków, wielka litera, cyfra

7. **Tokeny:**
   - JWT tokens z Supabase (krótki czas życia)
   - Refresh tokens (dłuższy czas życia)
   - Automatyczne odświeżanie przez SDK

8. **Audit Log:**
   - Logowanie krytycznych akcji autentykacji
   - IP address, timestamp, user agent
   - Tabela `audit_logs` w bazie danych

9. **RLS Policies:**
   - Supabase Row Level Security włączone
   - Dostosowanie policies do ról użytkowników (istniejące w migracji)

### 3.11 Tryb deweloperski

**Istniejący mechanizm `isDashboardAuthDisabled()`:**
- Zmienna środowiskowa: `PUBLIC_DISABLE_DASHBOARD_AUTH=true`
- Wykorzystanie w middleware i useAuth
- Fallback na mock user lub dev user z bazy

**Zachowanie istniejącego mechanizmu:**
- Nie naruszać trybu deweloperskiego
- Dodać możliwość testowania pełnego flow autentykacji w dev
- Opcja: `PUBLIC_TEST_AUTH_FLOW=true` dla testowania bez wyłączania middleware

## 4. KONTRAKTY I TYPY

### 4.1 Typy DTO (istniejące w `src/types.ts`)

**Rozszerzenia:**

```typescript
// Auth-specific types (do dodania)
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  consent: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    status: UserStatus;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Error response type
export interface AuthErrorResponse {
  success: false;
  error: AuthErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export type AuthErrorCode =
  | 'VALIDATION_ERROR'
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'PENDING_APPROVAL'
  | 'ACCOUNT_DISABLED'
  | 'INVALID_TOKEN'
  | 'PASSWORD_MISMATCH'
  | 'INTERNAL_ERROR';
```

### 4.2 Typy Locals (Astro)

**Plik:** `src/env.d.ts`

**Aktualizacja:**
```typescript
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    supabase: import('./db/supabase.client').SupabaseClient;
    user?: import('./types').UserDTO;
    actor?: import('./lib/auth/request-actor').RequestActor;
    isDashboardAuthDisabled?: boolean;
  }
}
```

### 4.3 Service Interfaces

**Nowy serwis:** `src/lib/services/auth/auth.service.ts`

```typescript
import type { SupabaseClient } from '@/db/supabase.client';
import type { 
  RegisterRequest, 
  RegisterResponse, 
  LoginRequest, 
  LoginResponse, 
  ForgotPasswordRequest,
  ResetPasswordRequest 
} from '@/types';

export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Implementacja rejestracji
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    // Implementacja logowania
  }

  async logout(): Promise<void> {
    // Implementacja wylogowania
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    // Implementacja forgot password
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    // Implementacja reset password
  }

  async verifySession(authId: string): Promise<UserDTO | null> {
    // Weryfikacja sesji i pobranie profilu
  }
}

export function createAuthService(supabase: SupabaseClient): AuthService {
  return new AuthService(supabase);
}
```

## 5. MIGRACJE BAZY DANYCH

### 5.1 Wymagane modyfikacje schematu

**Nowa migracja:** `supabase/migrations/20251112000000_add_auth_integration.sql`

```sql
-- Dodaj kolumnę auth_id do mapowania z Supabase Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Indeks dla wydajności
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Usuń constraint NOT NULL z password_hash (będzie w Supabase Auth)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Dodaj constraint dla email unikalności (jeśli nie istnieje)
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Dodaj funkcję synchronizacji z auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    auth_id,
    email,
    first_name,
    last_name,
    role,
    status,
    consent_date,
    consent_version,
    password_hash
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'player',
    'pending',
    NOW(),
    '1.0',
    '' -- Placeholder, actual hash in auth.users
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger dla automatycznego tworzenia profilu
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Funkcja czyszczenia po usunięciu z Auth
CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET deleted_at = NOW()
  WHERE auth_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_deleted();
```

### 5.2 Aktualizacja RLS Policies

**Dostosowanie istniejących policies do auth_id:**

```sql
-- Update users policies to use auth_id
DROP POLICY IF EXISTS users_select_policy ON users;
CREATE POLICY users_select_policy ON users
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    -- User może widzieć swój profil
    auth_id = auth.uid() OR
    -- Admin widzi wszystkich
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_id = auth.uid() 
      AND u.role = 'admin'
    )
  )
);

DROP POLICY IF EXISTS users_update_policy ON users;
CREATE POLICY users_update_policy ON users
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    auth_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_id = auth.uid() 
      AND u.role = 'admin'
    )
  )
);

-- Pozostałe policies podobnie aktualizowane
```

## 6. PLAN WDROŻENIA

### 6.1 Faza 1: Przygotowanie infrastruktury (Dzień 1)
- Utworzenie migracji bazy danych
- Konfiguracja Supabase Auth w projekcie
- Utworzenie Zod schemas dla walidacji
- Utworzenie service `AuthService`
- Utworzenie helperów dla obsługi błędów

### 6.2 Faza 2: Backend API (Dzień 2-3)
- Endpoint `/api/auth/register`
- Endpoint `/api/auth/login`
- Endpoint `/api/auth/logout`
- Endpoint `/api/auth/forgot-password`
- Endpoint `/api/auth/reset-password`
- Aktualizacja `/api/auth/session`
- Testy jednostkowe endpointów

### 6.3 Faza 3: Middleware i SSR (Dzień 4)
- Aktualizacja middleware z obsługą statusu pending
- Whitelist publicznych stron
- Logika przekierowań
- Integracja z `useAuth` hook

### 6.4 Faza 4: Frontend - Formularze (Dzień 5-6)
- Aktualizacja `useLoginForm` z prawdziwym API
- Aktualizacja `useRegisterForm` z prawdziwym API
- Utworzenie `ForgotPasswordForm` i `ResetPasswordForm`
- Utworzenie strony `/pending-approval`
- Aktualizacja komponentów UI

### 6.5 Faza 5: Integracja i testy (Dzień 7)
- Testy end-to-end rejestracji
- Testy logowania i wylogowania
- Testy odzyskiwania hasła
- Testy middleware (przekierowania, statusy)
- Testy ról i uprawnień
- Code review

### 6.6 Faza 6: Dokumentacja i polish (Dzień 8)
- Dokumentacja API
- Dokumentacja flows
- Aktualizacja README
- Cleanup mocków i kodu dev
- Optymalizacja wydajności

## 7. UWAGI KOŃCOWE

### 7.1 Zgodność z PRD

Specyfikacja jest zgodna z następującymi wymaganiami PRD:
- **US-001**: Rejestracja z RODO, status pending, czas <2 min
- **US-002**: Logowanie z sesją, przekierowanie do dashboard
- **US-003**: Ręczne zatwierdzanie przez admina (flow zaimplementowany)
- **US-016**: Wylogowanie z czyszczeniem sesji
- **Bezpieczeństwo**: RODO, audit trail, secure tokens
- **Granice**: Brak zaawansowanych powiadomień w MVP, podstawowa walidacja regex

### 7.2 Nierozwiązane kwestie do decyzji

1. **Mapowanie ID:** Zalecana migracja na UUID dla `public.users.id` vs zachowanie serial z dodatkowym `auth_id` (specyfikacja zakłada UUID)

2. **Automatyczne tworzenie gracza:** Czy przy rejestracji automatycznie tworzyć profil w `players` czy zostawić to adminowi? (Specyfikacja zakłada opcjonalne automatyczne)

3. **Email confirmation:** Czy włączyć Supabase email confirmation przed logowaniem? (Specyfikacja zakłada brak w MVP)

4. **Landing page:** Czy `/` przekierowuje do `/login` czy pokazuje stronę powitalną? (Zalecane przekierowanie zgodnie z PRD)

5. **Session timeout:** Domyślnie Supabase 1h + refresh, czy zmienić? (Specyfikacja zakłada domyślne)

### 7.3 Zależności zewnętrzne

- Supabase Project: konfiguracja Auth w dashboard Supabase
- Email Provider: konfiguracja SMTP w Supabase dla forgot password
- Environment Variables: Dodanie w `.env`:
  ```
  PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  PUBLIC_SUPABASE_ANON_KEY=xxx
  SUPABASE_SERVICE_ROLE_KEY=xxx (dla server-side operations)
  PUBLIC_BASE_URL=http://localhost:3000 (lub production URL)
  ```

### 7.4 Monitoring i metryki

- Czas rejestracji: cel <2 min (zgodnie z PRD)
- Czas logowania: cel <30s
- Rate nieudanych logowań: monitoring przez audit_logs
- Liczba kont pending: widoczna w admin dashboard (US-003)

---

**Koniec specyfikacji technicznej - Moduł Autentykacji Platformy FairPlay**

