import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000, // Increase timeout for CI
  expect: {
    timeout: 10000, // Increase expect timeout
  },
  fullyParallel: false, // Run tests sequentially in CI
  forbidOnly: true,
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    actionTimeout: 10000,
    baseURL: 'http://localhost:3333',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
      NODE_ENV: 'development',
    },
  },
})
