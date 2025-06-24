#!/usr/bin/env node

/**
 * Vercel Deployment Health Check Script
 * 
 * This script can be run locally or in CI to verify deployment health
 * and catch common issues before they reach production.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runChecks() {
  log('\n🔍 Vercel Deployment Pre-Check\n', colors.blue);

  const checks = {
    passed: [],
    warnings: [],
    failed: [],
  };

  // 1. Check TypeScript compilation
  log('1. Checking TypeScript compilation...');
  const tscResult = runCommand('npx tsc --noEmit', true);
  if (tscResult.success) {
    checks.passed.push('✅ TypeScript compilation successful');
  } else {
    checks.failed.push('❌ TypeScript compilation failed');
    log(tscResult.error, colors.red);
  }

  // 2. Check for required environment variables
  log('\n2. Checking environment variables...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_GA4_MEASUREMENT_ID',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_SENTRY_DSN',
  ];

  const envExample = checkFileExists('.env.local.example');
  if (envExample) {
    checks.passed.push('✅ Environment example file exists');
  } else {
    checks.warnings.push('⚠️  Missing .env.local.example file');
  }

  // 3. Check for build script
  log('\n3. Checking build configuration...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts?.build) {
    checks.passed.push('✅ Build script configured');
  } else {
    checks.failed.push('❌ No build script in package.json');
  }

  // 4. Check for common build issues
  log('\n4. Checking for common issues...');
  
  // Check for duplicate type declarations
  const hasGlobalTypes = checkFileExists('types/global.d.ts');
  if (hasGlobalTypes) {
    const globalTypes = fs.readFileSync('types/global.d.ts', 'utf8');
    const windowDeclarations = (globalTypes.match(/interface Window/g) || []).length;
    if (windowDeclarations > 1) {
      checks.warnings.push('⚠️  Multiple Window interface declarations detected');
    }
  }

  // Check for test files that shouldn't be in production
  const testPages = [
    'app/test-consent',
    'app/test-hotjar',
    'app/test-analytics',
    'app/test-monitoring',
  ];
  
  const foundTestPages = testPages.filter(checkFileExists);
  if (foundTestPages.length > 0) {
    checks.warnings.push(`⚠️  Test pages found: ${foundTestPages.join(', ')}`);
  }

  // 5. Run a test build
  log('\n5. Running test build...');
  const buildResult = runCommand('npm run build', true);
  if (buildResult.success) {
    checks.passed.push('✅ Build completed successfully');
  } else {
    checks.failed.push('❌ Build failed');
    // Extract error details
    const errorMatch = buildResult.error.match(/Type error: (.+)/);
    if (errorMatch) {
      log(`   Error: ${errorMatch[1]}`, colors.red);
    }
  }

  // 6. Check for Vercel configuration
  log('\n6. Checking Vercel configuration...');
  const hasVercelJson = checkFileExists('vercel.json');
  if (hasVercelJson) {
    checks.passed.push('✅ vercel.json configuration found');
  } else {
    checks.warnings.push('⚠️  No vercel.json file (using defaults)');
  }

  // Summary
  log('\n📊 Summary\n', colors.blue);
  
  if (checks.passed.length > 0) {
    log('Passed:', colors.green);
    checks.passed.forEach(check => log(`  ${check}`, colors.green));
  }
  
  if (checks.warnings.length > 0) {
    log('\nWarnings:', colors.yellow);
    checks.warnings.forEach(check => log(`  ${check}`, colors.yellow));
  }
  
  if (checks.failed.length > 0) {
    log('\nFailed:', colors.red);
    checks.failed.forEach(check => log(`  ${check}`, colors.red));
  }

  // Exit code
  const exitCode = checks.failed.length > 0 ? 1 : 0;
  
  log(`\n${exitCode === 0 ? '✅ Ready for deployment' : '❌ Fix issues before deploying'}\n`, 
    exitCode === 0 ? colors.green : colors.red);
  
  process.exit(exitCode);
}

// Run checks
runChecks().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});