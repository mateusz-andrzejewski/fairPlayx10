import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /login|zaloguj/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|hasło/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /login|zaloguj/i })).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.getByRole("button", { name: /login|zaloguj/i }).click();

    // Wait for validation messages to appear
    await page.waitForTimeout(500);

    // Check if there are any error messages visible
    const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test("should not have automatically detectable accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have link to registration page", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: /register|zarejestruj/i });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/.*register/);
  });
});
