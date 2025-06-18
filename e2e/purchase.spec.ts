import { test, expect } from '@playwright/test'
import { generateUTMUrl } from '@/lib/utm/crypto'

test.describe('Purchase Page', () => {
  // Mock business data
  const mockBusinessId = 'test-business-123'
  const mockBusinessName = 'Test Company'
  const mockBusinessDomain = 'testcompany.com'

  test.beforeEach(async ({ page }) => {
    // Mock the database responses
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url())

      if (url.pathname.includes('/api/validate-utm')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            businessId: mockBusinessId,
          }),
        })
      } else {
        await route.continue()
      }
    })
  })

  test('should redirect to homepage without UTM parameter', async ({
    page,
  }) => {
    await page.goto('/purchase')
    await expect(page).toHaveURL('/')
  })

  test('should show purchase page with valid UTM', async ({ page }) => {
    // Generate a mock UTM parameter
    const utm = 'mock-utm-token.mock-signature'

    await page.goto(`/purchase?utm=${utm}`)

    // Should not redirect
    await expect(page).toHaveURL(/\/purchase\?utm=/)

    // Check for key elements
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Your Website Audit Report'
    )
    await expect(page.getByText('$99')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Get Your Report Now/i })
    ).toBeVisible()
  })

  test('should be mobile responsive', async ({ page }) => {
    const utm = 'mock-utm-token.mock-signature'

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto(`/purchase?utm=${utm}`)

    // Check that key elements are still visible and properly laid out
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('$99')).toBeVisible()

    // Pricing card should be full width on mobile
    const pricingCard = page.locator('.bg-white.rounded-2xl').first()
    const box = await pricingCard.boundingBox()
    expect(box?.width).toBeGreaterThan(300)
  })

  test('should show metrics preview', async ({ page }) => {
    const utm = 'mock-utm-token.mock-signature'

    await page.goto(`/purchase?utm=${utm}`)

    // Check for metric scores
    await expect(page.getByText('Performance')).toBeVisible()
    await expect(page.getByText('SEO')).toBeVisible()
    await expect(page.getByText('Security')).toBeVisible()
    await expect(page.getByText('Accessibility')).toBeVisible()
  })

  test('should show trust signals', async ({ page }) => {
    const utm = 'mock-utm-token.mock-signature'

    await page.goto(`/purchase?utm=${utm}`)

    // Check for trust elements
    await expect(page.getByText('Trusted by Leading Businesses')).toBeVisible()
    await expect(page.getByText(/10,000\+/)).toBeVisible()
    await expect(page.getByText('98%')).toBeVisible()
    await expect(page.getByText('4.9/5')).toBeVisible()
  })

  test('should show all included features', async ({ page }) => {
    const utm = 'mock-utm-token.mock-signature'

    await page.goto(`/purchase?utm=${utm}`)

    // Check for key features
    await expect(
      page.getByText(/Complete 50\+ page website audit report/)
    ).toBeVisible()
    await expect(page.getByText(/Technical SEO analysis/)).toBeVisible()
    await expect(
      page.getByText(/Security vulnerability assessment/)
    ).toBeVisible()
    await expect(page.getByText(/30-day money-back guarantee/)).toBeVisible()
  })

  test('should handle checkout button click', async ({ page }) => {
    const utm = 'mock-utm-token.mock-signature'

    await page.goto(`/purchase?utm=${utm}`)

    // Click the checkout button
    const checkoutButton = page.getByRole('button', {
      name: /Get Your Report Now/i,
    })
    await checkoutButton.click()

    // Should show loading state
    await expect(checkoutButton).toContainText('Processing...')
    await expect(checkoutButton).toBeDisabled()
  })

  test('should show back link to homepage', async ({ page }) => {
    const utm = 'mock-utm-token.mock-signature'

    await page.goto(`/purchase?utm=${utm}`)

    const backLink = page.getByRole('link', { name: /Back to Anthrasite/i })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/')
  })

  test('should handle expired UTM tokens', async ({ page }) => {
    // Override the mock to return expired token
    await page.route('**/api/validate-utm**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: false,
          reason: 'expired',
        }),
      })
    })

    await page.goto('/purchase?utm=expired-token')

    // Should redirect to link-expired page
    await expect(page).toHaveURL('/link-expired')
  })

  test('should show warning for used UTM tokens', async ({ page }) => {
    const utm = 'used-utm-token.signature'

    // Mock the response to indicate token is used
    await page.route('**/api/**', async (route) => {
      if (route.request().url().includes('/api/validate-utm')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            businessId: mockBusinessId,
            isUsed: true,
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto(`/purchase?utm=${utm}`)

    // Should show warning message
    await expect(
      page.getByText(/This purchase link has already been used/)
    ).toBeVisible()
  })

  test('should maintain scroll position on navigation', async ({ page }) => {
    const utm = 'mock-utm-token.mock-signature'

    await page.goto(`/purchase?utm=${utm}`)

    // Scroll to pricing section
    await page
      .getByText('Get Your Complete Website Audit')
      .scrollIntoViewIfNeeded()

    // Get scroll position
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)
  })
})
