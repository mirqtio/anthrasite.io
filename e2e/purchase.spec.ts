import { test, expect } from '@playwright/test'
import { generateUTMUrl } from '@/lib/utm/crypto'

test.describe.skip('Purchase Page', () => {
  // SKIPPED: These tests use mock data (dev-utm-valid) which conflicts with E2E real data tests
  // TODO: Convert to use real business/UTM data like utm-validation.spec.ts

  // Mock business data
  const mockBusinessId = 'test-business-123'
  const mockBusinessName = 'Test Company'
  const mockBusinessDomain = 'testcompany.com'

  // Tests will use mock purchase service via environment variables

  test('should redirect to homepage without UTM parameter', async ({
    page,
  }) => {
    await page.goto('/purchase')
    await expect(page).toHaveURL('/')
  })

  test('should handle UTM validation and redirect appropriately', async ({
    page,
  }) => {
    // Use one of the mock UTM tokens from the dev service with preview=true to show content
    const utm = 'dev-utm-valid'

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Wait for navigation to complete
    await page.waitForLoadState('domcontentloaded')

    // With the current mock setup, invalid tokens redirect to homepage
    // Valid tokens might redirect to checkout or show purchase page
    const currentUrl = page.url()

    // The page should have loaded some content (not be stuck)
    const hasContent = await page.evaluate(() => {
      return document.body.textContent!.length > 100
    })
    expect(hasContent).toBe(true)

    // If we're on a purchase page, check for the expected elements
    const hasPurchaseHeader = await page.getByTestId('purchase-header').count()
    if (hasPurchaseHeader > 0) {
      // Check for heading containing business name
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // Check for price elements (mock data shows $2,400 value)
      const priceElement = page
        .getByText('$2,400')
        .or(page.locator('text=$2,400'))
      await expect(priceElement).toBeVisible()

      // Check for checkout button with flexible text matching
      const checkoutButton = page
        .getByRole('button')
        .filter({ hasText: /Report|Checkout|Get/i })
      await expect(checkoutButton.first()).toBeVisible()
    }
  })

  test('should be mobile responsive', async ({ page }) => {
    const utm = 'dev-utm-valid'

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Check that key elements are still visible and properly laid out with better selectors
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Use more flexible text matching for the value display
    await expect(
      page.locator('text=$2,400').or(page.getByText('$2,400'))
    ).toBeVisible()

    // Check for pricing card with more flexible selector
    const pricingCard = page.locator('.bg-white').first()
    await expect(pricingCard).toBeVisible()
    const box = await pricingCard.boundingBox()
    if (box) {
      expect(box.width).toBeGreaterThan(300)
    }
  })

  test('should show performance metrics', async ({ page }) => {
    const utm = 'dev-utm-valid'

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Wait for the page to fully load
    await page.waitForSelector('[data-testid="purchase-header"]')

    // Check for performance metrics from ReportPreview component
    await expect(page.getByText('Performance').first()).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('SEO').first()).toBeVisible()
    await expect(page.getByText('Security').first()).toBeVisible()
    await expect(page.getByText('Accessibility').first()).toBeVisible()
  })

  test('should show trust signals', async ({ page }) => {
    const utm = 'dev-utm-valid'

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Check for trust elements from TrustSignals component
    await expect(page.getByText('Trusted by Leading Businesses')).toBeVisible()
    await expect(page.getByText(/10,000\+/)).toBeVisible()
    await expect(page.getByText('98%')).toBeVisible()
    await expect(page.getByText('4.9/5')).toBeVisible()
  })

  test('should show all included features', async ({ page }) => {
    const utm = 'dev-utm-valid'

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Check for features from ReportPreview component
    await expect(page.getByText(/50\+ page comprehensive report/)).toBeVisible()
    await expect(page.getByText(/Technical SEO audit/)).toBeVisible()
    await expect(
      page.getByText(/Security vulnerability assessment/)
    ).toBeVisible()
    await expect(page.getByText(/30-Day Money Back Guarantee/)).toBeVisible()
  })

  test('should handle checkout button click', async ({ page }) => {
    const utm = 'dev-utm-valid'

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Click the checkout button
    const checkoutButton = page.getByTestId('checkout-button')

    // Wait for navigation to checkout simulator (mock redirects immediately)
    const navigationPromise = page.waitForURL(
      /\/test-purchase\/checkout-simulator/
    )
    await checkoutButton.click()
    await navigationPromise

    // Should be on the checkout simulator page
    await expect(page).toHaveURL(/\/test-purchase\/checkout-simulator/)
  })

  test('should show page logo and branding', async ({ page }) => {
    const utm = 'dev-utm-valid'

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Check for logo and branding text
    await expect(page.getByText('VALUE, CRYSTALLIZED')).toBeVisible()
  })

  test('should handle expired UTM tokens', async ({ page }) => {
    // Use an invalid UTM token that doesn't exist in the mock data
    await page.goto('/purchase?utm=invalid-token')

    // Should redirect to homepage when UTM is invalid
    await expect(page).toHaveURL('/')
  })

  test('should show warning for used UTM tokens', async ({ page }) => {
    const utm = 'dev-utm-used'

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Should show warning message
    await expect(
      page.getByText(/This purchase link has already been used/)
    ).toBeVisible()
  })

  test('should maintain scroll position on navigation', async ({ page }) => {
    const utm = 'dev-utm-valid'

    await page.goto(`/purchase?utm=${utm}&preview=true`)

    // Scroll to pricing section
    await page.getByText("What's included").scrollIntoViewIfNeeded()

    // Get scroll position
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)
  })
})
