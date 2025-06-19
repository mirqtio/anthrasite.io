import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })
// Load local overrides if they exist
config({ path: '.env.test.local', override: true })

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000, // Reduced timeout for faster CI
  expect: {
    timeout: 5000, // Reduced expect timeout
  },
  fullyParallel: true, // Run tests in parallel for speed
  forbidOnly: true,
  retries: 0, // No retries for speed
  workers: 1, // Single worker for CI stability and speed
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    actionTimeout: 5000, // Reduced action timeout
    navigationTimeout: 10000, // Reduced navigation timeout
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
