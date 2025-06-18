import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './visual-tests',
  timeout: 60 * 1000, // Increased timeout for visual tests
  expect: {
    timeout: 10000,
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
    }
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['html', { outputFolder: 'playwright-visual-report' }],
    ['json', { outputFile: 'visual-test-results.json' }],
    // Add custom reporter for CI diff reports
    ...(process.env.CI ? [['github']] : []),
  ] as any,
  
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
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
      args: ['--force-device-scale-factor=1'],
    },
  },

  // Screenshot storage configuration
  snapshotDir: './visual-tests/screenshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{projectName}/{arg}-{platform}{ext}',

  // Cross-browser and device projects
  projects: [
    // Desktop browsers
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
    
    // Tablet viewports
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },
    
    // Mobile devices
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
    
    // Dark mode variants
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
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    // Wait for server to be ready
    timeout: 120 * 1000,
  },
})