import { test, expect } from '@playwright/test'
import { generateUTMToken } from './helpers/utm-generator'
import { mockStripeCheckout } from './helpers/stripe-mocks'
import {
  safeClick,
  safeFill,
  gotoAndDismissCookies,
} from './helpers/test-utils'

test.describe('Full User Journey - Comprehensive E2E Tests', () => {
  test.describe('Organic Visitor Flow', () => {
    test('complete waitlist signup journey', async ({ page }) => {
      // 1. Visit homepage with cookie dismissal
      await gotoAndDismissCookies(page, '/')
      await expect(page).toHaveTitle(/Anthrasite/)

      // 2. Verify organic mode
      await expect(
        page.getByRole('heading', {
          name: /Your website has untapped potential/i,
        })
      ).toBeVisible()

      // 5. Click Get Started button to open modal with animation wait
      await safeClick(page, '[data-testid="open-waitlist-button"]', {
        waitForAnimations: true,
      })

      // 6. Fill waitlist form in modal
      await expect(page.getByTestId('waitlist-form')).toBeVisible()
      await safeFill(page, 'input[placeholder="example.com"]', 'example.com')
      await safeFill(
        page,
        'input[placeholder="you@example.com"]',
        'test@example.com'
      )

      // 7. Submit waitlist form
      await safeClick(page, '[data-testid="waitlist-submit-button"]')

      // 9. Verify success state
      await expect(page.getByText("You're on the list!")).toBeVisible()
      await expect(
        page.getByText(/We'll analyze .* and send the report when we launch/)
      ).toBeVisible()

      // 10. Check analytics event fired
      await page
        .evaluate(() => {
          return window.dataLayer?.some(
            (event) => event.event === 'waitlist_signup'
          )
        })
        .then((result) => expect(result).toBeTruthy())
    })

    test.skip('help widget interaction', async ({ page }) => {
      // Help widget is not yet implemented in the current design
      // This test should be enabled when the HelpWidget component is added
    })

    test('responsive design check', async ({ page }) => {
      // Desktop view
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto('/')
      await expect(
        page.getByRole('heading', {
          name: /Your website has untapped potential/i,
        })
      ).toBeVisible()

      // Tablet view
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(
        page.getByRole('heading', {
          name: /Your website has untapped potential/i,
        })
      ).toBeVisible()

      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(
        page.getByRole('heading', {
          name: /Your website has untapped potential/i,
        })
      ).toBeVisible()

      // Verify mobile menu if applicable
      const mobileMenuButton = page.getByRole('button', { name: /menu/i })
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        // Verify menu items
      }
    })
  })

  test.describe('Email → Purchase → Success Flow', () => {
    test('complete purchase journey with valid UTM', async ({ page }) => {
      // Generate valid UTM token
      const utm = await generateUTMToken({
        businessId: 'test-business-123',
        businessName: 'Test Company',
        price: 9900,
      })

      // 1. Visit with UTM parameter
      await page.goto(`/purchase?utm=${utm}`)

      // 2. Verify purchase mode
      await expect(
        page.getByText(/Test Company, your audit is ready/i)
      ).toBeVisible()

      // 3. Check pricing display
      await expect(page.getByText('$99')).toBeVisible()

      // 4. Verify trust signals
      await expect(page.getByText(/Secure payment/i)).toBeVisible()
      await expect(page.getByText(/24hr delivery/i)).toBeVisible()

      // 5. Mock Stripe checkout
      await mockStripeCheckout(page)

      // 6. Click purchase button
      const purchaseButton = page.getByRole('button', {
        name: /Get Your Report Now/i,
      })
      await purchaseButton.click()

      // 7. Verify loading state
      await expect(purchaseButton).toContainText('Processing...')

      // 8. Simulate successful redirect (in real test, would go to Stripe)
      await page.goto('/purchase/success?session_id=cs_test_123')

      // 9. Verify success page
      await expect(page.getByText(/Thank you for your purchase/i)).toBeVisible()
      await expect(page.getByText(/Report will be delivered/i)).toBeVisible()
    })

    test('handle expired UTM gracefully', async ({ page }) => {
      // Use an expired UTM token
      const expiredUtm = 'expired_token_123'

      await page.goto(`/purchase?utm=${expiredUtm}`)

      // Should redirect to link expired page
      await expect(page).toHaveURL('/link-expired')
      await expect(page.getByText(/This link has expired/i)).toBeVisible()

      // Verify user can request new link
      const requestNewLink = page.getByRole('button', {
        name: /Request New Link/i,
      })
      await expect(requestNewLink).toBeVisible()
    })

    test('checkout recovery flow', async ({ page }) => {
      const utm = await generateUTMToken({
        businessId: 'test-business-456',
        businessName: 'Another Company',
        price: 9900,
      })

      // 1. Start purchase flow
      await page.goto(`/purchase?utm=${utm}`)

      // 2. Simulate checkout error
      await page.route('**/api/stripe/checkout', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Network error' }),
        })
      })

      // 3. Click purchase button
      await page.getByRole('button', { name: /Get Your Report Now/i }).click()

      // 4. Verify error message
      await expect(page.getByText(/Network connection issue/i)).toBeVisible()

      // 5. Click retry
      await page.getByRole('button', { name: /Retry/i }).click()

      // 6. After 2 failures, recovery link should appear
      await page.getByRole('button', { name: /Get Your Report Now/i }).click()
      await expect(
        page.getByRole('button', { name: /Use Recovery Link/i })
      ).toBeVisible()
    })
  })

  test.describe('A/B Test Variant Flows', () => {
    test('variant assignment consistency', async ({ page, context }) => {
      // First visit - get assigned variant
      await page.goto('/')

      // Get variant from cookie or localStorage
      const cookies = await context.cookies()
      const variantCookie = cookies.find((c) => c.name === 'ab_variant')

      // Reload page and verify same variant
      await page.reload()

      const newCookies = await context.cookies()
      const newVariantCookie = newCookies.find((c) => c.name === 'ab_variant')

      expect(newVariantCookie?.value).toBe(variantCookie?.value)
    })
  })

  test.describe('Analytics Consent Flows', () => {
    test('analytics blocked without consent', async ({ page }) => {
      // Clear cookies to ensure fresh start
      await page.context().clearCookies()

      await page.goto('/')

      // Wait for page to load
      await page.waitForSelector('main', { state: 'visible', timeout: 10000 })

      // Verify no analytics loaded
      const hasGA = await page.evaluate(() => {
        return typeof window.gtag !== 'undefined'
      })
      expect(hasGA).toBeFalsy()

      // Accept analytics
      await page.getByTestId('accept-all-cookies-button').click()

      // Wait for analytics to load
      await page.waitForTimeout(1000)

      // Verify analytics now loaded
      const hasGAAfter = await page.evaluate(() => {
        return typeof window.gtag !== 'undefined'
      })
      expect(hasGAAfter).toBeTruthy()
    })

    test('manage cookie preferences', async ({ page }) => {
      await page.goto('/')

      // Wait for page to load
      await page.waitForSelector('main', { state: 'visible', timeout: 10000 })

      // Open preferences
      await page.getByTestId('cookie-preferences-button').click()

      // Verify options
      await expect(page.getByLabel(/analytics cookies/i)).toBeVisible()
      await expect(page.getByLabel(/marketing cookies/i)).toBeVisible()
      await expect(page.getByLabel(/performance cookies/i)).toBeVisible()

      // Disable analytics
      await page.getByLabel(/analytics cookies/i).uncheck()

      // Save preferences
      await page.getByRole('button', { name: /save preferences/i }).click()

      // Verify analytics not loaded
      await page.reload()
      const hasGA = await page.evaluate(() => {
        return typeof window.gtag !== 'undefined'
      })
      expect(hasGA).toBeFalsy()
    })
  })

  test.describe('Error Scenarios', () => {
    test('404 page handling', async ({ page }) => {
      await page.goto('/non-existent-page')
      await expect(page.getByText(/page not found/i)).toBeVisible()
      await expect(page.getByRole('link', { name: /go home/i })).toBeVisible()
    })

    test('network error handling', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', (route) => route.abort())

      await page.goto('/')

      // Try to submit waitlist
      await page.getByPlaceholder(/yourdomain\.com/).fill('test.com')
      await page.getByPlaceholder(/yourdomain\.com/).press('Enter')

      // Should show error
      await expect(page.getByText(/Unable to validate domain/i)).toBeVisible()
    })
  })

  test.describe('Performance Checks', () => {
    test('page load performance', async ({ page }) => {
      const metrics = await page
        .goto('/', { waitUntil: 'networkidle' })
        .then(() =>
          page.evaluate(() => {
            const navigation = performance.getEntriesByType(
              'navigation'
            )[0] as PerformanceNavigationTiming
            return {
              domContentLoaded:
                navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            }
          })
        )

      // Verify performance targets
      expect(metrics.domContentLoaded).toBeLessThan(3000) // 3 seconds
      expect(metrics.loadComplete).toBeLessThan(5000) // 5 seconds
    })
  })
})
