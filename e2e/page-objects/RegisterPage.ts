import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Register Page
 * Uses data-test-id attributes for reliable element selection
 */
export class RegisterPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly positionSelect: Locator;
  readonly consentCheckbox: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;
  readonly registerForm: Locator;
  readonly successMessage: Locator;
  readonly successTitle: Locator;

  // Error locators
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly positionError: Locator;
  readonly consentError: Locator;

  constructor(page: Page) {
    super(page);
    // Input fields
    this.emailInput = page.locator('[data-test-id="email-input"]');
    this.passwordInput = page.locator('[data-test-id="password-input"]');
    this.firstNameInput = page.locator('[data-test-id="first-name-input"]');
    this.lastNameInput = page.locator('[data-test-id="last-name-input"]');
    this.positionSelect = page.locator('[data-test-id="position-select"]');
    this.consentCheckbox = page.locator('[data-test-id="consent-checkbox"]');

    // Buttons and links
    this.submitButton = page.locator('[data-test-id="submit-button"]');
    this.backToLoginLink = page.locator('[data-test-id="back-to-login-link"]');

    // Form and success
    this.registerForm = page.locator('[data-test-id="register-form"]');
    this.successMessage = page.locator('[data-test-id="registration-success-message"]');
    this.successTitle = page.locator('[data-test-id="success-title"]');

    // Error messages
    this.emailError = page.locator('[data-test-id="email-error"]');
    this.passwordError = page.locator('[data-test-id="password-error"]');
    this.firstNameError = page.locator('[data-test-id="first-name-error"]');
    this.lastNameError = page.locator('[data-test-id="last-name-error"]');
    this.positionError = page.locator('[data-test-id="position-error"]');
    this.consentError = page.locator('[data-test-id="consent-error"]');
  }

  async goto() {
    await super.goto("/register");
  }

  /**
   * Fill the registration form with provided data
   * @param email - User email
   * @param password - User password
   * @param firstName - User first name
   * @param lastName - User last name
   * @param position - Player position (forward, midfielder, defender, goalkeeper)
   * @param acceptConsent - Whether to check the consent checkbox
   */
  async fillRegistrationForm(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    position: "forward" | "midfielder" | "defender" | "goalkeeper",
    acceptConsent = true
  ) {
    // Wait for React hydration
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(500);

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);

    // Select position from dropdown using Radix UI with data-test-id
    await this.positionSelect.click();
    // Wait for dropdown to appear and use data-test-id for reliable selection
    await this.page.waitForTimeout(100); // Brief wait for dropdown animation
    await this.page.locator(`[data-test-id="position-option-${position}"]`).click();

    // Check consent if needed
    if (acceptConsent) {
      await this.consentCheckbox.check();
    }
  }

  /**
   * Submit the registration form
   */
  async submitForm() {
    await this.submitButton.click();
  }

  /**
   * Complete registration flow
   * Combines filling the form and submitting it
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    position: "forward" | "midfielder" | "defender" | "goalkeeper"
  ) {
    await this.fillRegistrationForm(email, password, firstName, lastName, position, true);
    await this.submitForm();
  }

  /**
   * Check if registration form is visible
   */
  async isRegisterFormVisible() {
    return await this.registerForm.isVisible();
  }

  /**
   * Check if success message is visible
   */
  async isSuccessMessageVisible() {
    return await this.successMessage.isVisible();
  }

  /**
   * Get success message title text
   */
  async getSuccessTitle() {
    return await this.successTitle.textContent();
  }

  /**
   * Go back to login page
   */
  async goToLogin() {
    await this.backToLoginLink.click();
  }

  /**
   * Check if specific error is visible
   */
  async isEmailErrorVisible() {
    return await this.emailError.isVisible();
  }

  async isPasswordErrorVisible() {
    return await this.passwordError.isVisible();
  }

  async isFirstNameErrorVisible() {
    return await this.firstNameError.isVisible();
  }

  async isLastNameErrorVisible() {
    return await this.lastNameError.isVisible();
  }

  async isPositionErrorVisible() {
    return await this.positionError.isVisible();
  }

  async isConsentErrorVisible() {
    return await this.consentError.isVisible();
  }
}
