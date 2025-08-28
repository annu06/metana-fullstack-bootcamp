# Blog Application with Comprehensive Testing

A full-stack blog application built with Node.js/Express backend and React frontend, featuring comprehensive testing strategies including unit tests, integration tests, and end-to-end tests.

## 🏗️ Project Structure

```
blog-app/
├── backend/                 # Node.js/Express API server
│   ├── src/                # Source code
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── tests/              # Backend tests
│   ├── jest.config.js      # Jest configuration
│   └── package.json        # Backend dependencies
├── frontend/               # React application
│   ├── src/                # React components and pages
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── coverage/           # Frontend test coverage
├── e2e/                    # End-to-end tests
│   ├── tests/              # E2E test suites
│   ├── setup.js            # Selenium WebDriver setup
│   ├── jest.config.js      # E2E Jest configuration
│   └── package.json        # E2E dependencies
├── scripts/                # Testing and utility scripts
│   ├── test-coverage.js    # Coverage reporting script
│   └── package.json        # Scripts dependencies
└── coverage-reports/       # Combined coverage reports
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Chrome browser (for E2E tests)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install E2E test dependencies**
   ```bash
   cd ../e2e
   npm install
   ```

5. **Install scripts dependencies**
   ```bash
   cd ../scripts
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on `http://localhost:3000`

## 🧪 Testing Strategy

This project implements a comprehensive testing strategy with multiple layers:

### 1. Unit Tests
- **Backend**: Test individual functions, middleware, and utilities
- **Frontend**: Test React components in isolation
- **Tools**: Jest, React Testing Library
- **Coverage**: 80%+ for critical components

### 2. Integration Tests
- **Backend**: Test API endpoints with mocked database
- **Frontend**: Test component interactions and data flow
- **Tools**: Supertest, MSW (Mock Service Worker)

### 3. End-to-End Tests
- **Full user workflows**: Registration, login, blog creation, navigation
- **Cross-browser testing**: Chrome, Firefox support
- **Tools**: Selenium WebDriver, Jest

## 🔧 Running Tests

### Backend Tests

```bash
# Run all backend tests
cd backend
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.test.js
```

### Frontend Tests

```bash
# Run all frontend tests
cd frontend
npm test

# Run tests with coverage
npm run test:coverage

# Run tests without watch mode
npm test -- --watchAll=false

# Run specific test file
npm test -- Home.test.js
```

### End-to-End Tests

```bash
# Run all E2E tests
cd e2e
npm test

# Run specific E2E test suite
npm test -- --testNamePattern="Authentication"

# Run E2E tests with verbose output
npm test -- --verbose
```

### Combined Coverage Reporting

```bash
# Run all tests and generate combined coverage report
cd scripts
npm run coverage

# Run only backend tests with coverage
npm run coverage:backend

# Run only frontend tests with coverage
npm run coverage:frontend

# Run all tests including E2E
npm run coverage:full
```

## 📊 Test Coverage

### Coverage Thresholds

**Backend:**
- Global: 80% (lines, functions, statements, branches)
- Routes: 85%
- Middleware: 90%

**Frontend:**
- Global: 75%
- Components: 80%
- Pages: 70%
- Context: 85%

### Viewing Coverage Reports

After running tests with coverage:

1. **Backend**: Open `backend/coverage/lcov-report/index.html`
2. **Frontend**: Open `frontend/coverage/lcov-report/index.html`
3. **Combined**: Open `coverage-reports/combined-summary.json`

## 🧩 Test Structure

### Backend Tests (`backend/tests/`)

```
tests/
├── auth.test.js           # Authentication endpoints
├── blogs.test.js          # Blog CRUD operations
├── middleware.test.js     # Custom middleware
├── utils.test.js          # Utility functions
└── setup.js               # Test environment setup
```

**Example Backend Test:**
```javascript
describe('POST /api/auth/login', () => {
  it('should login user with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

### Frontend Tests (`frontend/src/`)

```
src/
├── components/
│   ├── __tests__/
│   │   ├── BlogCard.test.js
│   │   └── LoginForm.test.js
├── pages/
│   ├── __tests__/
│   │   ├── Home.test.js
│   │   └── Dashboard.test.js
├── context/
│   ├── __tests__/
│   │   └── AuthContext.test.js
└── setupTests.js
```

**Example Frontend Test:**
```javascript
test('renders blog card with correct information', () => {
  const mockBlog = {
    id: 1,
    title: 'Test Blog',
    content: 'Test content',
    author: 'Test Author'
  };
  
  render(<BlogCard blog={mockBlog} />);
  
  expect(screen.getByText('Test Blog')).toBeInTheDocument();
  expect(screen.getByText('Test Author')).toBeInTheDocument();
});
```

### End-to-End Tests (`e2e/tests/`)

```
tests/
├── auth.e2e.test.js       # Authentication flows
├── blog.e2e.test.js       # Blog management
└── navigation.e2e.test.js # Navigation and UI
```

**Example E2E Test:**
```javascript
it('should create a new blog post successfully', async () => {
  await global.testUtils.navigateTo('/create-blog');
  
  await driver.findElement(By.css('[data-testid="title-input"]'))
    .sendKeys('Test Blog Post');
  await driver.findElement(By.css('[data-testid="content-textarea"]'))
    .sendKeys('This is test content');
  
  await driver.findElement(By.css('[data-testid="submit-button"]'))
    .click();
  
  const blogCard = await driver.wait(
    until.elementLocated(By.xpath('//*[contains(text(), "Test Blog Post")]')),
    10000
  );
  expect(await blogCard.isDisplayed()).toBe(true);
});
```

## 🛠️ Testing Tools and Libraries

### Backend Testing Stack
- **Jest**: Test framework and assertion library
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory database for testing
- **bcryptjs**: Password hashing for test users
- **jsonwebtoken**: JWT token generation for auth tests

### Frontend Testing Stack
- **Jest**: Test framework
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **MSW (Mock Service Worker)**: API mocking
- **@testing-library/jest-dom**: Custom Jest matchers

### E2E Testing Stack
- **Selenium WebDriver**: Browser automation
- **Jest**: Test framework for E2E tests
- **ChromeDriver**: Chrome browser driver
- **GeckoDriver**: Firefox browser driver

## 🎯 Testing Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Test Data Management
- Use factories or fixtures for consistent test data
- Clean up test data after each test
- Use realistic but minimal test data

### 3. Mocking Strategy
- Mock external dependencies (APIs, databases)
- Use dependency injection for easier testing
- Mock at the appropriate level (unit vs integration)

### 4. Assertions
- Use specific assertions that clearly express intent
- Test both positive and negative cases
- Verify error conditions and edge cases

### 5. Test Maintenance
- Keep tests simple and focused
- Refactor tests when production code changes
- Remove or update obsolete tests

## 🚨 Troubleshooting

### Common Issues

**Backend Tests Failing:**
```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose

# Check for port conflicts
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows
```

**Frontend Tests Failing:**
```bash
# Clear React scripts cache
npm start -- --reset-cache

# Update snapshots
npm test -- --updateSnapshot

# Run tests without watch mode
npm test -- --watchAll=false
```

**E2E Tests Failing:**
```bash
# Update browser drivers
npm update chromedriver geckodriver

# Check if servers are running
curl http://localhost:3000
curl http://localhost:5000/api/health

# Run with headless mode disabled for debugging
# (modify setup.js to set headless: false)
```

### Debug Mode

For debugging E2E tests:
1. Set `headless: false` in `e2e/setup.js`
2. Add `await driver.sleep(5000)` to pause execution
3. Use `await global.testUtils.takeScreenshot('debug')` for visual debugging

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd backend && npm install
        cd ../frontend && npm install
        cd ../e2e && npm install
    
    - name: Run backend tests
      run: cd backend && npm test -- --coverage
    
    - name: Run frontend tests
      run: cd frontend && npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v2
```

## 🤝 Contributing

### Adding New Tests

1. **Backend Tests**: Add to `backend/tests/` following existing patterns
2. **Frontend Tests**: Add to component `__tests__` directories
3. **E2E Tests**: Add to `e2e/tests/` with descriptive test names

### Test Guidelines

- Write tests before implementing features (TDD)
- Ensure new code meets coverage thresholds
- Update tests when modifying existing functionality
- Add integration tests for new API endpoints
- Include E2E tests for new user workflows

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Selenium WebDriver](https://selenium-webdriver.js.org/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MSW Documentation](https://mswjs.io/docs/)

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy Testing! 🎉**

For questions or issues, please open a GitHub issue or contact the development team.