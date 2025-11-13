import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Login Page
 * Uses data-test-id attributes for reliable element selection
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;
  readonly loginForm: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('[data-test-id="email-input"]');
    this.passwordInput = page.locator('[data-test-id="password-input"]');
    this.loginButton = page.locator('[data-test-id="submit-button"]');
    this.registerLink = page.locator('[data-test-id="register-link"]');
    this.errorMessage = page.locator('[role="alert"], .error');
    this.loginForm = page.locator('[data-test-id="login-form"]');
  }

  async goto() {
    await super.goto("/login");
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

  async isLoginFormVisible() {
    return await this.loginForm.isVisible();
  }
}
