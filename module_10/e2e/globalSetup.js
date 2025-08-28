const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

// Global setup for E2E tests
module.exports = async () => {
  console.log('🚀 Starting E2E test environment setup...');
  
  const projectRoot = path.resolve(__dirname, '..');
  const backendPath = path.join(projectRoot, 'backend');
  const frontendPath = path.join(projectRoot, 'frontend');
  
  // Function to wait for server to be ready
  const waitForServer = async (url, timeout = 30000) => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        await axios.get(url);
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`Server at ${url} did not start within ${timeout}ms`);
  };
  
  try {
    // Start backend server
    console.log('📦 Starting backend server...');
    const backendProcess = spawn('npm', ['start'], {
      cwd: backendPath,
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: '5000'
      }
    });
    
    // Store process reference for cleanup
    global.__BACKEND_PROCESS__ = backendProcess;
    
    // Handle backend process output
    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data.toString().trim()}`);
    });
    
    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data.toString().trim()}`);
    });
    
    // Wait for backend to be ready
    await waitForServer('http://localhost:5000/api/health');
    console.log('✅ Backend server is ready');
    
    // Start frontend server
    console.log('🎨 Starting frontend server...');
    const frontendProcess = spawn('npm', ['start'], {
      cwd: frontendPath,
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        PORT: '3000',
        BROWSER: 'none'
      }
    });
    
    // Store process reference for cleanup
    global.__FRONTEND_PROCESS__ = frontendProcess;
    
    // Handle frontend process output
    frontendProcess.stdout.on('data', (data) => {
      console.log(`Frontend: ${data.toString().trim()}`);
    });
    
    frontendProcess.stderr.on('data', (data) => {
      console.error(`Frontend Error: ${data.toString().trim()}`);
    });
    
    // Wait for frontend to be ready
    await waitForServer('http://localhost:3000');
    console.log('✅ Frontend server is ready');
    
    console.log('🎉 E2E test environment setup complete!');
    console.log('Backend: http://localhost:5000');
    console.log('Frontend: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Failed to setup E2E test environment:', error.message);
    
    // Cleanup on failure
    if (global.__BACKEND_PROCESS__) {
      global.__BACKEND_PROCESS__.kill('SIGTERM');
    }
    if (global.__FRONTEND_PROCESS__) {
      global.__FRONTEND_PROCESS__.kill('SIGTERM');
    }
    
    throw error;
  }
};