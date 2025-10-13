import { defineConfig, devices } from '@playwright/test'

// Tests to exclude (incomplete/debug tests)
// IMPORTANT: Project-level testIgnore REPLACES (not extends) top-level config
// Must combine all patterns at project level for proper exclusion
const EXCLUDED_TESTS = [
  /.*waitlist-functional\.spec\.ts$/,
  /.*purchase-payment-element\.spec\.ts$/,
  /.*journeys\.spec\.ts$/,
  /.*\/_debug\/.*\.spec\.ts$/,
  /.*waitlist\.spec\.ts$/, // Did NOT run in local baseline run 5438b418d431bae7
]

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:3333',
    trace: 'retain-on-failure',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium-desktop',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox-desktop',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        // Firefox needs more time for certain operations
        navigationTimeout: 20_000,
      },
      expect: { timeout: 7_000 },
    },
    {
      name: 'webkit-desktop',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'chromium-mobile',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'webkit-mobile',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],
})
