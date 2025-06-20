import { test, expect } from '@playwright/test'

test.describe('Cookie Consent Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies before each test
    await context.clearCookies()
    await page.goto('/')
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
    await page.getByTestId('cookie-preferences-button').click()

    // Wait for modal to be visible with proper timeout
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('cookie-preferences-title')).toBeVisible({ timeout: 15000 })

    // Categories should be shown
    await expect(page.getByText('Essential Cookies')).toBeVisible()
    await expect(page.getByText('Functional Cookies')).toBeVisible()
    await expect(page.getByText('Analytics Cookies')).toBeVisible()

    // Essential cookies should show as "Always on"
    await expect(page.getByText('Always on')).toBeVisible()
  })

  test('should save custom preferences', async ({ page }) => {
    await page.getByTestId('cookie-preferences-button').click()

    // Wait for modal to fully open with proper timeout
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('cookie-preferences-title')).toBeVisible({ timeout: 15000 })

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
    await page.getByTestId('cookie-preferences-button').click()

    // Wait for modal to be fully visible with proper timeout
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('cookie-preferences-title')).toBeVisible({ timeout: 15000 })

    // Click backdrop - target the backdrop specifically
    await page
      .locator('.fixed.inset-0.bg-black\\/50')
      .click({ position: { x: 10, y: 10 }, force: true })

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should load analytics scripts only after consent', async ({ page }) => {
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
  })

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
    // Tab to first button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should focus on "Manage preferences" button
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

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Banner should be visible and properly styled
    await expect(
      page.getByRole('region', { name: 'Cookie consent' })
    ).toBeVisible()

    // Buttons should stack vertically on mobile - check banner specifically
    const bannerButtonsContainer = page
      .getByRole('region', { name: 'Cookie consent' })
      .locator('.flex-col.sm\\:flex-row')
    await expect(bannerButtonsContainer).toBeVisible()

    // Open preferences
    await page.getByTestId('cookie-preferences-button').click()

    // Modal should fit mobile screen
    await expect(page.getByRole('dialog')).toBeVisible()
    const modal = page.locator('.fixed.inset-x-4')
    await expect(modal).toBeVisible()
  })
})
