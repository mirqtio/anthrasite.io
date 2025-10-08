import { defineConfig } from '@playwright/test'
import base from './playwright.config'

/**
 * CI-specific Playwright configuration
 * Extends base config with settings optimized for GitHub Actions
 */
export default defineConfig({
  ...base,
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
