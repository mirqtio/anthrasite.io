import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Stripe Handlers
const stripeHandlers = [
  http.post('https://api.stripe.com/v1/payment_intents', () => {
    return HttpResponse.json({
      id: 'pi_mock_123',
      client_secret: 'pi_mock_123_secret_mock',
      status: 'requires_payment_method',
      amount: 39900,
    })
  }),
  http.post('https://api.stripe.com/v1/payment_intents/:id/confirm', () => {
    return HttpResponse.json({
      id: 'pi_mock_123',
      status: 'succeeded',
    })
  }),
]

// Analytics Handlers - Block all tracking
const analyticsHandlers = [
  http.all('https://app.posthog.com/*', () => new HttpResponse(null, { status: 204 })),
  http.all('https://us.i.posthog.com/*', () => new HttpResponse(null, { status: 204 })),
  http.all('https://www.google-analytics.com/*', () => new HttpResponse(null, { status: 204 })),
  http.all('https://www.googletagmanager.com/*', () => new HttpResponse(null, { status: 204 })),
  http.all('https://*.datadoghq.com/*', () => new HttpResponse(null, { status: 204 })),
  http.all('https://rum.browser-intake-datadoghq.com/*', () => new HttpResponse(null, { status: 204 })),
]

// Supabase Auth Handlers
const supabaseHandlers = [
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock_token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh',
      user: {
        id: 'mock_user_id',
        email: 'test@example.com',
        role: 'authenticated',
      },
    })
  }),
]

// External Network Deny (catches anything we missed)
const externalDeny = http.all(/^https?:\/\/(?!localhost|127\.0\.0\.1).*/, ({ request }) => {
  console.error(`❌ Blocked external call: ${request.url}`)
  return new HttpResponse(null, { status: 503 })
})

// Conditional handler loading based on env vars
const handlers = []

if (process.env.CI_MOCK_STRIPE === 'true') {
  handlers.push(...stripeHandlers)
}

if (process.env.CI_MOCK_ANALYTICS === 'true') {
  handlers.push(...analyticsHandlers)
}

if (process.env.CI_MOCK_SUPABASE === 'true') {
  handlers.push(...supabaseHandlers)
}

// Always add the deny-all fallback
handlers.push(externalDeny)

// Export configured server
export const server = setupServer(...handlers)

// Start MSW
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error'
  })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
