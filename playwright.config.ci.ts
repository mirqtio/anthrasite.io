import { defineConfig, devices } from '@playwright/test'
import base from './playwright.config'

/**
 * CI-specific Playwright configuration
 * Extends base config with settings optimized for GitHub Actions
 *
 * NOTE: CI only tests Chromium for speed and reliability.
 * Base config includes 5 browsers for local development.
 * Enable cross-browser matrix in CI when needed.
 */
export default defineConfig({
  ...base,
  // CI only tests Chromium (override base config's 5-browser matrix)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: base.webServer
    ? {
        ...base.webServer,
        reuseExistingServer: false, // Never reuse in CI - always start fresh
      }
    : undefined,
  use: {
    ...base.use,
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Tighten retries for CI determinism
  retries: 1,
})
