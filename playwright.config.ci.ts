import { defineConfig, devices } from '@playwright/test'
import base from './playwright.config'

/**
 * CI-specific Playwright configuration
 * Extends base config with settings optimized for GitHub Actions
 *
 * Conservative settings for reliability:
 * - 6 workers (vs 8 locally)
 * - 1 retry (vs 0 locally)
 * - Chromium only (vs 5 browsers locally)
 * - Longer timeouts for cold starts
 */

// Tests to exclude from main browser projects (incomplete/debug/consent tests)
// IMPORTANT: Project-level testIgnore REPLACES (not extends) top-level config
// Must combine all patterns at project level for proper exclusion
const EXCLUDED_TESTS = [
  /.*waitlist-functional\.spec\.ts$/,
  /.*purchase-payment-element\.spec\.ts$/,
  /.*journeys\.spec\.ts$/,
  /.*\/_debug\/.*\.spec\.ts$/,
  /.*waitlist\.spec\.ts$/, // Did NOT run in local baseline run 5438b418d431bae7
  /.*consent.*\.spec\.ts$/, // Consent tests run separately in dedicated projects
]

export default defineConfig({
  ...base,
  workers: 6, // Conservative parallelism for CI
  retries: 1, // Allow one retry in CI for network flakes
  timeout: 60_000, // 60s timeout in CI (vs 45s locally) for cold starts
  expect: {
    timeout: 15_000, // 15s for production build hydration (increased from 8s)
  },
  // CI tests all 5 browsers via matrix strategy
  // Regular tests use storageState to bypass consent modal (fixes 80% timeout issue)
  // Consent tests run without storageState to actually test the consent modal
  projects: [
    {
      name: 'chromium-desktop',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'e2e/storage/consent-accepted.json',
      },
    },
    {
      name: 'consent-chromium-desktop',
      testMatch: /.*consent.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // No storageState - consent tests need fresh state
      },
    },
    {
      name: 'firefox-desktop',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        navigationTimeout: 30_000, // Extra time for Firefox in CI
        storageState: 'e2e/storage/consent-accepted.json',
      },
    },
    {
      name: 'consent-firefox-desktop',
      testMatch: /.*consent.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        navigationTimeout: 30_000, // Extra time for Firefox in CI
        // No storageState - consent tests need fresh state
      },
    },
    {
      name: 'webkit-desktop',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        actionTimeout: 20_000, // Extra time for WebKit
        storageState: 'e2e/storage/consent-accepted.json',
      },
    },
    {
      name: 'consent-webkit-desktop',
      testMatch: /.*consent.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        actionTimeout: 20_000, // Extra time for WebKit
        // No storageState - consent tests need fresh state
      },
    },
    {
      name: 'chromium-mobile',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['Pixel 7'],
        storageState: 'e2e/storage/consent-accepted.json',
      },
    },
    {
      name: 'consent-chromium-mobile',
      testMatch: /.*consent.*\.spec\.ts$/,
      use: {
        ...devices['Pixel 7'],
        // No storageState - consent tests need fresh state
      },
    },
    {
      name: 'webkit-mobile',
      testIgnore: EXCLUDED_TESTS,
      use: {
        ...devices['iPhone 14'],
        actionTimeout: 20_000, // Extra time for WebKit
        storageState: 'e2e/storage/consent-accepted.json',
      },
    },
    {
      name: 'consent-webkit-mobile',
      testMatch: /.*consent.*\.spec\.ts$/,
      use: {
        ...devices['iPhone 14'],
        actionTimeout: 20_000, // Extra time for WebKit
        // No storageState - consent tests need fresh state
      },
    },
  ],
  webServer: {
    command: 'PORT=3333 node .next/standalone/server.js',
    port: 3333,
    reuseExistingServer: !!process.env.CI, // Reuse in CI (started by workflow), fresh locally
    timeout: 60_000, // 1 minute for server startup (build happens in workflow step)
    stdout: 'pipe', // Pipe stdout to see server logs
    stderr: 'pipe', // Pipe stderr to see errors
    env: {
      // Database (workflow sets this, but ensure it's passed through)
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@postgres:5432/anthrasite_test',
      DIRECT_URL:
        process.env.DIRECT_URL ||
        'postgresql://postgres:postgres@postgres:5432/anthrasite_test',
      // E2E mode flags (must be set for server to run in E2E mode)
      NODE_ENV: 'production',
      PORT: '3333',
      NEXT_PUBLIC_E2E: 'true',
      NEXT_PUBLIC_E2E_TESTING: 'true',
      // Stripe test keys (workflow passes these from secrets)
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      // Disable external services
      DISABLE_ANALYTICS: 'true',
      DISABLE_SENTRY: 'true',
      DISABLE_DD: 'true',
      DISABLE_EMAIL: 'true',
      // Mock services
      NEXT_PUBLIC_USE_MOCK_PURCHASE: 'true',
      // Config
      SKIP_ENV_VALIDATION: 'true',
      SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING: '1',
      // Test utilities
      ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'test-admin-key-local-only',
    },
  },
  use: {
    ...base.use,
    // storageState handled per-project (consent tests need fresh state)
    actionTimeout: 15_000, // 15s action timeout in CI
    navigationTimeout: 30_000, // 30s navigation timeout in CI
    video: 'off', // Disable video to save space
    trace: 'retain-on-failure', // Keep traces only on failure
    screenshot: 'only-on-failure', // Screenshots only on failure
  },
  // Configure reporters for CI
  reporter: [
    ['list'], // Better for CI logs than 'line'
    ['html', { open: 'never' }], // Generate HTML report but don't open
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['@currents/playwright'], // Report to Currents dashboard
  ],
  // Prevent accidental .only() commits
  forbidOnly: !!process.env.CI,
})
