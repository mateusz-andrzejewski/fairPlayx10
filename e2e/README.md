# E2E Testing Guide - FairPlay

## 📋 Przegląd

Ten folder zawiera testy end-to-end (E2E) dla aplikacji FairPlay, napisane z użyciem Playwright.

## 🏗️ Struktura projektu

```
e2e/
├── page-objects/          # Page Object Model classes
│   ├── BasePage.ts       # Bazowa klasa dla wszystkich POM
│   ├── LoginPage.ts      # POM dla strony logowania
│   └── RegisterPage.ts   # POM dla strony rejestracji
├── fixtures/             # Playwright fixtures
│   └── auth.setup.ts     # Setup dla testów z autoryzacją
├── login.spec.ts         # Testy logowania
├── register.spec.ts      # Testy rejestracji
└── README.md            # Ten plik
```

## 🎯 Scenariusze testowe

### Testy rejestracji (`register.spec.ts`)

1. **Pełny flow rejestracji** - ⏭️ SKIPPED (wymaga konfiguracji Supabase w chmurze)
2. **Walidacja formularza** - sprawdzenie błędów walidacji dla pustego formularza
3. **Walidacja email** - sprawdzenie formatu email
4. **Walidacja hasła** - sprawdzenie wymagań dotyczących hasła
5. **Nawigacja** - test przejścia z formularza rejestracji z powrotem do logowania
6. **Checkbox zgody RODO** - sprawdzenie wymagalności akceptacji zgody
7. **Opcje pozycji** - test wszystkich dostępnych pozycji piłkarskich
8. **Smoke tests** - weryfikacja dostępności elementów formularza i accessibility

## 🛠️ Konfiguracja

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja środowiska

Skopiuj plik `.env.test.example` do `.env.test`:

```bash
cp .env.test.example .env.test
```

Edytuj `.env.test` i wypełnij odpowiednie wartości.

### 3. Instalacja przeglądarek Playwright

```bash
npx playwright install
```

Lub tylko Chromium (używany w naszych testach):

```bash
npx playwright install chromium
```

## 🚀 Uruchamianie testów

### Wszystkie testy E2E

```bash
npm run test:e2e
```

### Tylko testy rejestracji

```bash
npx playwright test register.spec.ts
```

### Tylko testy logowania

```bash
npx playwright test login.spec.ts
```

### Testy w trybie debug

```bash
npx playwright test --debug
```

### Testy z interfejsem UI (interaktywny tryb)

```bash
npx playwright test --ui
```

### Testy w trybie headed (z widoczną przeglądarką)

```bash
npx playwright test --headed
```

### Uruchomienie konkretnego testu

```bash
npx playwright test -g "should successfully register a new user"
```

## 📊 Raporty

Po zakończeniu testów, raport HTML jest generowany automatycznie:

```bash
npx playwright show-report
```

Raport zawiera:
- Szczegóły przejścia każdego testu
- Screenshots z błędów
- Video z nieudanych testów
- Trace dla debugowania

## 🎭 Page Object Model (POM)

### Struktura POM

Każda strona ma dedykowaną klasę POM, która:
- Enkapsuluje locatory elementów
- Dostarcza metody do interakcji ze stroną
- Używa `data-test-id` dla stabilnych selektorów

### Przykład użycia

```typescript
import { test } from '@playwright/test';
import { RegisterPage } from './page-objects/RegisterPage';

test('register new user', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  
  await registerPage.goto();
  await registerPage.register(
    'user@example.com',
    'Password123!',
    'Jan',
    'Kowalski',
    'midfielder'
  );
  
  // Verify success
  await expect(registerPage.successMessage).toBeVisible();
});
```

## 🏷️ Data Test IDs

Wszystkie kluczowe elementy mają atrybuty `data-test-id` dla stabilnego testowania:

### Strona logowania
- `login-form` - formularz logowania
- `email-input` - pole email
- `password-input` - pole hasła
- `submit-button` - przycisk submit
- `register-link` - link do rejestracji

### Strona rejestracji
- `register-form` - formularz rejestracji
- `email-input` - pole email
- `password-input` - pole hasła
- `first-name-input` - pole imienia
- `last-name-input` - pole nazwiska
- `position-select` - selektor pozycji
- `position-option-{position}` - opcje pozycji (forward, midfielder, defender, goalkeeper)
- `consent-checkbox` - checkbox zgody RODO
- `submit-button` - przycisk rejestracji
- `back-to-login-link` - link powrotu do logowania
- `registration-success-message` - komunikat sukcesu
- `success-title` - tytuł komunikatu sukcesu

### Komunikaty błędów
- `email-error` - błąd walidacji email
- `password-error` - błąd walidacji hasła
- `first-name-error` - błąd walidacji imienia
- `last-name-error` - błąd walidacji nazwiska
- `position-error` - błąd walidacji pozycji
- `consent-error` - błąd walidacji zgody

## ⏭️ Skipped Tests

Niektóre testy są celowo pominięte (`.skip()`) w środowisku CI/CD:

### Test pełnego flow rejestracji
**Dlaczego skipowany:**
- Wymaga działającego Supabase w chmurze z właściwą konfiguracją email
- Wymaga wyłączonej weryfikacji email lub odpowiedniej obsługi
- Może wymagać dodatkowych uprawnień sieciowych w CI/CD

**Pokrycie testowe:**
Pozostałe testy pokrywają:
- ✅ Walidację wszystkich pól formularza
- ✅ Nawigację między stronami
- ✅ Interakcje UI (checkbox, select)
- ✅ Accessibility

**Jak uruchomić lokalnie:**
Jeśli masz skonfigurowany lokalny Supabase, możesz odkomentować test i uruchomić:
```bash
npx playwright test register.spec.ts --grep "should successfully register"
```

## 💡 Best Practices

### 1. Unikalne dane testowe

Zawsze używaj timestamp lub UUID dla unikalnych danych:

```typescript
const timestamp = Date.now().toString();
const email = `testuser_${timestamp}@example.com`;
```

### 2. Czekanie na elementy

Używaj Playwright's auto-waiting zamiast ręcznych timeouts:

```typescript
// ✅ Dobrze
await expect(page.locator('[data-test-id="success"]')).toBeVisible();

// ❌ Unikaj
await page.waitForTimeout(5000);
```

### 3. Izolacja testów

Każdy test powinien być niezależny:
- Używaj `test.beforeEach()` dla setupu
- Nie polegaj na kolejności wykonywania testów
- Sprzątaj dane testowe po zakończeniu

### 4. Selektory

Priorytet selektorów:
1. `data-test-id` - najbardziej stabilne
2. Role + accessible name - dobre dla accessibility
3. Text content - może się zmienić z tłumaczeniami
4. CSS selectors - najmniej stabilne

## 🐛 Debugging

### Playwright Inspector

```bash
npx playwright test --debug
```

Pozwala na:
- Krok po kroku wykonywanie testu
- Inspekcję locatorów
- Edycję testu na żywo

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

Pokazuje:
- Timeline akcji
- Screenshots
- Network requests
- Console logs

### Screenshots przy błędzie

Screenshots są automatycznie zapisywane przy niepowodzeniu testu w folderze `test-results/`.

## 🔧 Troubleshooting

### Test timeout

Jeśli test się timeout'uje, zwiększ timeout w konfiguracji:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 sekund
  // ...
});
```

### Element nie znaleziony

Sprawdź czy:
1. Element ma poprawny `data-test-id`
2. Element jest widoczny (nie ukryty przez CSS)
3. Aplikacja jest w odpowiednim stanie

### Niestabilne testy

Jeśli test czasami przechodzi a czasami nie:
1. Użyj `page.waitForLoadState('networkidle')`
2. Sprawdź czy nie ma race conditions
3. Dodaj explicit waits dla dynamicznych elementów

## 📝 Dodawanie nowych testów

1. Utwórz nowy plik `*.spec.ts` w folderze `e2e/`
2. Jeśli testowana strona nie ma POM, utwórz go w `page-objects/`
3. Dodaj `data-test-id` do nowych elementów w komponentach
4. Napisz test używając POM
5. Uruchom test lokalnie przed commitem

## 🔗 Przydatne linki

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)
- [Test Assertions](https://playwright.dev/docs/test-assertions)

