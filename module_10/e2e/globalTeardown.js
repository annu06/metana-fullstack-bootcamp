// Global teardown for E2E tests
module.exports = async () => {
  console.log('🧹 Starting E2E test environment cleanup...');
  
  try {
    // Function to gracefully kill a process
    const killProcess = (process, name) => {
      return new Promise((resolve) => {
        if (!process) {
          console.log(`⚠️  ${name} process not found`);
          resolve();
          return;
        }
        
        console.log(`🛑 Stopping ${name} server...`);
        
        // Set a timeout for forceful kill
        const forceKillTimeout = setTimeout(() => {
          console.log(`⚡ Force killing ${name} process...`);
          process.kill('SIGKILL');
          resolve();
        }, 5000);
        
        // Handle process exit
        process.on('exit', () => {
          clearTimeout(forceKillTimeout);
          console.log(`✅ ${name} server stopped`);
          resolve();
        });
        
        // Try graceful shutdown first
        process.kill('SIGTERM');
      });
    };
    
    // Stop frontend server
    if (global.__FRONTEND_PROCESS__) {
      await killProcess(global.__FRONTEND_PROCESS__, 'Frontend');
      global.__FRONTEND_PROCESS__ = null;
    }
    
    // Stop backend server
    if (global.__BACKEND_PROCESS__) {
      await killProcess(global.__BACKEND_PROCESS__, 'Backend');
      global.__BACKEND_PROCESS__ = null;
    }
    
    // Additional cleanup for any remaining processes
    if (process.platform === 'win32') {
      // On Windows, kill any remaining node processes on our ports
      const { exec } = require('child_process');
      
      const killPort = (port) => {
        return new Promise((resolve) => {
          exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            if (stdout) {
              const lines = stdout.split('\n');
              lines.forEach(line => {
                const match = line.match(/\s+(\d+)\s*$/);
                if (match) {
                  const pid = match[1];
                  exec(`taskkill /F /PID ${pid}`, () => {
                    console.log(`🔪 Killed process ${pid} on port ${port}`);
                  });
                }
              });
            }
            resolve();
          });
        });
      };
      
      await killPort(3000); // Frontend port
      await killPort(5000); // Backend port
    } else {
      // On Unix-like systems
      const { exec } = require('child_process');
      
      const killPort = (port) => {
        return new Promise((resolve) => {
          exec(`lsof -ti:${port}`, (error, stdout) => {
            if (stdout) {
              const pids = stdout.trim().split('\n');
              pids.forEach(pid => {
                if (pid) {
                  exec(`kill -9 ${pid}`, () => {
                    console.log(`🔪 Killed process ${pid} on port ${port}`);
                  });
                }
              });
            }
            resolve();
          });
        });
      };
      
      await killPort(3000); // Frontend port
      await killPort(5000); // Backend port
    }
    
    // Wait a bit for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ E2E test environment cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error during E2E test environment cleanup:', error.message);
    
    // Force exit if cleanup fails
    process.exit(1);
  }
};