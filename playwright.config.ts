import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000, // 45s - reasonable for most tests, forces optimization
  expect: {
    timeout: 5_000, // 5s - tight expectations force stable selectors
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // No retries locally - fix flakes, don't hide them
  workers: process.env.CI ? 6 : 8, // 8 workers locally for speed, 6 in CI for stability
  reporter: 'html',
  globalSetup: require.resolve('./e2e/_setup/global-setup'),
  globalTeardown: require.resolve('./e2e/_setup/global-teardown'),
  use: {
    actionTimeout: 10_000, // 10s action timeout
    navigationTimeout: 15_000, // 15s navigation timeout
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
      // Flag to indicate E2E test environment (NEXT_PUBLIC_ makes it available in client components)
      E2E_TESTING: 'true',
      NEXT_PUBLIC_E2E_TESTING: 'true',
      // Database for tests - prioritize CI environment variable
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:devpass@localhost:5432/anthrasite_test',
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
      // Admin API key for test UTM generation
      ADMIN_API_KEY:
        process.env.ADMIN_API_KEY || 'test-admin-key-local-only',
      // Base URL for tests (matches baseURL config above)
      BASE_URL: process.env.BASE_URL || 'http://localhost:3333',
    },
  },
})
