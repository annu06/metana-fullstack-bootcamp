const { By, until } = require('selenium-webdriver');

describe('Blog Management E2E Tests', () => {
  let testUser;

  beforeEach(async () => {
    // Create and login a test user for each test
    testUser = await global.testUtils.createTestUser();
  });

  describe('Blog Creation', () => {
    it('should create a new blog post successfully', async () => {
      const blogData = {
        title: 'Test Blog Post',
        content: 'This is a test blog post content with some detailed information.',
        category: 'Technology'
      };

      // Navigate to create blog page
      await global.testUtils.navigateTo('/create-blog');

      // Verify we're on the create blog page
      const pageTitle = await driver.getTitle();
      expect(pageTitle).toContain('Create');

      // Fill out the blog form
      await driver.findElement(By.css('[data-testid="title-input"]')).sendKeys(blogData.title);
      await driver.findElement(By.css('[data-testid="content-textarea"]')).sendKeys(blogData.content);
      
      // Select category
      const categorySelect = await driver.findElement(By.css('[data-testid="category-select"]'));
      await categorySelect.click();
      await driver.findElement(By.css(`[data-testid="category-option-${blogData.category.toLowerCase()}"]`)).click();

      // Submit the form
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Wait for successful creation and redirect
      await driver.wait(until.urlContains('/'), 15000);

      // Verify the blog post appears on the home page
      const blogCard = await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(), '${blogData.title}')]`)),
        10000
      );
      expect(await blogCard.isDisplayed()).toBe(true);

      // Verify blog content preview
      const contentPreview = await driver.findElement(
        By.xpath(`//*[contains(text(), '${blogData.content.substring(0, 50)}')]`)
      );
      expect(await contentPreview.isDisplayed()).toBe(true);

      // Verify category is displayed
      const categoryBadge = await driver.findElement(
        By.xpath(`//*[contains(text(), '${blogData.category}')]`)
      );
      expect(await categoryBadge.isDisplayed()).toBe(true);
    });

    it('should show validation errors for empty blog form', async () => {
      await global.testUtils.navigateTo('/create-blog');

      // Try to submit empty form
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Check for validation errors
      const titleError = await driver.wait(
        until.elementLocated(By.css('[data-testid="title-error"]')),
        5000
      );
      expect(await titleError.isDisplayed()).toBe(true);

      const contentError = await driver.wait(
        until.elementLocated(By.css('[data-testid="content-error"]')),
        5000
      );
      expect(await contentError.isDisplayed()).toBe(true);

      const categoryError = await driver.wait(
        until.elementLocated(By.css('[data-testid="category-error"]')),
        5000
      );
      expect(await categoryError.isDisplayed()).toBe(true);
    });

    it('should show validation error for title that is too short', async () => {
      await global.testUtils.navigateTo('/create-blog');

      // Enter a very short title
      await driver.findElement(By.css('[data-testid="title-input"]')).sendKeys('Hi');
      await driver.findElement(By.css('[data-testid="content-textarea"]')).sendKeys('Valid content here');
      
      // Select category
      const categorySelect = await driver.findElement(By.css('[data-testid="category-select"]'));
      await categorySelect.click();
      await driver.findElement(By.css('[data-testid="category-option-technology"]')).click();

      // Submit form
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Check for title length error
      const titleError = await driver.wait(
        until.elementLocated(By.css('[data-testid="title-error"]')),
        5000
      );
      expect(await titleError.isDisplayed()).toBe(true);
      expect(await titleError.getText()).toContain('at least');
    });
  });

  describe('Blog Viewing', () => {
    let createdBlog;

    beforeEach(async () => {
      // Create a test blog post
      createdBlog = {
        title: 'Test Blog for Viewing',
        content: 'This is a detailed blog post content for testing the view functionality. It contains multiple sentences and paragraphs.',
        category: 'Technology'
      };

      await global.testUtils.navigateTo('/create-blog');
      await driver.findElement(By.css('[data-testid="title-input"]')).sendKeys(createdBlog.title);
      await driver.findElement(By.css('[data-testid="content-textarea"]')).sendKeys(createdBlog.content);
      
      const categorySelect = await driver.findElement(By.css('[data-testid="category-select"]'));
      await categorySelect.click();
      await driver.findElement(By.css('[data-testid="category-option-technology"]')).click();
      
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();
      await driver.wait(until.urlContains('/'), 15000);
    });

    it('should view full blog post when clicking on blog card', async () => {
      // Find and click on the blog card
      const blogCard = await driver.findElement(
        By.xpath(`//*[contains(text(), '${createdBlog.title}')]`)
      );
      await blogCard.click();

      // Wait for navigation to blog detail page
      await driver.wait(until.urlContains('/blog/'), 10000);

      // Verify full blog content is displayed
      const fullTitle = await driver.wait(
        until.elementLocated(By.css('[data-testid="blog-title"]')),
        10000
      );
      expect(await fullTitle.getText()).toBe(createdBlog.title);

      const fullContent = await driver.findElement(By.css('[data-testid="blog-content"]'));
      expect(await fullContent.getText()).toBe(createdBlog.content);

      const categoryDisplay = await driver.findElement(By.css('[data-testid="blog-category"]'));
      expect(await categoryDisplay.getText()).toContain(createdBlog.category);

      // Verify author information is displayed
      const authorInfo = await driver.findElement(By.css('[data-testid="blog-author"]'));
      expect(await authorInfo.getText()).toContain(testUser.username);

      // Verify creation date is displayed
      const dateInfo = await driver.findElement(By.css('[data-testid="blog-date"]'));
      expect(await dateInfo.isDisplayed()).toBe(true);
    });

    it('should navigate back to home from blog detail page', async () => {
      // Navigate to blog detail
      const blogCard = await driver.findElement(
        By.xpath(`//*[contains(text(), '${createdBlog.title}')]`)
      );
      await blogCard.click();
      await driver.wait(until.urlContains('/blog/'), 10000);

      // Click back button or home link
      const backButton = await driver.findElement(By.css('[data-testid="back-button"]'));
      await backButton.click();

      // Verify we're back on home page
      await driver.wait(until.urlMatches(/\/$|^\/$/), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl.endsWith('/')).toBe(true);
    });
  });

  describe('Blog Editing', () => {
    let createdBlog;

    beforeEach(async () => {
      // Create a test blog post
      createdBlog = {
        title: 'Original Blog Title',
        content: 'Original blog content that will be edited.',
        category: 'Technology'
      };

      await global.testUtils.navigateTo('/create-blog');
      await driver.findElement(By.css('[data-testid="title-input"]')).sendKeys(createdBlog.title);
      await driver.findElement(By.css('[data-testid="content-textarea"]')).sendKeys(createdBlog.content);
      
      const categorySelect = await driver.findElement(By.css('[data-testid="category-select"]'));
      await categorySelect.click();
      await driver.findElement(By.css('[data-testid="category-option-technology"]')).click();
      
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();
      await driver.wait(until.urlContains('/'), 15000);
    });

    it('should edit blog post successfully', async () => {
      // Navigate to dashboard to find edit option
      await global.testUtils.navigateTo('/dashboard');

      // Find the blog post in user's blog list
      const editButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="edit-blog-button"]')),
        10000
      );
      await editButton.click();

      // Wait for edit page to load
      await driver.wait(until.urlContains('/edit'), 10000);

      // Verify form is pre-filled with existing data
      const titleInput = await driver.findElement(By.css('[data-testid="title-input"]'));
      expect(await titleInput.getAttribute('value')).toBe(createdBlog.title);

      const contentTextarea = await driver.findElement(By.css('[data-testid="content-textarea"]'));
      expect(await contentTextarea.getAttribute('value')).toBe(createdBlog.content);

      // Edit the blog post
      const updatedData = {
        title: 'Updated Blog Title',
        content: 'Updated blog content with new information.',
        category: 'Lifestyle'
      };

      await titleInput.clear();
      await titleInput.sendKeys(updatedData.title);
      
      await contentTextarea.clear();
      await contentTextarea.sendKeys(updatedData.content);
      
      // Change category
      const categorySelect = await driver.findElement(By.css('[data-testid="category-select"]'));
      await categorySelect.click();
      await driver.findElement(By.css('[data-testid="category-option-lifestyle"]')).click();

      // Submit the updated form
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();

      // Wait for successful update and redirect
      await driver.wait(until.urlContains('/'), 15000);

      // Verify the updated blog post appears on home page
      const updatedBlogCard = await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(), '${updatedData.title}')]`)),
        10000
      );
      expect(await updatedBlogCard.isDisplayed()).toBe(true);

      // Verify updated content preview
      const updatedContentPreview = await driver.findElement(
        By.xpath(`//*[contains(text(), '${updatedData.content.substring(0, 30)}')]`)
      );
      expect(await updatedContentPreview.isDisplayed()).toBe(true);
    });

    it('should not allow editing other users blogs', async () => {
      // Logout current user
      await global.testUtils.logout();

      // Create and login as different user
      const otherUser = await global.testUtils.createTestUser();

      // Try to access edit page for the original blog (would need blog ID)
      // This test assumes the edit URL includes blog ID
      await global.testUtils.navigateTo('/dashboard');

      // Verify the original blog is not in this user's dashboard
      const blogElements = await driver.findElements(
        By.xpath(`//*[contains(text(), '${createdBlog.title}')]`)
      );
      expect(blogElements.length).toBe(0);
    });
  });

  describe('Blog Deletion', () => {
    let createdBlog;

    beforeEach(async () => {
      // Create a test blog post
      createdBlog = {
        title: 'Blog to be Deleted',
        content: 'This blog post will be deleted in the test.',
        category: 'Technology'
      };

      await global.testUtils.navigateTo('/create-blog');
      await driver.findElement(By.css('[data-testid="title-input"]')).sendKeys(createdBlog.title);
      await driver.findElement(By.css('[data-testid="content-textarea"]')).sendKeys(createdBlog.content);
      
      const categorySelect = await driver.findElement(By.css('[data-testid="category-select"]'));
      await categorySelect.click();
      await driver.findElement(By.css('[data-testid="category-option-technology"]')).click();
      
      await driver.findElement(By.css('[data-testid="submit-button"]')).click();
      await driver.wait(until.urlContains('/'), 15000);
    });

    it('should delete blog post successfully', async () => {
      // Navigate to dashboard
      await global.testUtils.navigateTo('/dashboard');

      // Find and click delete button
      const deleteButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="delete-blog-button"]')),
        10000
      );
      await deleteButton.click();

      // Handle confirmation dialog
      const confirmButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="confirm-delete-button"]')),
        5000
      );
      await confirmButton.click();

      // Wait for deletion to complete
      await driver.sleep(2000);

      // Verify blog is removed from dashboard
      const blogElements = await driver.findElements(
        By.xpath(`//*[contains(text(), '${createdBlog.title}')]`)
      );
      expect(blogElements.length).toBe(0);

      // Navigate to home page and verify blog is not there
      await global.testUtils.navigateTo('/');
      const homeBlogElements = await driver.findElements(
        By.xpath(`//*[contains(text(), '${createdBlog.title}')]`)
      );
      expect(homeBlogElements.length).toBe(0);
    });

    it('should cancel blog deletion when clicking cancel', async () => {
      // Navigate to dashboard
      await global.testUtils.navigateTo('/dashboard');

      // Find and click delete button
      const deleteButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="delete-blog-button"]')),
        10000
      );
      await deleteButton.click();

      // Handle confirmation dialog - click cancel
      const cancelButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="cancel-delete-button"]')),
        5000
      );
      await cancelButton.click();

      // Verify blog is still in dashboard
      const blogElement = await driver.findElement(
        By.xpath(`//*[contains(text(), '${createdBlog.title}')]`)
      );
      expect(await blogElement.isDisplayed()).toBe(true);
    });
  });

  describe('Blog Search and Filtering', () => {
    beforeEach(async () => {
      // Create multiple test blog posts with different categories
      const testBlogs = [
        { title: 'React Tutorial', content: 'Learn React basics', category: 'Technology' },
        { title: 'Cooking Tips', content: 'Best cooking practices', category: 'Lifestyle' },
        { title: 'Travel Guide', content: 'Amazing travel destinations', category: 'Travel' },
        { title: 'JavaScript Guide', content: 'Advanced JavaScript concepts', category: 'Technology' }
      ];

      for (const blog of testBlogs) {
        await global.testUtils.navigateTo('/create-blog');
        await driver.findElement(By.css('[data-testid="title-input"]')).sendKeys(blog.title);
        await driver.findElement(By.css('[data-testid="content-textarea"]')).sendKeys(blog.content);
        
        const categorySelect = await driver.findElement(By.css('[data-testid="category-select"]'));
        await categorySelect.click();
        await driver.findElement(By.css(`[data-testid="category-option-${blog.category.toLowerCase()}"]`)).click();
        
        await driver.findElement(By.css('[data-testid="submit-button"]')).click();
        await driver.wait(until.urlContains('/'), 15000);
      }
    });

    it('should search blogs by title', async () => {
      await global.testUtils.navigateTo('/');

      // Search for 'React'
      const searchInput = await driver.findElement(By.css('[data-testid="search-input"]'));
      await searchInput.sendKeys('React');

      // Wait for search results
      await driver.sleep(1000);

      // Verify React tutorial appears
      const reactBlog = await driver.findElement(
        By.xpath('//*[contains(text(), "React Tutorial")]')
      );
      expect(await reactBlog.isDisplayed()).toBe(true);

      // Verify other blogs are filtered out
      const cookingBlogs = await driver.findElements(
        By.xpath('//*[contains(text(), "Cooking Tips")]')
      );
      expect(cookingBlogs.length).toBe(0);
    });

    it('should filter blogs by category', async () => {
      await global.testUtils.navigateTo('/');

      // Filter by Technology category
      const categoryFilter = await driver.findElement(By.css('[data-testid="category-filter"]'));
      await categoryFilter.click();
      await driver.findElement(By.css('[data-testid="filter-technology"]')).click();

      // Wait for filter to apply
      await driver.sleep(1000);

      // Verify only Technology blogs appear
      const reactBlog = await driver.findElement(
        By.xpath('//*[contains(text(), "React Tutorial")]')
      );
      expect(await reactBlog.isDisplayed()).toBe(true);

      const jsBlog = await driver.findElement(
        By.xpath('//*[contains(text(), "JavaScript Guide")]')
      );
      expect(await jsBlog.isDisplayed()).toBe(true);

      // Verify non-Technology blogs are filtered out
      const cookingBlogs = await driver.findElements(
        By.xpath('//*[contains(text(), "Cooking Tips")]')
      );
      expect(cookingBlogs.length).toBe(0);
    });

    it('should clear search and show all blogs', async () => {
      await global.testUtils.navigateTo('/');

      // Search for something specific
      const searchInput = await driver.findElement(By.css('[data-testid="search-input"]'));
      await searchInput.sendKeys('React');
      await driver.sleep(1000);

      // Clear search
      await searchInput.clear();
      await driver.sleep(1000);

      // Verify all blogs are shown again
      const allBlogTitles = ['React Tutorial', 'Cooking Tips', 'Travel Guide', 'JavaScript Guide'];
      
      for (const title of allBlogTitles) {
        const blogElement = await driver.findElement(
          By.xpath(`//*[contains(text(), "${title}")]`)
        );
        expect(await blogElement.isDisplayed()).toBe(true);
      }
    });
  });
});