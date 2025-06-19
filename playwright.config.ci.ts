import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })
// Load local overrides if they exist
config({ path: '.env.test.local', override: true })

export default defineConfig({
  testDir: './e2e',
  timeout: 40 * 1000, // Balanced timeout for CI
  expect: {
    timeout: 7000, // Balanced expect timeout
  },
  fullyParallel: true, // Run tests in parallel for speed
  forbidOnly: true,
  retries: 0, // No retries for speed
  workers: 2, // Two workers for faster execution while maintaining stability
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    actionTimeout: 7000, // Balanced action timeout
    navigationTimeout: 12000, // Balanced navigation timeout
    baseURL: 'http://localhost:3333',
    trace: 'off', // Disable trace for speed
    screenshot: 'only-on-failure',
    video: 'off', // Disable video for speed
  },

  // Only run Chrome in CI for speed
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'NEXT_PUBLIC_USE_MOCK_PURCHASE=true npm run start',
    port: 3333,
    reuseExistingServer: false,
    timeout: 60 * 1000, // 1 minute for start only (build done separately)
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NEXT_PUBLIC_USE_MOCK_PURCHASE: 'true',
      NODE_ENV: 'test',
      CI: 'true',
      SKIP_ENV_VALIDATION: 'true',
      SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING: '1',
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5432/anthrasite_test',
    },
  },
})
