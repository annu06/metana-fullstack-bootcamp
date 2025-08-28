const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

// Global test configuration
global.testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true',
  timeout: 30000
};

// WebDriver instance
let driver;

// Setup WebDriver before each test
beforeEach(async () => {
  const options = getBrowserOptions();
  
  try {
    driver = await new Builder()
      .forBrowser(global.testConfig.browser)
      .setChromeOptions(options.chrome)
      .setFirefoxOptions(options.firefox)
      .build();
    
    // Set implicit wait timeout
    await driver.manage().setTimeouts({ implicit: 10000 });
    
    // Maximize window for consistent testing
    await driver.manage().window().maximize();
    
    // Make driver globally available
    global.driver = driver;
    
    console.log(`WebDriver initialized for ${global.testConfig.browser}`);
  } catch (error) {
    console.error('Failed to initialize WebDriver:', error);
    throw error;
  }
});

// Cleanup WebDriver after each test
afterEach(async () => {
  if (driver) {
    try {
      await driver.quit();
      console.log('WebDriver session closed');
    } catch (error) {
      console.error('Error closing WebDriver:', error);
    }
  }
});

// Browser options configuration
function getBrowserOptions() {
  const chromeOptions = new chrome.Options();
  const firefoxOptions = new firefox.Options();
  
  if (global.testConfig.headless) {
    chromeOptions.addArguments('--headless');
    firefoxOptions.addArguments('--headless');
  }
  
  // Chrome-specific options
  chromeOptions.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding'
  );
  
  // Firefox-specific options
  firefoxOptions.addArguments(
    '--width=1920',
    '--height=1080'
  );
  
  return {
    chrome: chromeOptions,
    firefox: firefoxOptions
  };
}

// Global test utilities
global.testUtils = {
  // Wait for element to be visible
  waitForElement: async (locator, timeout = 10000) => {
    const { until } = require('selenium-webdriver');
    return await driver.wait(until.elementLocated(locator), timeout);
  },
  
  // Wait for element to be clickable
  waitForClickable: async (locator, timeout = 10000) => {
    const { until } = require('selenium-webdriver');
    return await driver.wait(until.elementIsEnabled(await driver.findElement(locator)), timeout);
  },
  
  // Navigate to page
  navigateTo: async (path = '') => {
    const url = `${global.testConfig.baseUrl}${path}`;
    await driver.get(url);
    console.log(`Navigated to: ${url}`);
  },
  
  // Take screenshot for debugging
  takeScreenshot: async (filename) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const screenshot = await driver.takeScreenshot();
      const screenshotPath = path.join(__dirname, 'screenshots', `${filename}.png`);
      
      // Create screenshots directory if it doesn't exist
      const screenshotDir = path.dirname(screenshotPath);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      fs.writeFileSync(screenshotPath, screenshot, 'base64');
      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  },
  
  // Login helper
  login: async (email = 'test@example.com', password = 'Password123') => {
    const { By } = require('selenium-webdriver');
    
    await global.testUtils.navigateTo('/login');
    
    // Fill login form
    await driver.findElement(By.css('[data-testid="email-input"]')).sendKeys(email);
    await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys(password);
    
    // Submit form
    await driver.findElement(By.css('[data-testid="submit-button"]')).click();
    
    // Wait for redirect to dashboard or home
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('/dashboard') || currentUrl === global.testConfig.baseUrl + '/';
    }, 10000);
    
    console.log('User logged in successfully');
  },
  
  // Logout helper
  logout: async () => {
    const { By } = require('selenium-webdriver');
    
    try {
      // Click user menu toggle
      await driver.findElement(By.css('[data-testid="user-menu-toggle"]')).click();
      
      // Click logout button
      await driver.findElement(By.css('[data-testid="logout-button"]')).click();
      
      // Wait for redirect to home page
      await driver.wait(async () => {
        const currentUrl = await driver.getCurrentUrl();
        return currentUrl === global.testConfig.baseUrl + '/' || currentUrl.includes('/login');
      }, 10000);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
  
  // Create test user helper
  createTestUser: async (userData = {}) => {
    const defaultUser = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'Password123'
    };
    
    const user = { ...defaultUser, ...userData };
    
    const { By } = require('selenium-webdriver');
    
    await global.testUtils.navigateTo('/register');
    
    // Fill registration form
    await driver.findElement(By.css('[data-testid="username-input"]')).sendKeys(user.username);
    await driver.findElement(By.css('[data-testid="email-input"]')).sendKeys(user.email);
    await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys(user.password);
    await driver.findElement(By.css('[data-testid="confirm-password-input"]')).sendKeys(user.password);
    
    // Submit form
    await driver.findElement(By.css('[data-testid="submit-button"]')).click();
    
    // Wait for successful registration
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('/dashboard') || currentUrl === global.testConfig.baseUrl + '/';
    }, 10000);
    
    console.log('Test user created successfully:', user.email);
    return user;
  }
};

// Increase Jest timeout for e2e tests
jest.setTimeout(60000);

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  if (driver) {
    try {
      await driver.quit();
    } catch (quitError) {
      console.error('Error quitting driver:', quitError);
    }
  }
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (driver) {
    try {
      await driver.quit();
    } catch (quitError) {
      console.error('Error quitting driver:', quitError);
    }
  }
});

console.log('E2E test setup initialized');