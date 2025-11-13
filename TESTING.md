# Testing Guide

This project uses **Vitest** for unit testing and **Playwright** for end-to-end (E2E) testing.

## Table of Contents

- [Unit Testing with Vitest](#unit-testing-with-vitest)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Best Practices](#best-practices)

---

## Unit Testing with Vitest

### Overview

Vitest is a blazing-fast unit test framework powered by Vite. It provides:

- Jest-compatible API
- Native TypeScript support
- Fast watch mode
- Code coverage reporting with v8
- UI mode for visual test management

### Configuration

The Vitest configuration is in `vitest.config.ts`. Key features:

- **Environment**: jsdom (for DOM testing)
- **Setup files**: `src/test/setup-tests.ts`
- **Coverage**: v8 provider with 80% thresholds
- **Globals**: Enabled for Jest-like API

### Test Structure

Tests should be placed next to the code they're testing with the `.test.ts` or `.test.tsx` extension:

```
src/
  lib/
    utils.ts
    utils.test.ts
  components/
    ui/
      button.tsx
      button.test.tsx
```

### Writing Tests

#### Basic Test

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

#### Testing React Components

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

#### Mocking with vi

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('myModule', () => {
  it('should call the callback', () => {
    const callback = vi.fn();
    myFunction(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

#### API Mocking with MSW

Mock Service Worker (MSW) is configured for API mocking. Add handlers in `src/test/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ]);
  }),
];
```

### Available Commands

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## E2E Testing with Playwright

### Overview

Playwright is a modern E2E testing framework that provides:

- Cross-browser testing (Chromium configured by default)
- Auto-wait for elements
- Visual regression testing
- Accessibility testing with axe-core
- Trace viewer for debugging
- Codegen for test recording

### Configuration

The Playwright configuration is in `playwright.config.ts`. Key features:

- **Test directory**: `e2e/`
- **Base URL**: http://localhost:4321
- **Browser**: Chromium/Desktop Chrome only
- **Dev server**: Automatically starts before tests
- **Reporters**: HTML, JSON, and List

### Test Structure

E2E tests are located in the `e2e/` directory:

```
e2e/
  fixtures/          # Test fixtures and setup
  page-objects/      # Page Object Models
  __snapshots__/     # Visual regression snapshots
  example.spec.ts    # Example test
  login.spec.ts      # Login page test
```

### Writing E2E Tests

#### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test('should display homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FairPlay10X/);
});
```

#### Using Page Object Model

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});
```

#### Accessibility Testing

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

#### Visual Regression Testing

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

### Available Commands

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Generate test code
npm run test:e2e:codegen

# View test report
npm run test:e2e:report
```

---

## Running Tests

### Development Workflow

1. **Run unit tests in watch mode** during development:
   ```bash
   npm run test:watch
   ```

2. **Run E2E tests** before committing:
   ```bash
   npm run test:e2e
   ```

3. **Check coverage** periodically:
   ```bash
   npm run test:coverage
   ```

### CI/CD Pipeline

In your CI/CD pipeline, run:

```bash
# Install dependencies
npm ci

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## Project Structure

```
fairPlayx10/
├── src/
│   ├── test/                    # Test utilities and setup
│   │   ├── setup-tests.ts       # Vitest setup file
│   │   ├── test-utils.tsx       # Custom render function
│   │   ├── msw-setup.ts         # MSW server setup
│   │   └── mocks/
│   │       └── handlers.ts      # MSW handlers
│   ├── lib/
│   │   └── utils.test.ts        # Unit test example
│   └── components/
│       └── ui/
│           └── button.test.tsx  # Component test example
├── e2e/
│   ├── fixtures/                # Test fixtures
│   │   └── auth.setup.ts        # Auth fixtures
│   ├── page-objects/            # Page Object Models
│   │   ├── BasePage.ts          # Base POM class
│   │   └── LoginPage.ts         # Login page POM
│   ├── __snapshots__/           # Visual snapshots
│   ├── example.spec.ts          # Homepage E2E test
│   └── login.spec.ts            # Login E2E test
├── vitest.config.ts             # Vitest configuration
├── playwright.config.ts         # Playwright configuration
└── package.json                 # Test scripts
```

---

## Best Practices

### Unit Testing

1. **Follow AAA pattern**: Arrange, Act, Assert
2. **Test behavior, not implementation**: Focus on what the code does, not how
3. **Use descriptive test names**: Test names should describe the expected behavior
4. **Keep tests isolated**: Each test should be independent
5. **Mock external dependencies**: Use vi.mock() for modules and vi.fn() for functions
6. **Test edge cases**: Include tests for error conditions and boundary values
7. **Use testing-library queries**: Prefer queries that reflect how users interact

### E2E Testing

1. **Use Page Object Model**: Encapsulate page logic in POM classes
2. **Avoid hardcoded waits**: Use Playwright's auto-waiting
3. **Test user flows, not pages**: Focus on complete user journeys
4. **Use meaningful locators**: Prefer role-based and accessible selectors
5. **Test accessibility**: Include axe-core checks in your tests
6. **Visual regression testing**: Use screenshots for UI consistency
7. **Organize tests logically**: Group related tests with describe blocks
8. **Use fixtures for setup**: Reuse common setup code with fixtures

### General

1. **Write tests first** (TDD approach when appropriate)
2. **Keep tests fast**: Unit tests should run in milliseconds
3. **Run tests locally** before pushing
4. **Monitor coverage** but focus on meaningful tests
5. **Update tests** when code changes
6. **Document test helpers** and utilities
7. **Review test failures** in CI/CD pipelines

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)

