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
export default defineConfig({
  ...base,
  workers: 6, // Conservative parallelism for CI
  retries: 1, // Allow one retry in CI for network flakes
  timeout: 60_000, // 60s timeout in CI (vs 45s locally) for cold starts
  expect: {
    timeout: 8_000, // 8s expectations in CI (vs 5s locally)
  },
  // CI only tests Chromium (override base config's 5-browser matrix)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'PORT=3333 pnpm run dev',
    port: 3333,
    reuseExistingServer: false, // Never reuse in CI - always start fresh
    timeout: 180_000, // 3 minutes for CI server startup (cold environment)
    env: (base.webServer &&
      !Array.isArray(base.webServer) &&
      base.webServer.env) || {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:devpass@localhost:5432/anthrasite_test',
      NEXT_PUBLIC_E2E_TESTING: 'true',
      ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'test-admin-key-local-only',
    },
  },
  use: {
    ...base.use,
    actionTimeout: 15_000, // 15s action timeout in CI
    navigationTimeout: 30_000, // 30s navigation timeout in CI
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Configure reporters for CI
  reporter: [
    ['line'],
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
})
