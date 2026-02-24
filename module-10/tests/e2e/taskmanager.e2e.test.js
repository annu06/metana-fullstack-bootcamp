const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

describe('TaskManager E2E Tests', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';
  const apiBaseUrl = 'http://localhost:5000';

  // Test user credentials
  const testUser = {
    name: 'John Test',
    email: 'john.test@example.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // Set up Chrome options for headless mode
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Set implicit wait timeout
    await driver.manage().setTimeouts({ implicit: 10000 });
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async () => {
    // Clear localStorage before each test
    await driver.executeScript('localStorage.clear();');
  });

  afterEach(async () => {
    // Clean up test data after each test
    try {
      // Delete test user if exists
      await cleanupTestUser();
    } catch (error) {
      console.log('Cleanup failed:', error.message);
    }
  });

  const cleanupTestUser = async () => {
    // This would typically make API calls to clean up test data
    // For now, we'll just clear localStorage
    await driver.executeScript('localStorage.clear();');
  };

  const waitForElement = async (locator, timeout = 10000) => {
    return await driver.wait(until.elementLocated(locator), timeout);
  };

  const waitForElementVisible = async (locator, timeout = 10000) => {
    const element = await waitForElement(locator, timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    return element;
  };

  describe('Home Page', () => {
    test('should load home page and display welcome message', async () => {
      await driver.get(baseUrl);
      
      const title = await waitForElementVisible(By.css('[data-testid="hero-title"]'));
      const titleText = await title.getText();
      expect(titleText).toBe('Welcome to TaskManager');
      
      const description = await driver.findElement(By.css('[data-testid="hero-description"]'));
      expect(await description.isDisplayed()).toBe(true);
    });

    test('should display navigation links', async () => {
      await driver.get(baseUrl);
      
      const loginLink = await waitForElementVisible(By.css('[data-testid="login-link"]'));
      const registerLink = await driver.findElement(By.css('[data-testid="register-link"]'));
      
      expect(await loginLink.isDisplayed()).toBe(true);
      expect(await registerLink.isDisplayed()).toBe(true);
    });

    test('should display features section', async () => {
      await driver.get(baseUrl);
      
      const featuresTitle = await waitForElementVisible(By.css('[data-testid="features-title"]'));
      expect(await featuresTitle.getText()).toBe('Features');
      
      const organizeFeature = await driver.findElement(By.css('[data-testid="feature-organize"]'));
      const trackFeature = await driver.findElement(By.css('[data-testid="feature-track"]'));
      const collaborateFeature = await driver.findElement(By.css('[data-testid="feature-collaborate"]'));
      
      expect(await organizeFeature.isDisplayed()).toBe(true);
      expect(await trackFeature.isDisplayed()).toBe(true);
      expect(await collaborateFeature.isDisplayed()).toBe(true);
    });
  });

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      await driver.get(`${baseUrl}/register`);
      
      // Fill out registration form
      const nameInput = await waitForElementVisible(By.css('[data-testid="name-input"]'));
      const emailInput = await driver.findElement(By.css('[data-testid="email-input"]'));
      const passwordInput = await driver.findElement(By.css('[data-testid="password-input"]'));
      const confirmPasswordInput = await driver.findElement(By.css('[data-testid="confirm-password-input"]'));
      
      await nameInput.sendKeys(testUser.name);
      await emailInput.sendKeys(testUser.email);
      await passwordInput.sendKeys(testUser.password);
      await confirmPasswordInput.sendKeys(testUser.password);
      
      const submitButton = await driver.findElement(By.css('[data-testid="submit-button"]'));
      await submitButton.click();
      
      // Should redirect to dashboard after successful registration
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');
    });

    test('should show validation errors for invalid input', async () => {
      await driver.get(`${baseUrl}/register`);
      
      const submitButton = await waitForElementVisible(By.css('[data-testid="submit-button"]'));
      await submitButton.click();
      
      // Check for validation errors
      const nameError = await waitForElementVisible(By.css('[data-testid="name-error"]'));
      const emailError = await driver.findElement(By.css('[data-testid="email-error"]'));
      const passwordError = await driver.findElement(By.css('[data-testid="password-error"]'));
      
      expect(await nameError.getText()).toContain('Name is required');
      expect(await emailError.getText()).toContain('Email is required');
      expect(await passwordError.getText()).toContain('Password is required');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Register user first
      await driver.get(`${baseUrl}/register`);
      
      const nameInput = await waitForElementVisible(By.css('[data-testid="name-input"]'));
      const emailInput = await driver.findElement(By.css('[data-testid="email-input"]'));
      const passwordInput = await driver.findElement(By.css('[data-testid="password-input"]'));
      const confirmPasswordInput = await driver.findElement(By.css('[data-testid="confirm-password-input"]'));
      
      await nameInput.sendKeys(testUser.name);
      await emailInput.sendKeys(testUser.email);
      await passwordInput.sendKeys(testUser.password);
      await confirmPasswordInput.sendKeys(testUser.password);
      
      const submitButton = await driver.findElement(By.css('[data-testid="submit-button"]'));
      await submitButton.click();
      
      // Wait for redirect and then logout
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const logoutButton = await waitForElementVisible(By.css('[data-testid="logout-button"]'));
      await logoutButton.click();
    });

    test('should login with valid credentials', async () => {
      await driver.get(`${baseUrl}/login`);
      
      const emailInput = await waitForElementVisible(By.css('[data-testid="email-input"]'));
      const passwordInput = await driver.findElement(By.css('[data-testid="password-input"]'));
      
      await emailInput.sendKeys(testUser.email);
      await passwordInput.sendKeys(testUser.password);
      
      const submitButton = await driver.findElement(By.css('[data-testid="submit-button"]'));
      await submitButton.click();
      
      // Should redirect to dashboard
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');
    });

    test('should show error for invalid credentials', async () => {
      await driver.get(`${baseUrl}/login`);
      
      const emailInput = await waitForElementVisible(By.css('[data-testid="email-input"]'));
      const passwordInput = await driver.findElement(By.css('[data-testid="password-input"]'));
      
      await emailInput.sendKeys('wrong@email.com');
      await passwordInput.sendKeys('wrongpassword');
      
      const submitButton = await driver.findElement(By.css('[data-testid="submit-button"]'));
      await submitButton.click();
      
      // Should show error message
      const errorMessage = await waitForElementVisible(By.css('[data-testid="error-message"]'));
      expect(await errorMessage.isDisplayed()).toBe(true);
    });
  });

  describe('Task Management', () => {
    beforeEach(async () => {
      // Register and login user
      await driver.get(`${baseUrl}/register`);
      
      const nameInput = await waitForElementVisible(By.css('[data-testid="name-input"]'));
      const emailInput = await driver.findElement(By.css('[data-testid="email-input"]'));
      const passwordInput = await driver.findElement(By.css('[data-testid="password-input"]'));
      const confirmPasswordInput = await driver.findElement(By.css('[data-testid="confirm-password-input"]'));
      
      await nameInput.sendKeys(testUser.name);
      await emailInput.sendKeys(testUser.email);
      await passwordInput.sendKeys(testUser.password);
      await confirmPasswordInput.sendKeys(testUser.password);
      
      const submitButton = await driver.findElement(By.css('[data-testid="submit-button"]'));
      await submitButton.click();
      
      await driver.wait(until.urlContains('/dashboard'), 10000);
    });

    test('should create a new task', async () => {
      const addTaskButton = await waitForElementVisible(By.css('[data-testid="add-task-button"]'));
      await addTaskButton.click();
      
      // Fill out task form
      const titleInput = await waitForElementVisible(By.css('[data-testid="new-task-title"]'));
      const descriptionInput = await driver.findElement(By.css('[data-testid="new-task-description"]'));
      const prioritySelect = await driver.findElement(By.css('[data-testid="new-task-priority"]'));
      
      await titleInput.sendKeys('Test Task');
      await descriptionInput.sendKeys('This is a test task');
      await prioritySelect.sendKeys('high');
      
      const createButton = await driver.findElement(By.css('[data-testid="create-task-button"]'));
      await createButton.click();
      
      // Check if task was created
      const taskCard = await waitForElementVisible(By.css('[data-testid="task-card"]'));
      const taskTitle = await taskCard.findElement(By.css('[data-testid="task-title"]'));
      expect(await taskTitle.getText()).toBe('Test Task');
    });

    test('should filter tasks by status', async () => {
      // Create a task first
      const addTaskButton = await waitForElementVisible(By.css('[data-testid="add-task-button"]'));
      await addTaskButton.click();
      
      const titleInput = await waitForElementVisible(By.css('[data-testid="new-task-title"]'));
      await titleInput.sendKeys('Test Task');
      
      const createButton = await driver.findElement(By.css('[data-testid="create-task-button"]'));
      await createButton.click();
      
      // Wait for task to appear
      await waitForElementVisible(By.css('[data-testid="task-card"]'));
      
      // Complete the task
      const completeButton = await driver.findElement(By.css('[data-testid="complete-button"]'));
      await completeButton.click();
      
      // Filter by completed tasks
      const completedFilter = await waitForElementVisible(By.css('[data-testid="filter-completed"]'));
      await completedFilter.click();
      
      // Should still see the task (now completed)
      const taskCard = await waitForElementVisible(By.css('[data-testid="task-card"]'));
      expect(await taskCard.isDisplayed()).toBe(true);
      
      // Filter by pending tasks
      const pendingFilter = await driver.findElement(By.css('[data-testid="filter-pending"]'));
      await pendingFilter.click();
      
      // Should see "no tasks" message
      const noTasks = await waitForElementVisible(By.css('[data-testid="no-tasks"]'));
      expect(await noTasks.isDisplayed()).toBe(true);
    });

    test('should search tasks', async () => {
      // Create multiple tasks
      const addTaskButton = await waitForElementVisible(By.css('[data-testid="add-task-button"]'));
      await addTaskButton.click();
      
      const titleInput = await waitForElementVisible(By.css('[data-testid="new-task-title"]'));
      await titleInput.sendKeys('Important Meeting');
      
      const createButton = await driver.findElement(By.css('[data-testid="create-task-button"]'));
      await createButton.click();
      
      // Create second task
      await addTaskButton.click();
      await titleInput.clear();
      await titleInput.sendKeys('Buy Groceries');
      await createButton.click();
      
      // Search for specific task
      const searchInput = await waitForElementVisible(By.css('[data-testid="search-input"]'));
      await searchInput.sendKeys('Meeting');
      
      // Should only show matching task
      await driver.sleep(1000); // Wait for search to filter
      const taskCards = await driver.findElements(By.css('[data-testid="task-card"]'));
      expect(taskCards.length).toBe(1);
      
      const taskTitle = await taskCards[0].findElement(By.css('[data-testid="task-title"]'));
      expect(await taskTitle.getText()).toBe('Important Meeting');
    });
  });

  describe('Navigation and Logout', () => {
    beforeEach(async () => {
      // Register and login user
      await driver.get(`${baseUrl}/register`);
      
      const nameInput = await waitForElementVisible(By.css('[data-testid="name-input"]'));
      const emailInput = await driver.findElement(By.css('[data-testid="email-input"]'));
      const passwordInput = await driver.findElement(By.css('[data-testid="password-input"]'));
      const confirmPasswordInput = await driver.findElement(By.css('[data-testid="confirm-password-input"]'));
      
      await nameInput.sendKeys(testUser.name);
      await emailInput.sendKeys(testUser.email);
      await passwordInput.sendKeys(testUser.password);
      await confirmPasswordInput.sendKeys(testUser.password);
      
      const submitButton = await driver.findElement(By.css('[data-testid="submit-button"]'));
      await submitButton.click();
      
      await driver.wait(until.urlContains('/dashboard'), 10000);
    });

    test('should display user name in navbar when logged in', async () => {
      const navUser = await waitForElementVisible(By.css('[data-testid="nav-user"]'));
      const userText = await navUser.getText();
      expect(userText).toContain(testUser.name);
    });

    test('should logout successfully', async () => {
      const logoutButton = await waitForElementVisible(By.css('[data-testid="logout-button"]'));
      await logoutButton.click();
      
      // Should redirect to home page
      await driver.wait(until.urlIs(baseUrl + '/'), 10000);
      
      // Should show login and register links again
      const loginLink = await waitForElementVisible(By.css('[data-testid="login-link"]'));
      const registerLink = await driver.findElement(By.css('[data-testid="register-link"]'));
      
      expect(await loginLink.isDisplayed()).toBe(true);
      expect(await registerLink.isDisplayed()).toBe(true);
    });

    test('should redirect to login when accessing protected route without authentication', async () => {
      // Logout first
      const logoutButton = await waitForElementVisible(By.css('[data-testid="logout-button"]'));
      await logoutButton.click();
      
      // Try to access dashboard
      await driver.get(`${baseUrl}/dashboard`);
      
      // Should redirect to login
      await driver.wait(until.urlContains('/login'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/login');
    });
  });
});