const { By, until } = require('selenium-webdriver');

describe('Authentication E2E Tests', () => {
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const timestamp = Date.now();
      const testUser = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'Password123'
      };

      // Navigate to registration page
      await global.testUtils.navigateTo('/register');

      // Verify we're on the registration page
      const pageTitle = await driver.getTitle();
      expect(pageTitle).toContain('Register');

      // Fill out registration form
      await driver.findElement(By.css('[data-testid="username-input"]')).sendKeys(testUser.username);
      await driver.findElement(By.css('[data-testid="email-input"]')).sendKeys(testUser.email);
      await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys(testUser.password);
      await driver.findElement(By.css('[data-testid="confirm-password-input"]')).sendKeys(testUser.password);

      // Submit the form
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Wait for successful registration and redirect
      await driver.wait(until.urlContains('/'), 15000);

      // Verify user is logged in by checking for user menu
      const userMenu = await driver.wait(
        until.elementLocated(By.css('[data-testid="user-menu-toggle"]')),
        10000
      );
      expect(await userMenu.isDisplayed()).toBe(true);

      // Verify username is displayed in the menu
      await userMenu.click();
      const usernameElement = await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(), '${testUser.username}')]`)),
        5000
      );
      expect(await usernameElement.isDisplayed()).toBe(true);
    });

    it('should show validation errors for invalid registration data', async () => {
      await global.testUtils.navigateTo('/register');

      // Try to submit empty form
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Check for validation errors
      const usernameError = await driver.wait(
        until.elementLocated(By.css('[data-testid="username-error"]')),
        5000
      );
      expect(await usernameError.isDisplayed()).toBe(true);

      const emailError = await driver.wait(
        until.elementLocated(By.css('[data-testid="email-error"]')),
        5000
      );
      expect(await emailError.isDisplayed()).toBe(true);

      const passwordError = await driver.wait(
        until.elementLocated(By.css('[data-testid="password-error"]')),
        5000
      );
      expect(await passwordError.isDisplayed()).toBe(true);
    });

    it('should show error for duplicate email registration', async () => {
      const testUser = {
        username: 'testuser1',
        email: 'duplicate@example.com',
        password: 'Password123'
      };

      // Register first user
      await global.testUtils.navigateTo('/register');
      await driver.findElement(By.css('[data-testid="username-input"]')).sendKeys(testUser.username);
      await driver.findElement(By.css('[data-testid="email-input"]')).sendKeys(testUser.email);
      await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys(testUser.password);
      await driver.findElement(By.css('[data-testid="confirm-password-input"]')).sendKeys(testUser.password);
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Wait for registration to complete
      await driver.wait(until.urlContains('/'), 15000);

      // Logout
      await global.testUtils.logout();

      // Try to register with same email
      await global.testUtils.navigateTo('/register');
      await driver.findElement(By.css('[data-testid="username-input"]')).sendKeys('testuser2');
      await driver.findElement(By.css('[data-testid="email-input"]')).sendKeys(testUser.email);
      await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys(testUser.password);
      await driver.findElement(By.css('[data-testid="confirm-password-input"]')).sendKeys(testUser.password);
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Check for duplicate email error
      const errorMessage = await driver.wait(
        until.elementLocated(By.css('[data-testid="auth-error"]')),
        10000
      );
      expect(await errorMessage.isDisplayed()).toBe(true);
      expect(await errorMessage.getText()).toContain('already exists');
    });
  });

  describe('User Login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await global.testUtils.createTestUser();
      // Logout after creation
      await global.testUtils.logout();
    });

    it('should login with valid credentials', async () => {
      await global.testUtils.navigateTo('/login');

      // Verify we're on the login page
      const pageTitle = await driver.getTitle();
      expect(pageTitle).toContain('Login');

      // Fill login form
      await driver.findElement(By.css('[data-testid="email-input"]')).sendKeys(testUser.email);
      await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys(testUser.password);

      // Submit form
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Wait for successful login and redirect
      await driver.wait(until.urlContains('/'), 15000);

      // Verify user is logged in
      const userMenu = await driver.wait(
        until.elementLocated(By.css('[data-testid="user-menu-toggle"]')),
        10000
      );
      expect(await userMenu.isDisplayed()).toBe(true);
    });

    it('should show error for invalid credentials', async () => {
      await global.testUtils.navigateTo('/login');

      // Try login with wrong password
      await driver.findElement(By.css('[data-testid="email-input"]')).sendKeys(testUser.email);
      await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys('wrongpassword');
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Check for error message
      const errorMessage = await driver.wait(
        until.elementLocated(By.css('[data-testid="auth-error"]')),
        10000
      );
      expect(await errorMessage.isDisplayed()).toBe(true);
      expect(await errorMessage.getText()).toContain('Invalid');
    });

    it('should show validation errors for empty login form', async () => {
      await global.testUtils.navigateTo('/login');

      // Try to submit empty form
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Check for validation errors
      const emailError = await driver.wait(
        until.elementLocated(By.css('[data-testid="email-error"]')),
        5000
      );
      expect(await emailError.isDisplayed()).toBe(true);

      const passwordError = await driver.wait(
        until.elementLocated(By.css('[data-testid="password-error"]')),
        5000
      );
      expect(await passwordError.isDisplayed()).toBe(true);
    });
  });

  describe('User Logout', () => {
    beforeEach(async () => {
      // Create and login a test user
      await global.testUtils.createTestUser();
    });

    it('should logout user successfully', async () => {
      // Verify user is logged in
      const userMenu = await driver.findElement(By.css('[data-testid="user-menu-toggle"]'));
      expect(await userMenu.isDisplayed()).toBe(true);

      // Logout
      await global.testUtils.logout();

      // Verify user is logged out by checking for login link
      const loginLink = await driver.wait(
        until.elementLocated(By.css('[data-testid="login-link"]')),
        10000
      );
      expect(await loginLink.isDisplayed()).toBe(true);

      // Verify user menu is no longer visible
      const userMenus = await driver.findElements(By.css('[data-testid="user-menu-toggle"]'));
      expect(userMenus.length).toBe(0);
    });
  });

  describe('Navigation Protection', () => {
    it('should redirect unauthenticated users to login when accessing protected routes', async () => {
      // Try to access dashboard without login
      await global.testUtils.navigateTo('/dashboard');

      // Should be redirected to login page
      await driver.wait(until.urlContains('/login'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });

    it('should redirect unauthenticated users to login when accessing create blog page', async () => {
      // Try to access create blog without login
      await global.testUtils.navigateTo('/create-blog');

      // Should be redirected to login page
      await driver.wait(until.urlContains('/login'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });

    it('should allow authenticated users to access protected routes', async () => {
      // Create and login user
      await global.testUtils.createTestUser();

      // Access dashboard
      await global.testUtils.navigateTo('/dashboard');

      // Should stay on dashboard
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');

      // Verify dashboard content is loaded
      const welcomeMessage = await driver.wait(
        until.elementLocated(By.xpath('//*[contains(text(), "Welcome back")]')),
        10000
      );
      expect(await welcomeMessage.isDisplayed()).toBe(true);
    });
  });
});