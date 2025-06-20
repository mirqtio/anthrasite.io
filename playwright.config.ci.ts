import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })
// Load local overrides if they exist
config({ path: '.env.test.local', override: true })

export default defineConfig({
  testDir: './e2e',
  globalSetup: require.resolve('./e2e/global-setup'),
  timeout: 60 * 1000, // Increased timeout for CI stability
  expect: {
    timeout: 15000, // Increased expect timeout for CI stability
  },
  fullyParallel: true, // Run tests in parallel for speed
  forbidOnly: true,
  retries: 0, // No retries for speed
  workers: 2, // Two workers for faster execution while maintaining stability
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    actionTimeout: 10000, // Increased action timeout for CI stability
    navigationTimeout: 20000, // Increased navigation timeout for CI stability
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
