import { trackCheckoutSession, markSessionCompleted, isSessionRecoverable, getAbandonedCartByToken, markCartRecovered } from '../tracker'
import { prisma } from '@/lib/db'
import type { Stripe } from 'stripe'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    abandonedCart: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    business: {
      findUnique: jest.fn(),
    },
  },
}))

describe('Abandoned Cart Tracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('trackCheckoutSession', () => {
    it('should create an abandoned cart record', async () => {
      const mockSession = {
        id: 'cs_test_123',
        expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
        customer_email: 'test@example.com',
        amount_total: 9900,
        currency: 'usd',
      } as Stripe.Checkout.Session

      const businessId = 'business-123'
      const utmToken = 'utm-token-123'

      ;(prisma.abandonedCart.create as jest.Mock).mockResolvedValue({
        id: 'cart-123',
        stripeSessionId: mockSession.id,
        businessId,
        utmToken,
        customerEmail: mockSession.customer_email,
        amount: mockSession.amount_total,
        currency: mockSession.currency,
        recoveryToken: 'recovery-token-123',
        sessionExpiresAt: new Date(mockSession.expires_at * 1000),
      })

      const result = await trackCheckoutSession({
        session: mockSession,
        businessId,
        utmToken,
      })

      expect(result.success).toBe(true)
      expect(result.recoveryToken).toBeDefined()
      expect(prisma.abandonedCart.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          stripeSessionId: mockSession.id,
          businessId,
          utmToken,
          customerEmail: mockSession.customer_email,
          amount: mockSession.amount_total,
          currency: mockSession.currency,
          sessionExpiresAt: new Date(mockSession.expires_at * 1000),
        }),
      })
    })

    it('should handle errors gracefully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      } as Stripe.Checkout.Session

      ;(prisma.abandonedCart.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await trackCheckoutSession({
        session: mockSession,
        businessId: 'business-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('markSessionCompleted', () => {
    it('should delete abandoned cart record when session is completed', async () => {
      const stripeSessionId = 'cs_test_123'

      ;(prisma.abandonedCart.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })

      const result = await markSessionCompleted(stripeSessionId)

      expect(result.success).toBe(true)
      expect(prisma.abandonedCart.deleteMany).toHaveBeenCalledWith({
        where: { stripeSessionId },
      })
    })

    it('should handle errors gracefully', async () => {
      ;(prisma.abandonedCart.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await markSessionCompleted('cs_test_123')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('isSessionRecoverable', () => {
    it('should return true for recoverable sessions', async () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 24)

      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue({
        id: 'cart-123',
        stripeSessionId: 'cs_test_123',
        sessionExpiresAt: futureDate,
        recovered: false,
      })

      const result = await isSessionRecoverable('cs_test_123')

      expect(result).toBe(true)
    })

    it('should return false for expired sessions', async () => {
      const pastDate = new Date()
      pastDate.setHours(pastDate.getHours() - 1)

      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue({
        id: 'cart-123',
        stripeSessionId: 'cs_test_123',
        sessionExpiresAt: pastDate,
        recovered: false,
      })

      const result = await isSessionRecoverable('cs_test_123')

      expect(result).toBe(false)
    })

    it('should return false for recovered sessions', async () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 24)

      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue({
        id: 'cart-123',
        stripeSessionId: 'cs_test_123',
        sessionExpiresAt: futureDate,
        recovered: true,
      })

      const result = await isSessionRecoverable('cs_test_123')

      expect(result).toBe(false)
    })

    it('should return false for non-existent sessions', async () => {
      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await isSessionRecoverable('cs_test_123')

      expect(result).toBe(false)
    })
  })

  describe('getAbandonedCartByToken', () => {
    it('should return abandoned cart with business data', async () => {
      const mockCart = {
        id: 'cart-123',
        recoveryToken: 'recovery-token-123',
        business: {
          id: 'business-123',
          name: 'Test Business',
          domain: 'test.com',
        },
      }

      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue(mockCart)

      const result = await getAbandonedCartByToken('recovery-token-123')

      expect(result).toEqual(mockCart)
      expect(prisma.abandonedCart.findUnique).toHaveBeenCalledWith({
        where: { recoveryToken: 'recovery-token-123' },
        include: { business: true },
      })
    })

    it('should return null for invalid tokens', async () => {
      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getAbandonedCartByToken('invalid-token')

      expect(result).toBeNull()
    })
  })

  describe('markCartRecovered', () => {
    it('should mark cart as recovered', async () => {
      const cartId = 'cart-123'

      ;(prisma.abandonedCart.update as jest.Mock).mockResolvedValue({
        id: cartId,
        recovered: true,
        recoveredAt: new Date(),
      })

      const result = await markCartRecovered(cartId)

      expect(result.success).toBe(true)
      expect(prisma.abandonedCart.update).toHaveBeenCalledWith({
        where: { id: cartId },
        data: {
          recovered: true,
          recoveredAt: expect.any(Date),
        },
      })
    })

    it('should handle errors gracefully', async () => {
      ;(prisma.abandonedCart.update as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await markCartRecovered('cart-123')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})