import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })
// Load local overrides if they exist
config({ path: '.env.test.local', override: true })

export default defineConfig({
  testDir: './e2e',
  timeout: 45 * 1000, // Reasonable test timeout for CI
  expect: {
    timeout: 8000, // Reasonable expect timeout
  },
  fullyParallel: true, // Run tests in parallel for speed
  forbidOnly: true,
  retries: 0, // No retries for speed (tests should be reliable)
  workers: 2, // Use 2 workers for parallel execution
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    actionTimeout: 8000, // Reasonable action timeout
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
    command:
      'NEXT_PUBLIC_USE_MOCK_PURCHASE=true npm run build && NEXT_PUBLIC_USE_MOCK_PURCHASE=true npm run start',
    port: 3333,
    reuseExistingServer: false,
    timeout: 180 * 1000, // 3 minutes for build + start in CI
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NEXT_PUBLIC_USE_MOCK_PURCHASE: 'true',
      NODE_ENV: 'test',
      CI: 'true',
      SKIP_ENV_VALIDATION: 'true',
      SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING: '1',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/anthrasite_test',
    },
  },
})
