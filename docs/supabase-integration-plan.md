## Integracja z Supabase – plan wdrożenia

### Rejestracja i logowanie

- **Schema**
  - Ujednolicić identyfikatory użytkowników: mapowanie `auth.users.id (uuid)` ↔ `public.users.id (serial)` lub migracja na UUID.
  - Dodać kolumny na enrolment (np. `last_login_at`, `refresh_token_revoked_at`).
  - Rozszerzyć tabelę `players` o relację odwrotną (unikalne powiązanie z `users`).
- **Endpointy API**
  - `POST /api/auth/register`: walidacja (Zod), tworzenie użytkownika w Supabase Auth, wpis w `public.users`, automatyczna inicjalizacja profilu gracza (opcjonalnie).
  - `POST /api/auth/login`: delegacja do Supabase Auth, wystawienie tokenu, kontrola statusu `users.status`.
  - `POST /api/auth/logout`: unieważnienie sesji (Supabase `signOut` + czyszczenie cookies).
  - `POST /api/auth/refresh` (opcjonalne): odświeżanie tokenu po stronie serwera.
- **Flow klienta**
  - Hook `useAuth` dopiąć do endpoints zamiast mocków (stan globalny, przechowywanie tokenu w `HttpOnly` cookie).
  - Middleware Astro: odczyt sesji z Supabase (server-side), weryfikacja statusu i roli, `locals.user`.
  - Obsługa ról w UI (feature gating, Shadcn guard components).

### Zadania pomocnicze

- Wprowadzić fabrykę Supabase (`createBrowserSupabaseClient`, `createServerSupabaseClient`) z dzielonym typowaniem.
- Dodać logger błędów auth (np. `src/lib/utils/logger.ts`).
- Zapewnić seedy danych testowych przez Supabase CLI (migrations + `seed.sql`).

## Plan testów

### Automatyczne

- `pnpm test` (po dodaniu zestawu) – jednostkowe dla walidacji (Zod) i serwisów (`event.service`, `dashboard.service`).
- Dodać mocki API (`msw`) dla dashboardu i wydarzeń.
- E2E (Playwright):
  - Rejestracja nowego użytkownika (formularz) → potwierdzenie widoczności w panelu admina.
  - Logowanie gracza → dostęp do dashboardu, poprawne pobranie wydarzeń.
  - Brak uprawnień: organizer bez roli admin nie widzi sekcji użytkowników.

### Ręczne QA (po wdrożeniu)

- **Dashboard**: wejście bez sesji → przekierowanie; z sesją dev → brak redirect loop.
- **Wydarzenia**: lista renderuje dane z Supabase, zapis na wydarzenie z profilem gracza.
- **Gracze**: wyszukiwarka reaguje na wpisywane znaki, zmiana filtrów aktualizuje tabelę.
- **Auth**: logowanie/wylogowanie czyści sesję, próba wejścia na `/dashboard` po wylogowaniu → `/login`.
- **Tryb dev**: `PUBLIC_DISABLE_DASHBOARD_AUTH=true` umożliwia wgląd w dashboard bez Supabase.






