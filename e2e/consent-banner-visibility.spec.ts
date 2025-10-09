import { test, expect } from './base-test'
import { waitForAppReady } from './utils/waits'

test.describe('Consent Banner Visibility', () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies and localStorage to simulate new user
    await context.clearCookies()
    await context.addInitScript(() => {
      localStorage.clear()
    })
  })

  test('should show consent banner for new users', async ({ page }) => {
    // Navigate to the site
    await page.goto('/')
    await waitForAppReady(page)

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')

    // Wait a moment for React to hydrate and render
    await page.waitForTimeout(500)

    // Wait for banner with longer timeout
    await expect(
      page.locator('[role="region"][aria-label="Cookie consent"]')
    ).toBeVisible({ timeout: 10000 })

    // Verify banner content
    await expect(page.getByText('We value your privacy')).toBeVisible()
    await expect(page.getByTestId('accept-all-cookies-button')).toBeVisible()
    await expect(page.getByTestId('banner-reject-all-button')).toBeVisible()
    await expect(page.getByTestId('cookie-preferences-button')).toBeVisible()
  })

  test('should show consent banner in incognito mode', async ({ browser }) => {
    // Create new incognito context
    const context = await browser.newContext()
    const page = await context.newPage()

    // Navigate to the site
    await page.goto('/')
    await waitForAppReady(page)

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')

    // Wait for banner
    await expect(
      page.locator('[role="region"][aria-label="Cookie consent"]')
    ).toBeVisible({ timeout: 10000 })

    await context.close()
  })

  test('should not show banner after accepting cookies', async ({ page }) => {
    // First visit - accept cookies
    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForLoadState('networkidle')

    // Accept cookies
    await page.getByTestId('accept-all-cookies-button').click()

    // Wait for banner to disappear
    await expect(
      page.locator('[role="region"][aria-label="Cookie consent"]')
    ).not.toBeVisible()

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Banner should not appear
    await expect(
      page.locator('[role="region"][aria-label="Cookie consent"]')
    ).not.toBeVisible()
  })
})
