import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './visual-tests',
  timeout: 30 * 1000, // Reduced timeout for faster CI execution
  expect: {
    timeout: 8000,
    // Visual comparison settings
    toHaveScreenshot: {
      // Maximum difference in pixels
      maxDiffPixels: 100,
      // Threshold between 0-1. Default is 0.2
      threshold: 0.2,
      // Animation handling
      animations: 'disabled',
      // Style elements to mask
      stylePath: './visual-tests/screenshot.css',
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for speed
  workers: process.env.CI ? 2 : 4, // Use 2 workers in CI for speed
  reporter: [
    ['html', { outputFolder: 'playwright-visual-report' }],
    ['json', { outputFile: 'visual-test-results.json' }],
    // Add custom reporter for CI diff reports
    ...(process.env.CI ? [['github']] : []),
  ] as any,

  use: {
    actionTimeout: 0,
    baseURL: process.env.CI ? 'http://localhost:3333' : 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    // Visual regression specific settings
    ignoreHTTPSErrors: true,
    // Ensure consistent rendering
    deviceScaleFactor: 1,
    // Disable animations globally
    launchOptions: {
      args: [
        '--force-device-scale-factor=1',
        '--disable-web-security', // Allow localStorage access
        '--allow-file-access-from-files',
        '--disable-features=VizDisplayCompositor',
      ],
    },
    // Add browser context options for better localStorage support
    contextOptions: {
      // Bypass CSP for testing
      bypassCSP: true,
    },
  },

  // Screenshot storage configuration
  snapshotDir: './visual-tests/screenshots',
  snapshotPathTemplate:
    '{snapshotDir}/{testFileDir}/{testFileName}-{projectName}/{arg}-{platform}{ext}',

  // Cross-browser and device projects
  projects: process.env.CI
    ? [
        // Minimal set for CI speed
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1920, height: 1080 },
          },
        },
      ]
    : [
        // Full set for local development
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1920, height: 1080 },
          },
        },
        {
          name: 'firefox',
          use: {
            ...devices['Desktop Firefox'],
            viewport: { width: 1920, height: 1080 },
          },
        },
        {
          name: 'webkit',
          use: {
            ...devices['Desktop Safari'],
            viewport: { width: 1920, height: 1080 },
          },
        },
        {
          name: 'iPad',
          use: {
            ...devices['iPad Pro'],
            viewport: { width: 1024, height: 1366 },
          },
        },
        {
          name: 'Mobile Chrome',
          use: {
            ...devices['Pixel 5'],
            viewport: { width: 393, height: 851 },
          },
        },
        {
          name: 'Mobile Safari',
          use: {
            ...devices['iPhone 14'],
            viewport: { width: 390, height: 844 },
          },
        },
        {
          name: 'chromium-dark',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1920, height: 1080 },
            colorScheme: 'dark',
          },
        },
        {
          name: 'mobile-dark',
          use: {
            ...devices['iPhone 14'],
            viewport: { width: 390, height: 844 },
            colorScheme: 'dark',
          },
        },
      ],

  // Web server configuration
  webServer: {
    command: process.env.CI
      ? 'NEXT_PUBLIC_USE_MOCK_PURCHASE=true npm run build && NEXT_PUBLIC_USE_MOCK_PURCHASE=true npm run start'
      : 'NEXT_PUBLIC_USE_MOCK_PURCHASE=true npm run dev',
    port: process.env.CI ? 3333 : 3000,
    reuseExistingServer: !process.env.CI,
    // Wait for server to be ready
    timeout: 180 * 1000, // 3 minutes for build + start in CI
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NEXT_PUBLIC_USE_MOCK_PURCHASE: 'true',
      NODE_ENV: process.env.CI ? 'test' : 'development',
      CI: process.env.CI || 'false',
      SKIP_ENV_VALIDATION: 'true',
      SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING: '1',
      ...(process.env.CI && {
        DATABASE_URL:
          'postgresql://postgres:postgres@localhost:5432/anthrasite_test',
      }),
    },
  },
})
