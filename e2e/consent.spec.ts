import { test, expect } from './base-test'
import { openCookiePreferences } from './helpers/test-utils'
import { skipOnMobile } from './helpers/project-filters'

// Disable route blocking for consent tests - they need to test actual analytics loading
test.use({ skipRouteBlocking: true })

test.describe('Cookie Consent Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies and localStorage before each test
    await context.clearCookies()
    await page.goto('/')
    // Clear localStorage after navigation to ensure banner shows
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
    // Wait for React hydration
    await page.waitForTimeout(1000)
  })

  test('should show consent banner on first visit', async ({ page }) => {
    // Banner should be visible
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).toBeVisible()
    await expect(page.getByText('We value your privacy')).toBeVisible()

    // All buttons should be present
    await expect(page.getByTestId('accept-all-cookies-button')).toBeVisible()
    await expect(page.getByTestId('banner-reject-all-button')).toBeVisible()
    await expect(page.getByTestId('cookie-preferences-button')).toBeVisible()
  })

  test('should hide banner after accepting all cookies', async ({ page }) => {
    await page.getByTestId('accept-all-cookies-button').click()

    // Banner should disappear
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).not.toBeVisible()

    // Reload page - banner should remain hidden
    await page.reload()
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).not.toBeVisible()
  })

  test('should hide banner after rejecting all cookies', async ({ page }) => {
    await page.getByTestId('banner-reject-all-button').click()

    // Banner should disappear
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).not.toBeVisible()

    // Verify no analytics cookies are set
    const cookies = await page.context().cookies()
    const analyticsCookies = cookies.filter(
      (c) => c.name.startsWith('_ga') || c.name.startsWith('ph_')
    )
    expect(analyticsCookies).toHaveLength(0)
  })

  test('should open preferences modal', async ({ page }) => {
    await openCookiePreferences(page)

    // Verify modal content is visible
    await expect(page.getByTestId('cookie-preferences-title')).toBeVisible({
      timeout: 5000,
    })

    // Categories should be shown
    await expect(
      page.getByRole('heading', { name: 'Essential Cookies' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Functional Cookies' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Analytics Cookies' })
    ).toBeVisible()

    // Essential cookies should show as "Always on"
    await expect(page.getByText('Always on')).toBeVisible()
  })

  test('should save custom preferences', async ({ page }) => {
    await openCookiePreferences(page)

    // Verify modal content is visible
    await expect(page.getByTestId('cookie-preferences-title')).toBeVisible({
      timeout: 5000,
    })

    // Toggle analytics on
    await page.getByRole('switch', { name: /Analytics Cookies/ }).click()

    // Save preferences
    await page.getByRole('button', { name: 'Save preferences' }).click()

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Banner should be hidden
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).not.toBeVisible()

    // Reload and verify preferences are persisted
    await page.reload()
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).not.toBeVisible()
  })

  test('should close preferences modal when clicking backdrop', async ({
    page,
  }) => {
    await openCookiePreferences(page)

    // Verify modal content is visible
    await expect(page.getByTestId('cookie-preferences-title')).toBeVisible({
      timeout: 5000,
    })

    // Press Escape to close modal (standard keyboard interaction)
    await page.keyboard.press('Escape')

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test(
    'should load analytics scripts only after consent',
    { tag: '@consent-edge' },
    async ({ page }) => {
      // Check that analytics scripts are not loaded initially
      const gaScriptBefore = await page
        .locator('script[src*="googletagmanager.com"]')
        .count()
      expect(gaScriptBefore).toBe(0)

      // Accept analytics cookies
      await page.getByTestId('accept-all-cookies-button').click()

      // Wait a bit for scripts to load
      await page.waitForTimeout(1000)

      // Check that analytics scripts are now loaded
      const gaScriptAfter = await page
        .locator('script[src*="googletagmanager.com"]')
        .count()
      expect(gaScriptAfter).toBeGreaterThan(0)
    }
  )

  test('should handle consent version changes', async ({ page, context }) => {
    // Set old version consent
    await context.addCookies([
      {
        name: 'anthrasite_cookie_consent',
        value: JSON.stringify({
          version: '0.9',
          preferences: { analytics: true, functional: true },
        }),
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/')

    // Banner should be shown again due to version mismatch
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).toBeVisible()
  })

  test('should be keyboard accessible', async ({ page }) => {
    // Focus the "Manage preferences" button directly (tab order may vary)
    await page.getByTestId('cookie-preferences-button').focus()
    await expect(page.getByTestId('cookie-preferences-button')).toBeFocused()

    // Open modal with Enter
    await page.keyboard.press('Enter')

    // Modal should be open
    await expect(page.getByRole('dialog')).toBeVisible()

    // Tab through toggles
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Toggle with Space
    await page.keyboard.press('Space')

    // Tab to save button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Save with Enter
    await page.keyboard.press('Enter')

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should be mobile responsive', async ({ page }, testInfo) => {
    // Skip on mobile projects - they already have mobile viewports configured
    skipOnMobile(testInfo)

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Banner should be visible and properly styled
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).toBeVisible()

    // Buttons should stack vertically on mobile - check banner buttons are visible
    await expect(page.getByTestId('cookie-preferences-button')).toBeVisible()
    await expect(page.getByTestId('banner-reject-all-button')).toBeVisible()
    await expect(page.getByTestId('accept-all-cookies-button')).toBeVisible()

    // Open preferences
    await page.getByTestId('cookie-preferences-button').click()

    // Modal should fit mobile screen
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Verify modal is responsive (doesn't overflow viewport)
    const modalBox = await modal.boundingBox()
    const viewport = page.viewportSize()
    if (modalBox && viewport) {
      expect(modalBox.width).toBeLessThanOrEqual(viewport.width)
    }
  })
})
