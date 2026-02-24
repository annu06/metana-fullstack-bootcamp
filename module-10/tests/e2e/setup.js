// E2E test setup
const { spawn } = require('child_process');

let serverProcess;
let clientProcess;

// Start backend and frontend servers before running E2E tests
beforeAll(async () => {
  console.log('Starting servers for E2E tests...');
  
  // Start backend server
  serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });

  // Start frontend server
  clientProcess = spawn('npm', ['start'], {
    cwd: './client',
    stdio: 'pipe',
    shell: true
  });

  // Wait for servers to start
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  console.log('Servers started, beginning E2E tests...');
});

// Clean up processes after tests
afterAll(async () => {
  console.log('Cleaning up E2E test servers...');
  
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  
  if (clientProcess) {
    clientProcess.kill('SIGTERM');
  }
  
  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 2000));
});

// Set global timeout for E2E tests
jest.setTimeout(60000);