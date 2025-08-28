#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Project paths
const projectRoot = path.resolve(__dirname, '..');
const backendPath = path.join(projectRoot, 'backend');
const frontendPath = path.join(projectRoot, 'frontend');
const e2ePath = path.join(projectRoot, 'e2e');
const reportsPath = path.join(projectRoot, 'coverage-reports');

// Ensure reports directory exists
if (!fs.existsSync(reportsPath)) {
  fs.mkdirSync(reportsPath, { recursive: true });
}

// Function to run command and return promise
function runCommand(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    log.info(`Running ${name} tests...`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        log.success(`${name} tests completed successfully`);
        resolve();
      } else {
        log.error(`${name} tests failed with exit code ${code}`);
        reject(new Error(`${name} tests failed`));
      }
    });
    
    process.on('error', (error) => {
      log.error(`Failed to start ${name} tests: ${error.message}`);
      reject(error);
    });
  });
}

// Function to copy coverage reports
function copyCoverageReport(source, destination, name) {
  try {
    if (fs.existsSync(source)) {
      const destDir = path.join(reportsPath, name);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy HTML report
      const htmlSource = path.join(source, 'lcov-report');
      const htmlDest = path.join(destDir, 'html');
      
      if (fs.existsSync(htmlSource)) {
        fs.cpSync(htmlSource, htmlDest, { recursive: true });
        log.success(`${name} HTML coverage report copied to ${htmlDest}`);
      }
      
      // Copy LCOV file
      const lcovSource = path.join(source, 'lcov.info');
      const lcovDest = path.join(destDir, 'lcov.info');
      
      if (fs.existsSync(lcovSource)) {
        fs.copyFileSync(lcovSource, lcovDest);
        log.success(`${name} LCOV report copied to ${lcovDest}`);
      }
      
      // Copy JSON summary
      const jsonSource = path.join(source, 'coverage-summary.json');
      const jsonDest = path.join(destDir, 'coverage-summary.json');
      
      if (fs.existsSync(jsonSource)) {
        fs.copyFileSync(jsonSource, jsonDest);
        log.success(`${name} JSON summary copied to ${jsonDest}`);
      }
    } else {
      log.warning(`${name} coverage report not found at ${source}`);
    }
  } catch (error) {
    log.error(`Failed to copy ${name} coverage report: ${error.message}`);
  }
}

// Function to generate combined coverage summary
function generateCombinedSummary() {
  try {
    const backendSummaryPath = path.join(reportsPath, 'backend', 'coverage-summary.json');
    const frontendSummaryPath = path.join(reportsPath, 'frontend', 'coverage-summary.json');
    
    let combinedSummary = {
      timestamp: new Date().toISOString(),
      backend: null,
      frontend: null,
      combined: {
        lines: { total: 0, covered: 0, pct: 0 },
        functions: { total: 0, covered: 0, pct: 0 },
        statements: { total: 0, covered: 0, pct: 0 },
        branches: { total: 0, covered: 0, pct: 0 }
      }
    };
    
    // Load backend summary
    if (fs.existsSync(backendSummaryPath)) {
      const backendSummary = JSON.parse(fs.readFileSync(backendSummaryPath, 'utf8'));
      combinedSummary.backend = backendSummary.total;
      
      // Add to combined totals
      Object.keys(combinedSummary.combined).forEach(key => {
        if (backendSummary.total[key]) {
          combinedSummary.combined[key].total += backendSummary.total[key].total || 0;
          combinedSummary.combined[key].covered += backendSummary.total[key].covered || 0;
        }
      });
    }
    
    // Load frontend summary
    if (fs.existsSync(frontendSummaryPath)) {
      const frontendSummary = JSON.parse(fs.readFileSync(frontendSummaryPath, 'utf8'));
      combinedSummary.frontend = frontendSummary.total;
      
      // Add to combined totals
      Object.keys(combinedSummary.combined).forEach(key => {
        if (frontendSummary.total[key]) {
          combinedSummary.combined[key].total += frontendSummary.total[key].total || 0;
          combinedSummary.combined[key].covered += frontendSummary.total[key].covered || 0;
        }
      });
    }
    
    // Calculate combined percentages
    Object.keys(combinedSummary.combined).forEach(key => {
      const { total, covered } = combinedSummary.combined[key];
      combinedSummary.combined[key].pct = total > 0 ? Math.round((covered / total) * 100 * 100) / 100 : 0;
    });
    
    // Save combined summary
    const combinedSummaryPath = path.join(reportsPath, 'combined-summary.json');
    fs.writeFileSync(combinedSummaryPath, JSON.stringify(combinedSummary, null, 2));
    
    log.success(`Combined coverage summary saved to ${combinedSummaryPath}`);
    
    // Display summary
    log.header('📊 COVERAGE SUMMARY');
    
    if (combinedSummary.backend) {
      console.log(`${colors.bright}Backend Coverage:${colors.reset}`);
      console.log(`  Lines: ${combinedSummary.backend.lines.pct}%`);
      console.log(`  Functions: ${combinedSummary.backend.functions.pct}%`);
      console.log(`  Statements: ${combinedSummary.backend.statements.pct}%`);
      console.log(`  Branches: ${combinedSummary.backend.branches.pct}%\n`);
    }
    
    if (combinedSummary.frontend) {
      console.log(`${colors.bright}Frontend Coverage:${colors.reset}`);
      console.log(`  Lines: ${combinedSummary.frontend.lines.pct}%`);
      console.log(`  Functions: ${combinedSummary.frontend.functions.pct}%`);
      console.log(`  Statements: ${combinedSummary.frontend.statements.pct}%`);
      console.log(`  Branches: ${combinedSummary.frontend.branches.pct}%\n`);
    }
    
    console.log(`${colors.bright}Combined Coverage:${colors.reset}`);
    console.log(`  Lines: ${combinedSummary.combined.lines.pct}%`);
    console.log(`  Functions: ${combinedSummary.combined.functions.pct}%`);
    console.log(`  Statements: ${combinedSummary.combined.statements.pct}%`);
    console.log(`  Branches: ${combinedSummary.combined.branches.pct}%\n`);
    
  } catch (error) {
    log.error(`Failed to generate combined summary: ${error.message}`);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const runBackend = !args.includes('--frontend-only');
  const runFrontend = !args.includes('--backend-only');
  const runE2E = args.includes('--e2e');
  
  log.header('🧪 RUNNING TEST COVERAGE ANALYSIS');
  
  try {
    // Clean previous reports
    if (fs.existsSync(reportsPath)) {
      fs.rmSync(reportsPath, { recursive: true, force: true });
    }
    fs.mkdirSync(reportsPath, { recursive: true });
    
    // Run backend tests
    if (runBackend) {
      log.header('🔧 Backend Tests');
      await runCommand('npm', ['test', '--', '--coverage', '--watchAll=false'], backendPath, 'Backend');
      copyCoverageReport(path.join(backendPath, 'coverage'), reportsPath, 'backend');
    }
    
    // Run frontend tests
    if (runFrontend) {
      log.header('⚛️ Frontend Tests');
      await runCommand('npm', ['run', 'test:coverage'], frontendPath, 'Frontend');
      copyCoverageReport(path.join(frontendPath, 'coverage'), reportsPath, 'frontend');
    }
    
    // Run E2E tests (optional)
    if (runE2E) {
      log.header('🌐 End-to-End Tests');
      await runCommand('npm', ['test'], e2ePath, 'E2E');
    }
    
    // Generate combined summary
    generateCombinedSummary();
    
    log.header('🎉 TEST COVERAGE ANALYSIS COMPLETE');
    log.info(`Reports available in: ${reportsPath}`);
    log.info(`Backend HTML report: ${path.join(reportsPath, 'backend', 'html', 'index.html')}`);
    log.info(`Frontend HTML report: ${path.join(reportsPath, 'frontend', 'html', 'index.html')}`);
    log.info(`Combined summary: ${path.join(reportsPath, 'combined-summary.json')}`);
    
  } catch (error) {
    log.error(`Test coverage analysis failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  main().catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, runCommand, copyCoverageReport, generateCombinedSummary };