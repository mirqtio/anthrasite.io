import { Page, expect } from '@playwright/test'

/**
 * Wait for app to be ready before running tests
 * Ensures server is healthy and DOM is loaded
 */
export async function waitForAppReady(page: Page) {
  // Check health endpoint is responding
  const r = await page.request.get('/api/health')
  expect(r.status()).toBeLessThan(500)

  // Navigate to homepage
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  // Ensure app shell is visible (confirms React has hydrated)
  await expect(page.locator('[data-app-shell]')).toBeVisible()
}
