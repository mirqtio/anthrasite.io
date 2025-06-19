import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 45 * 1000, // Increased from 30s to 45s
  expect: {
    timeout: 10000, // Increased from 5s to 10s for more reliable element waiting
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Allow retries locally too for flaky tests
  workers: process.env.CI ? 2 : undefined, // Increased CI workers from 1 to 2 for better performance
  reporter: 'html',
  use: {
    actionTimeout: 10000, // Set action timeout to 10s instead of unlimited
    navigationTimeout: 15000, // Set navigation timeout to 15s
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
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
    env: {
      NEXT_PUBLIC_USE_MOCK_PURCHASE: 'true',
      NODE_ENV: 'development',
      // Flag to indicate E2E test environment
      E2E_TESTING: 'true',
      // Database for tests
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
