import { Page } from '@playwright/test'

/**
 * Mock Stripe checkout for E2E tests
 * This intercepts Stripe API calls and returns mock responses
 */
export async function mockStripeCheckout(page: Page) {
  // Intercept Stripe payment intent creation
  await page.route('**/api/checkout/payment-intent', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        clientSecret: 'pi_test_secret_mock',
        paymentIntentId: 'pi_test_mock_id',
      }),
    })
  })

  // Intercept Stripe checkout session creation
  await page.route('**/api/checkout/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId: 'cs_test_mock_session',
        url: '/purchase/success?session_id=cs_test_mock_session',
      }),
    })
  })

  // Intercept Stripe.js library if needed
  await page.route('**/js.stripe.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.Stripe = function() {
          return {
            elements: () => ({
              create: () => ({ mount: () => {}, on: () => {} }),
              getElement: () => null,
            }),
            confirmCardPayment: () => Promise.resolve({
              paymentIntent: { id: 'pi_test_mock_id', status: 'succeeded' }
            }),
            redirectToCheckout: ({ sessionId }) => {
              window.location.href = '/purchase/success?session_id=' + sessionId;
              return Promise.resolve({ error: null });
            },
          };
        };
      `,
    })
  })
}
