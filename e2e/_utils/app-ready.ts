import { Page, expect } from '@playwright/test'

/**
 * Wait for app to be ready before running tests
 * Ensures server is healthy, DOM is loaded, and storage is clean
 */
export async function waitForAppReady(page: Page) {
  // Check health endpoint is responding
  const r = await page.request.get('/api/health')
  expect(r.status()).toBeLessThan(500)

  // Clear cookies first (available before navigation)
  await page.context().clearCookies()

  // Navigate to homepage
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  // Clear storage after page loads
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  // Ensure app shell is visible (confirms React has hydrated)
  await expect(page.locator('[data-app-shell]')).toBeVisible()
}
