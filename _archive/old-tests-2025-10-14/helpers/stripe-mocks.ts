// Minimal Stripe mock strategy for browser E2E tests
// Enables mock purchase mode and stubs Stripe network calls

import { Page, BrowserContext } from '@playwright/test'

/**
 * Enable mock purchase mode in the browser
 * Sets flags that the app can check to use test/mock payment flow
 */
export async function enableMockPurchase(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // App reads this in purchase flow
    localStorage.setItem('NEXT_PUBLIC_USE_MOCK_PURCHASE', 'true')
    ;(window as any).__E2E__MOCK_PURCHASE__ = true
  })
}

/**
 * Intercept and mock Stripe API endpoints
 * Prevents real network calls during E2E tests
 */
export async function mockStripeCheckout(
  context: BrowserContext
): Promise<void> {
  await context.route(
    /stripe\.com|api\/stripe|\/create-payment-intent/i,
    async (route) => {
      const url = route.request().url()

      // Mock payment intent creation
      if (/create-payment-intent/.test(url)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            clientSecret: 'pi_test_secret_123',
            id: 'pi_test_123',
            status: 'requires_confirmation',
          }),
        })
      }

      // Mock payment intent confirmation
      if (/confirm/.test(url)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'pi_test_123',
            status: 'succeeded',
          }),
        })
      }

      // Allow other requests through
      return route.continue()
    }
  )
}
