// e2e/privacy.spec.ts
import { test, expect } from '@playwright/test'

// Test suite for privacy features
test.describe('Privacy Compliance Features', () => {
  test('Footer should contain all required legal links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')

    await expect(
      footer.getByRole('link', { name: 'Privacy Policy' })
    ).toBeVisible()
    await expect(
      footer.getByRole('link', { name: 'Terms of Service' })
    ).toBeVisible()
    await expect(
      footer.getByRole('link', {
        name: 'Do Not Sell or Share My Personal Information',
      })
    ).toBeVisible()
  })

  test('Privacy Policy page should be accessible', async ({ page }) => {
    await page.goto('/legal/privacy')
    await expect(
      page.getByRole('heading', { name: 'Privacy Policy' })
    ).toBeVisible()
  })

  test('Terms of Service page should be accessible', async ({ page }) => {
    await page.goto('/legal/terms')
    await expect(
      page.getByRole('heading', { name: 'Terms of Service' })
    ).toBeVisible()
  })

  test('Do Not Sell page should set cookie on opt-out', async ({ page }) => {
    await page.goto('/legal/do-not-sell')
    await expect(
      page.getByRole('heading', {
        name: 'Do Not Sell or Share My Personal Information',
      })
    ).toBeVisible()

    // Dismiss consent banner if present (it may block the opt-out button)
    const consentBanner = page.getByTestId('consent-banner')
    if (await consentBanner.isVisible()) {
      await page.getByTestId('banner-reject-all-button').click()
      await expect(consentBanner).not.toBeVisible()
    }

    // Listen for the alert to confirm button click
    page.on('dialog', (dialog) => dialog.accept())

    await page
      .getByRole('button', { name: 'Opt Out of Analytics Tracking' })
      .click()

    const cookies = await page.context().cookies()
    const doNotShareCookie = cookies.find((c) => c.name === 'do_not_share')
    expect(doNotShareCookie).toBeDefined()
    expect(doNotShareCookie?.value).toBe('1')
  })

  test('GPC header should automatically set do_not_share cookie', async ({
    browser,
  }) => {
    // Create a new context with the GPC header set
    const context = await browser.newContext({
      extraHTTPHeaders: {
        'Sec-GPC': '1',
      },
    })
    const page = await context.newPage()
    await page.goto('/')

    const cookies = await context.cookies()
    const doNotShareCookie = cookies.find((c) => c.name === 'do_not_share')
    expect(doNotShareCookie).toBeDefined()
    expect(doNotShareCookie?.value).toBe('1')

    await context.close()
  })

  test('DSAR API should accept valid requests', async ({ request }) => {
    const response = await request.post('/api/privacy/requests', {
      data: {
        email: 'test@example.com',
        type: 'access',
      },
    })

    expect(response.status()).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('trackingId')
    expect(body).toHaveProperty('dueDate')
  })

  test('DSAR API should reject invalid request types', async ({ request }) => {
    const response = await request.post('/api/privacy/requests', {
      data: {
        email: 'test@example.com',
        type: 'invalid_type',
      },
    })

    expect(response.status()).toBe(400)
  })
})
