// Jest setup for backend tests
// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/module10_test';
process.env.JWT_SECRET = 'test-secret-key';

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Set timeout for tests
jest.setTimeout(30000);