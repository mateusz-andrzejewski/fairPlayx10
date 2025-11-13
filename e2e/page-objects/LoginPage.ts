import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Login Page
 * Example of how to structure page objects
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password|hasło/i);
    this.loginButton = page.getByRole('button', { name: /login|zaloguj/i });
    this.registerLink = page.getByRole('link', { name: /register|zarejestruj/i });
    this.errorMessage = page.locator('[role="alert"], .error');
  }

  async goto() {
    await super.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isErrorMessageVisible() {
    return await this.errorMessage.isVisible();
  }

  async goToRegister() {
    await this.registerLink.click();
  }
}

