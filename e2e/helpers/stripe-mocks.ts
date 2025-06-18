import { Page } from '@playwright/test'

export async function mockStripeCheckout(page: Page) {
  // Mock Stripe checkout session creation
  await page.route('**/api/stripe/checkout', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
        amount_total: 9900,
      })
    })
  })
  
  // Mock Stripe JS
  await page.addScriptTag({
    content: `
      window.Stripe = function() {
        return {
          redirectToCheckout: async () => ({ error: null })
        }
      }
    `
  })
}

export async function mockStripeWebhook(page: Page, eventType: string, sessionId: string) {
  const webhookPayload = {
    id: 'evt_test_123',
    type: eventType,
    data: {
      object: {
        id: sessionId,
        payment_status: 'paid',
        amount_total: 9900,
        currency: 'usd',
        customer_details: {
          email: 'test@example.com',
          name: 'Test User',
        },
        metadata: {
          businessId: 'test-business-123',
          utmToken: 'test-utm-token',
        }
      }
    }
  }
  
  return webhookPayload
}