const { By, until } = require('selenium-webdriver');

describe('Navigation E2E Tests', () => {
  describe('Public Navigation', () => {
    it('should navigate between public pages without authentication', async () => {
      // Start at home page
      await global.testUtils.navigateTo('/');
      
      // Verify home page loads
      const homeTitle = await driver.getTitle();
      expect(homeTitle).toContain('Blog');
      
      // Navigate to login page
      const loginLink = await driver.findElement(By.css('[data-testid="login-link"]'));
      await loginLink.click();
      
      await driver.wait(until.urlContains('/login'), 10000);
      const loginTitle = await driver.getTitle();
      expect(loginTitle).toContain('Login');
      
      // Navigate to register page
      const registerLink = await driver.findElement(By.css('[data-testid="register-link"]'));
      await registerLink.click();
      
      await driver.wait(until.urlContains('/register'), 10000);
      const registerTitle = await driver.getTitle();
      expect(registerTitle).toContain('Register');
      
      // Navigate back to home
      const homeLink = await driver.findElement(By.css('[data-testid="home-link"]'));
      await homeLink.click();
      
      await driver.wait(until.urlMatches(/\/$|^\/$/), 10000);
      const finalTitle = await driver.getTitle();
      expect(finalTitle).toContain('Blog');
    });

    it('should display correct navigation menu for unauthenticated users', async () => {
      await global.testUtils.navigateTo('/');
      
      // Verify public navigation links are visible
      const homeLink = await driver.findElement(By.css('[data-testid="home-link"]'));
      expect(await homeLink.isDisplayed()).toBe(true);
      
      const loginLink = await driver.findElement(By.css('[data-testid="login-link"]'));
      expect(await loginLink.isDisplayed()).toBe(true);
      
      const registerLink = await driver.findElement(By.css('[data-testid="register-link"]'));
      expect(await registerLink.isDisplayed()).toBe(true);
      
      // Verify authenticated-only links are not visible
      const dashboardLinks = await driver.findElements(By.css('[data-testid="dashboard-link"]'));
      expect(dashboardLinks.length).toBe(0);
      
      const createBlogLinks = await driver.findElements(By.css('[data-testid="create-blog-link"]'));
      expect(createBlogLinks.length).toBe(0);
      
      const userMenus = await driver.findElements(By.css('[data-testid="user-menu-toggle"]'));
      expect(userMenus.length).toBe(0);
    });

    it('should handle direct URL navigation for public pages', async () => {
      // Direct navigation to login
      await global.testUtils.navigateTo('/login');
      const loginTitle = await driver.getTitle();
      expect(loginTitle).toContain('Login');
      
      // Direct navigation to register
      await global.testUtils.navigateTo('/register');
      const registerTitle = await driver.getTitle();
      expect(registerTitle).toContain('Register');
      
      // Direct navigation to home
      await global.testUtils.navigateTo('/');
      const homeTitle = await driver.getTitle();
      expect(homeTitle).toContain('Blog');
    });
  });

  describe('Authenticated Navigation', () => {
    let testUser;

    beforeEach(async () => {
      // Create and login a test user
      testUser = await global.testUtils.createTestUser();
    });

    it('should display correct navigation menu for authenticated users', async () => {
      await global.testUtils.navigateTo('/');
      
      // Verify authenticated navigation links are visible
      const homeLink = await driver.findElement(By.css('[data-testid="home-link"]'));
      expect(await homeLink.isDisplayed()).toBe(true);
      
      const dashboardLink = await driver.findElement(By.css('[data-testid="dashboard-link"]'));
      expect(await dashboardLink.isDisplayed()).toBe(true);
      
      const createBlogLink = await driver.findElement(By.css('[data-testid="create-blog-link"]'));
      expect(await createBlogLink.isDisplayed()).toBe(true);
      
      const userMenuToggle = await driver.findElement(By.css('[data-testid="user-menu-toggle"]'));
      expect(await userMenuToggle.isDisplayed()).toBe(true);
      
      // Verify public-only links are not visible
      const loginLinks = await driver.findElements(By.css('[data-testid="login-link"]'));
      expect(loginLinks.length).toBe(0);
      
      const registerLinks = await driver.findElements(By.css('[data-testid="register-link"]'));
      expect(registerLinks.length).toBe(0);
    });

    it('should navigate between authenticated pages', async () => {
      // Start at home
      await global.testUtils.navigateTo('/');
      
      // Navigate to dashboard
      const dashboardLink = await driver.findElement(By.css('[data-testid="dashboard-link"]'));
      await dashboardLink.click();
      
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const dashboardTitle = await driver.getTitle();
      expect(dashboardTitle).toContain('Dashboard');
      
      // Navigate to create blog
      const createBlogLink = await driver.findElement(By.css('[data-testid="create-blog-link"]'));
      await createBlogLink.click();
      
      await driver.wait(until.urlContains('/create'), 10000);
      const createTitle = await driver.getTitle();
      expect(createTitle).toContain('Create');
      
      // Navigate back to home
      const homeLink = await driver.findElement(By.css('[data-testid="home-link"]'));
      await homeLink.click();
      
      await driver.wait(until.urlMatches(/\/$|^\/$/), 10000);
      const homeTitle = await driver.getTitle();
      expect(homeTitle).toContain('Blog');
    });

    it('should display user information in user menu', async () => {
      await global.testUtils.navigateTo('/');
      
      // Click user menu toggle
      const userMenuToggle = await driver.findElement(By.css('[data-testid="user-menu-toggle"]'));
      await userMenuToggle.click();
      
      // Verify user information is displayed
      const usernameDisplay = await driver.wait(
        until.elementLocated(By.css('[data-testid="user-menu-username"]')),
        5000
      );
      expect(await usernameDisplay.getText()).toContain(testUser.username);
      
      const emailDisplay = await driver.findElement(By.css('[data-testid="user-menu-email"]'));
      expect(await emailDisplay.getText()).toContain(testUser.email);
      
      // Verify logout option is available
      const logoutButton = await driver.findElement(By.css('[data-testid="logout-button"]'));
      expect(await logoutButton.isDisplayed()).toBe(true);
    });

    it('should handle direct URL navigation for protected pages', async () => {
      // Direct navigation to dashboard
      await global.testUtils.navigateTo('/dashboard');
      const dashboardTitle = await driver.getTitle();
      expect(dashboardTitle).toContain('Dashboard');
      
      // Direct navigation to create blog
      await global.testUtils.navigateTo('/create-blog');
      const createTitle = await driver.getTitle();
      expect(createTitle).toContain('Create');
      
      // Verify user stays on protected pages
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/create');
    });
  });

  describe('Responsive Navigation', () => {
    beforeEach(async () => {
      // Create and login a test user
      await global.testUtils.createTestUser();
    });

    it('should display mobile menu on small screens', async () => {
      // Set mobile viewport
      await driver.manage().window().setRect({ width: 375, height: 667 });
      
      await global.testUtils.navigateTo('/');
      
      // Verify mobile menu toggle is visible
      const mobileMenuToggle = await driver.wait(
        until.elementLocated(By.css('[data-testid="mobile-menu-toggle"]')),
        10000
      );
      expect(await mobileMenuToggle.isDisplayed()).toBe(true);
      
      // Verify desktop navigation is hidden
      const desktopNav = await driver.findElement(By.css('[data-testid="desktop-navigation"]'));
      expect(await desktopNav.isDisplayed()).toBe(false);
      
      // Click mobile menu toggle
      await mobileMenuToggle.click();
      
      // Verify mobile menu opens
      const mobileMenu = await driver.wait(
        until.elementLocated(By.css('[data-testid="mobile-menu"]')),
        5000
      );
      expect(await mobileMenu.isDisplayed()).toBe(true);
      
      // Verify navigation links are in mobile menu
      const mobileHomeLink = await driver.findElement(By.css('[data-testid="mobile-home-link"]'));
      expect(await mobileHomeLink.isDisplayed()).toBe(true);
      
      const mobileDashboardLink = await driver.findElement(By.css('[data-testid="mobile-dashboard-link"]'));
      expect(await mobileDashboardLink.isDisplayed()).toBe(true);
      
      // Reset viewport
      await driver.manage().window().setRect({ width: 1200, height: 800 });
    });

    it('should navigate using mobile menu', async () => {
      // Set mobile viewport
      await driver.manage().window().setRect({ width:375, height: 667 });
      
      await global.testUtils.navigateTo('/');
      
      // Open mobile menu
      const mobileMenuToggle = await driver.findElement(By.css('[data-testid="mobile-menu-toggle"]'));
      await mobileMenuToggle.click();
      
      // Navigate to dashboard via mobile menu
      const mobileDashboardLink = await driver.wait(
        until.elementLocated(By.css('[data-testid="mobile-dashboard-link"]')),
        5000
      );
      await mobileDashboardLink.click();
      
      // Verify navigation worked
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');
      
      // Verify mobile menu closes after navigation
      const mobileMenus = await driver.findElements(By.css('[data-testid="mobile-menu"]'));
      if (mobileMenus.length > 0) {
        expect(await mobileMenus[0].isDisplayed()).toBe(false);
      }
      
      // Reset viewport
      await driver.manage().window().setRect({ width: 1200, height: 800 });
    });
  });

  describe('Breadcrumb Navigation', () => {
    beforeEach(async () => {
      // Create and login a test user
      await global.testUtils.createTestUser();
    });

    it('should display breadcrumbs on nested pages', async () => {
      // Navigate to create blog page
      await global.testUtils.navigateTo('/create-blog');
      
      // Verify breadcrumbs are displayed
      const breadcrumbs = await driver.wait(
        until.elementLocated(By.css('[data-testid="breadcrumbs"]')),
        10000
      );
      expect(await breadcrumbs.isDisplayed()).toBe(true);
      
      // Verify breadcrumb content
      const homeBreadcrumb = await driver.findElement(By.css('[data-testid="breadcrumb-home"]'));
      expect(await homeBreadcrumb.getText()).toContain('Home');
      
      const currentBreadcrumb = await driver.findElement(By.css('[data-testid="breadcrumb-current"]'));
      expect(await currentBreadcrumb.getText()).toContain('Create Blog');
    });

    it('should navigate using breadcrumb links', async () => {
      // Navigate to create blog page
      await global.testUtils.navigateTo('/create-blog');
      
      // Click home breadcrumb
      const homeBreadcrumb = await driver.findElement(By.css('[data-testid="breadcrumb-home"]'));
      await homeBreadcrumb.click();
      
      // Verify navigation to home
      await driver.wait(until.urlMatches(/\/$|^\/$/), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl.endsWith('/')).toBe(true);
    });

    it('should update breadcrumbs based on current page', async () => {
      // Navigate to dashboard
      await global.testUtils.navigateTo('/dashboard');
      
      const dashboardBreadcrumb = await driver.wait(
        until.elementLocated(By.css('[data-testid="breadcrumb-current"]')),
        10000
      );
      expect(await dashboardBreadcrumb.getText()).toContain('Dashboard');
      
      // Navigate to create blog
      await global.testUtils.navigateTo('/create-blog');
      
      const createBreadcrumb = await driver.wait(
        until.elementLocated(By.css('[data-testid="breadcrumb-current"]')),
        10000
      );
      expect(await createBreadcrumb.getText()).toContain('Create Blog');
    });
  });

  describe('Error Page Navigation', () => {
    it('should display 404 page for non-existent routes', async () => {
      // Navigate to non-existent page
      await global.testUtils.navigateTo('/non-existent-page');
      
      // Verify 404 page is displayed
      const errorTitle = await driver.wait(
        until.elementLocated(By.css('[data-testid="error-title"]')),
        10000
      );
      expect(await errorTitle.getText()).toContain('404');
      
      const errorMessage = await driver.findElement(By.css('[data-testid="error-message"]'));
      expect(await errorMessage.getText()).toContain('Page not found');
      
      // Verify home link is available
      const homeLink = await driver.findElement(By.css('[data-testid="error-home-link"]'));
      expect(await homeLink.isDisplayed()).toBe(true);
    });

    it('should navigate back to home from 404 page', async () => {
      // Navigate to non-existent page
      await global.testUtils.navigateTo('/non-existent-page');
      
      // Click home link from error page
      const homeLink = await driver.wait(
        until.elementLocated(By.css('[data-testid="error-home-link"]')),
        10000
      );
      await homeLink.click();
      
      // Verify navigation to home
      await driver.wait(until.urlMatches(/\/$|^\/$/), 10000);
      const homeTitle = await driver.getTitle();
      expect(homeTitle).toContain('Blog');
    });
  });

  describe('Browser Navigation', () => {
    beforeEach(async () => {
      // Create and login a test user
      await global.testUtils.createTestUser();
    });

    it('should handle browser back and forward buttons', async () => {
      // Start at home
      await global.testUtils.navigateTo('/');
      
      // Navigate to dashboard
      await global.testUtils.navigateTo('/dashboard');
      
      // Navigate to create blog
      await global.testUtils.navigateTo('/create-blog');
      
      // Use browser back button
      await driver.navigate().back();
      
      // Verify we're back at dashboard
      await driver.wait(until.urlContains('/dashboard'), 10000);
      let currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');
      
      // Use browser back button again
      await driver.navigate().back();
      
      // Verify we're back at home
      await driver.wait(until.urlMatches(/\/$|^\/$/), 10000);
      currentUrl = await driver.getCurrentUrl();
      expect(currentUrl.endsWith('/')).toBe(true);
      
      // Use browser forward button
      await driver.navigate().forward();
      
      // Verify we're back at dashboard
      await driver.wait(until.urlContains('/dashboard'), 10000);
      currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');
    });

    it('should handle page refresh on different routes', async () => {
      // Navigate to dashboard
      await global.testUtils.navigateTo('/dashboard');
      
      // Refresh page
      await driver.navigate().refresh();
      
      // Verify we stay on dashboard after refresh
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');
      
      // Verify page content loads correctly
      const welcomeMessage = await driver.wait(
        until.elementLocated(By.xpath('//*[contains(text(), "Welcome back")]')),
        10000
      );
      expect(await welcomeMessage.isDisplayed()).toBe(true);
    });
  });
});