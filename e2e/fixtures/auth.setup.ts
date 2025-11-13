import { test as base } from '@playwright/test';

/**
 * Extend base test with authentication fixtures
 * This allows you to reuse authenticated state across tests
 */
export const test = base.extend({
  // Add custom fixtures here
  // Example: authenticated page
  // authenticatedPage: async ({ page }, use) => {
  //   // Login logic here
  //   await page.goto('/login');
  //   await page.fill('[name="email"]', 'test@example.com');
  //   await page.fill('[name="password"]', 'password');
  //   await page.click('button[type="submit"]');
  //   await page.waitForURL('/dashboard');
  //   await use(page);
  // },
});

export { expect } from '@playwright/test';

