module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  testTimeout: 60000,
  verbose: true,
  maxWorkers: 1, // Run E2E tests sequentially
  forceExit: true,
  detectOpenHandles: true
};