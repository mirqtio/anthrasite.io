import { Page, expect } from '@playwright/test'

/**
 * Wait for app to be ready before running tests
 * Ensures server is healthy, DOM is loaded, and storage is clean
 */
export async function waitForAppReady(page: Page) {
  // Check health endpoint is responding
  const r = await page.request.get('/api/health')
  expect(r.status()).toBeLessThan(500)

  // Clear cookies and storage BEFORE navigation to prevent test pollution
  await page.context().clearCookies()
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.waitForLoadState('domcontentloaded')

  // Ensure app shell is visible (confirms React has hydrated)
  await expect(page.locator('[data-app-shell]')).toBeVisible()
}
