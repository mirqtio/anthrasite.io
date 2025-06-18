import { trackCheckoutSession, markSessionCompleted, getAbandonedCartByToken } from '../tracker'
import { AbandonedCartService } from '../service'
import { prisma } from '@/lib/db'
import type { Stripe } from 'stripe'

// This is an integration test that tests the full flow
// In a real environment, you would use a test database

// Mock Prisma with in-memory storage
const mockDatabase = {
  abandonedCarts: new Map(),
  analyticsEvents: [],
}

jest.mock('@/lib/db', () => ({
  prisma: {
    abandonedCart: {
      create: jest.fn((args) => {
        const cart = {
          id: `cart-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockDatabase.abandonedCarts.set(cart.id, cart)
        return Promise.resolve(cart)
      }),
      findMany: jest.fn((args) => {
        const carts = Array.from(mockDatabase.abandonedCarts.values())
        let filtered = carts

        // Apply where clause
        if (args?.where) {
          filtered = carts.filter(cart => {
            if (args.where.createdAt?.lte && cart.createdAt > args.where.createdAt.lte) return false
            if (args.where.recoveryEmailSent === false && cart.recoveryEmailSent) return false
            if (args.where.recovered === false && cart.recovered) return false
            if (args.where.sessionExpiresAt?.gt && cart.sessionExpiresAt <= args.where.sessionExpiresAt.gt) return false
            return true
          })
        }

        // Include relations
        if (args?.include?.business) {
          filtered = filtered.map(cart => ({
            ...cart,
            business: { id: cart.businessId, name: 'Test Business', domain: 'test.com' },
          }))
        }

        return Promise.resolve(filtered)
      }),
      findUnique: jest.fn((args) => {
        if (args.where.stripeSessionId) {
          const cart = Array.from(mockDatabase.abandonedCarts.values()).find(
            c => c.stripeSessionId === args.where.stripeSessionId
          )
          return Promise.resolve(cart || null)
        }
        if (args.where.recoveryToken) {
          const cart = Array.from(mockDatabase.abandonedCarts.values()).find(
            c => c.recoveryToken === args.where.recoveryToken
          )
          if (cart && args.include?.business) {
            return Promise.resolve({
              ...cart,
              business: { id: cart.businessId, name: 'Test Business', domain: 'test.com' },
            })
          }
          return Promise.resolve(cart || null)
        }
        return Promise.resolve(null)
      }),
      update: jest.fn((args) => {
        const carts = Array.from(mockDatabase.abandonedCarts.values())
        const cart = carts.find(c => c.id === args.where.id)
        if (cart) {
          Object.assign(cart, args.data)
          cart.updatedAt = new Date()
          return Promise.resolve(cart)
        }
        throw new Error('Cart not found')
      }),
      deleteMany: jest.fn((args) => {
        const carts = Array.from(mockDatabase.abandonedCarts.entries())
        let deleted = 0
        for (const [id, cart] of carts) {
          if (cart.stripeSessionId === args.where.stripeSessionId) {
            mockDatabase.abandonedCarts.delete(id)
            deleted++
          }
        }
        return Promise.resolve({ count: deleted })
      }),
    },
    analyticsEvent: {
      create: jest.fn((args) => {
        const event = { id: `event-${Date.now()}`, ...args.data }
        mockDatabase.analyticsEvents.push(event)
        return Promise.resolve(event)
      }),
    },
  },
}))

// Mock email service
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-123' }),
}))

describe('Abandoned Cart Recovery Integration', () => {
  let service: AbandonedCartService

  beforeEach(() => {
    // Clear mock database
    mockDatabase.abandonedCarts.clear()
    mockDatabase.analyticsEvents = []
    jest.clearAllMocks()
    
    service = new AbandonedCartService({ baseUrl: 'https://test.com' })
  })

  it('should handle complete abandoned cart recovery flow', async () => {
    // 1. Create a checkout session
    const mockSession = {
      id: 'cs_test_123',
      expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      customer_email: 'customer@example.com',
      amount_total: 9900,
      currency: 'usd',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    } as Stripe.Checkout.Session

    // Track the session
    const trackResult = await trackCheckoutSession({
      session: mockSession,
      businessId: 'business-123',
      utmToken: 'utm-token-123',
    })

    expect(trackResult.success).toBe(true)
    expect(trackResult.recoveryToken).toBeDefined()

    // 2. Simulate time passing (3+ hours)
    const abandonedCart = Array.from(mockDatabase.abandonedCarts.values())[0]
    abandonedCart.createdAt = new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago

    // 3. Run abandoned cart check
    const checkResult = await service.checkAbandoned()

    expect(checkResult.processed).toBe(1)
    expect(checkResult.results[0].success).toBe(true)

    // Verify email was marked as sent
    const updatedCart = Array.from(mockDatabase.abandonedCarts.values())[0]
    expect(updatedCart.recoveryEmailSent).toBe(true)
    expect(updatedCart.emailSentAt).toBeDefined()

    // 4. Customer clicks recovery link
    const recoveryToken = trackResult.recoveryToken!
    const cartByToken = await getAbandonedCartByToken(recoveryToken)
    expect(cartByToken).toBeDefined()
    expect(cartByToken?.stripeSessionId).toBe('cs_test_123')

    // 5. Mark as recovered
    const recoverResult = await service.markRecovered(recoveryToken)
    expect(recoverResult.success).toBe(true)
    expect(recoverResult.stripeSessionId).toBe('cs_test_123')

    // Verify cart is marked as recovered
    const recoveredCart = Array.from(mockDatabase.abandonedCarts.values())[0]
    expect(recoveredCart.recovered).toBe(true)
    expect(recoveredCart.recoveredAt).toBeDefined()

    // 6. Verify analytics events were tracked
    const analyticsEvents = mockDatabase.analyticsEvents
    expect(analyticsEvents).toHaveLength(2)
    expect(analyticsEvents[0].eventName).toBe('abandoned_cart_recovery_email_sent')
    expect(analyticsEvents[1].eventName).toBe('abandoned_cart_recovered')
  })

  it('should handle payment completion flow', async () => {
    // 1. Create and track session
    const mockSession = {
      id: 'cs_test_456',
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      customer_email: 'customer@example.com',
      amount_total: 9900,
      currency: 'usd',
    } as Stripe.Checkout.Session

    await trackCheckoutSession({
      session: mockSession,
      businessId: 'business-456',
      utmToken: 'utm-token-456',
    })

    expect(mockDatabase.abandonedCarts.size).toBe(1)

    // 2. Customer completes payment
    await service.handlePaymentSuccess('cs_test_456')

    // Verify cart was removed (no longer abandoned)
    expect(mockDatabase.abandonedCarts.size).toBe(0)
  })

  it('should not send recovery emails for carts without email', async () => {
    // Create session without email
    const mockSession = {
      id: 'cs_test_789',
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      customer_email: null,
      amount_total: 9900,
      currency: 'usd',
    } as Stripe.Checkout.Session

    await trackCheckoutSession({
      session: mockSession,
      businessId: 'business-789',
    })

    // Make cart old enough
    const cart = Array.from(mockDatabase.abandonedCarts.values())[0]
    cart.createdAt = new Date(Date.now() - 4 * 60 * 60 * 1000)

    // Run check
    const checkResult = await service.checkAbandoned()

    expect(checkResult.processed).toBe(1)
    expect(checkResult.results[0].success).toBe(false)
    expect(checkResult.results[0].reason).toBe('no_email')
  })

  it('should not send recovery emails for expired sessions', async () => {
    // Create session that expires in 1 hour
    const mockSession = {
      id: 'cs_test_999',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      customer_email: 'customer@example.com',
      amount_total: 9900,
      currency: 'usd',
    } as Stripe.Checkout.Session

    await trackCheckoutSession({
      session: mockSession,
      businessId: 'business-999',
    })

    // Make cart old and expired
    const cart = Array.from(mockDatabase.abandonedCarts.values())[0]
    cart.createdAt = new Date(Date.now() - 4 * 60 * 60 * 1000)
    cart.sessionExpiresAt = new Date(Date.now() - 1000) // Expired

    // Run check
    const checkResult = await service.checkAbandoned()

    expect(checkResult.processed).toBe(0) // Should not process expired carts
  })
})