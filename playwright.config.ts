import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000, // Increased to 60s for CI stability
  expect: {
    timeout: 15000, // Increased to 15s for reliable element waiting in CI
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1, // Increased retries to 3 for CI environment
  workers: process.env.CI ? 1 : undefined, // Reduced back to 1 worker for CI stability
  reporter: 'html',
  use: {
    actionTimeout: 15000, // Increased to 15s for CI reliability
    navigationTimeout: 30000, // Increased to 30s for CI page loading
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'NEXT_PUBLIC_USE_MOCK_PURCHASE=true npm run dev',
    port: 3333,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for server startup
    env: {
      NEXT_PUBLIC_USE_MOCK_PURCHASE: 'true',
      NODE_ENV: 'development',
      // Flag to indicate E2E test environment
      E2E_TESTING: 'true',
      // Database for tests - prioritize CI environment variable
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/anthrasite_test',
      // Analytics for consent tests
      NEXT_PUBLIC_GA4_MEASUREMENT_ID:
        process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-TEST123456',
      GA4_API_SECRET: process.env.GA4_API_SECRET || 'test-secret',
      NEXT_PUBLIC_POSTHOG_KEY:
        process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_test_key',
      NEXT_PUBLIC_POSTHOG_HOST:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      // Edge Config fallback
      EDGE_CONFIG: process.env.EDGE_CONFIG || '',
    },
  },
})
