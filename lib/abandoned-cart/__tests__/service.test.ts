import { AbandonedCartService } from '../service'
import { prisma } from '@/lib/db'
import { sendCartRecoveryEmail } from '@/lib/email/email-service'
import * as tracker from '../tracker'
import type { Stripe } from 'stripe'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    abandonedCart: {
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    analyticsEvent: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/email/email-service', () => ({
  sendCartRecoveryEmail: jest.fn(),
}))

jest.mock('../tracker', () => ({
  trackCheckoutSession: jest.fn(),
  markSessionCompleted: jest.fn(),
  markCartRecovered: jest.fn(),
}))

describe('AbandonedCartService', () => {
  let service: AbandonedCartService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new AbandonedCartService({ baseUrl: 'https://test.com' })
  })

  describe('trackAbandonedSession', () => {
    it('should track abandoned session', async () => {
      const mockSession = {
        id: 'cs_test_123',
        amount_total: 9900,
      } as Stripe.Checkout.Session

      ;(tracker.trackCheckoutSession as jest.Mock).mockResolvedValue({
        success: true,
        recoveryToken: 'recovery-123',
      })

      const result = await service.trackAbandonedSession({
        session: mockSession,
        businessId: 'business-123',
        utmToken: 'utm-123',
      })

      expect(tracker.trackCheckoutSession).toHaveBeenCalledWith({
        session: mockSession,
        businessId: 'business-123',
        utmToken: 'utm-123',
      })
      expect(result).toEqual({ success: true, recoveryToken: 'recovery-123' })
    })
  })

  describe('checkAbandoned', () => {
    it('should find and process abandoned carts', async () => {
      const mockCarts = [
        {
          id: 'cart-1',
          customerEmail: 'test1@example.com',
          business: { name: 'Business 1' },
          amount: 9900,
          currency: 'usd',
          recoveryToken: 'token-1',
          sessionExpiresAt: new Date(Date.now() + 86400000),
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: 'cart-2',
          customerEmail: null, // No email
          business: { name: 'Business 2' },
          amount: 9900,
          currency: 'usd',
          recoveryToken: 'token-2',
          sessionExpiresAt: new Date(Date.now() + 86400000),
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
      ]

      ;(prisma.abandonedCart.findMany as jest.Mock).mockResolvedValue(mockCarts)
      ;(sendCartRecoveryEmail as jest.Mock).mockResolvedValue({ success: true })
      ;(prisma.abandonedCart.update as jest.Mock).mockResolvedValue({})

      const result = await service.checkAbandoned()

      expect(result.processed).toBe(2)
      expect(result.results).toHaveLength(2)
      expect(result.results[0]).toEqual({ cartId: 'cart-1', success: true })
      expect(result.results[1]).toEqual({
        cartId: 'cart-2',
        success: false,
        reason: 'no_email',
      })

      // Should only send email to cart with email address
      expect(sendCartRecoveryEmail).toHaveBeenCalledTimes(1)
      expect(sendCartRecoveryEmail).toHaveBeenCalledWith({
        to: 'test1@example.com',
        businessName: 'Business 1',
        amount: '99.00',
        currency: 'USD',
        recoveryUrl: expect.stringContaining('/purchase/recover?token=token-1'),
        expiresAt: expect.any(Date),
      })
    })

    it('should handle email sending errors', async () => {
      const mockCart = {
        id: 'cart-1',
        customerEmail: 'test@example.com',
        business: { name: 'Business 1' },
        amount: 9900,
        currency: 'usd',
        recoveryToken: 'token-1',
        sessionExpiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      }

      ;(prisma.abandonedCart.findMany as jest.Mock).mockResolvedValue([
        mockCart,
      ])
      ;(sendCartRecoveryEmail as jest.Mock).mockRejectedValue(
        new Error('Email service error')
      )

      const result = await service.checkAbandoned()

      expect(result.processed).toBe(1)
      expect(result.results[0]).toEqual({
        cartId: 'cart-1',
        success: false,
        error: expect.any(Error),
      })
    })
  })

  describe('sendRecoveryEmail', () => {
    it('should send recovery email and update cart', async () => {
      const mockCart = {
        id: 'cart-1',
        customerEmail: 'test@example.com',
        business: { name: 'Test Business' },
        amount: 9900,
        currency: 'usd',
        recoveryToken: 'recovery-123',
        sessionExpiresAt: new Date(Date.now() + 86400000),
        recoveryEmailSent: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      }

      ;(sendCartRecoveryEmail as jest.Mock).mockResolvedValue({ success: true })
      ;(prisma.abandonedCart.update as jest.Mock).mockResolvedValue({})
      ;(prisma.analyticsEvent.create as jest.Mock).mockResolvedValue({})

      await service.sendRecoveryEmail(mockCart)

      expect(sendCartRecoveryEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        businessName: 'Test Business',
        amount: '99.00',
        currency: 'USD',
        recoveryUrl: expect.stringContaining(
          '/purchase/recover?token=recovery-123'
        ),
        expiresAt: expect.any(Date),
      })

      expect(prisma.abandonedCart.update).toHaveBeenCalledWith({
        where: { id: 'cart-1' },
        data: {
          recoveryEmailSent: true,
          emailSentAt: expect.any(Date),
        },
      })

      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: {
          eventName: 'abandoned_cart_recovery_email_sent',
          properties: expect.objectContaining({
            cartId: 'cart-1',
            amount: 9900,
            currency: 'usd',
          }),
        },
      })
    })

    it('should throw error if recovery email already sent', async () => {
      const mockCart = {
        id: 'cart-1',
        customerEmail: 'test@example.com',
        recoveryEmailSent: true,
      }

      await expect(service.sendRecoveryEmail(mockCart)).rejects.toThrow(
        'Recovery email already sent for this cart'
      )
    })
  })

  describe('markRecovered', () => {
    it('should mark cart as recovered', async () => {
      const mockCart = {
        id: 'cart-1',
        stripeSessionId: 'cs_test_123',
        recovered: false,
        emailSentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      }

      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue(
        mockCart
      )
      ;(tracker.markCartRecovered as jest.Mock).mockResolvedValue({
        success: true,
      })
      ;(prisma.analyticsEvent.create as jest.Mock).mockResolvedValue({})

      const result = await service.markRecovered('recovery-123')

      expect(result).toEqual({ success: true, stripeSessionId: 'cs_test_123' })
      expect(tracker.markCartRecovered).toHaveBeenCalledWith('cart-1')
    })

    it('should handle already recovered carts', async () => {
      const mockCart = {
        id: 'cart-1',
        stripeSessionId: 'cs_test_123',
        recovered: true,
      }

      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue(
        mockCart
      )

      const result = await service.markRecovered('recovery-123')

      expect(result).toEqual({ alreadyRecovered: true })
      expect(tracker.markCartRecovered).not.toHaveBeenCalled()
    })

    it('should throw error for invalid token', async () => {
      ;(prisma.abandonedCart.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(service.markRecovered('invalid-token')).rejects.toThrow(
        'Invalid recovery token'
      )
    })
  })

  describe('handlePaymentSuccess', () => {
    it('should mark session as completed', async () => {
      ;(tracker.markSessionCompleted as jest.Mock).mockResolvedValue({
        success: true,
      })

      await service.handlePaymentSuccess('cs_test_123')

      expect(tracker.markSessionCompleted).toHaveBeenCalledWith('cs_test_123')
    })
  })

  describe('getMetrics', () => {
    it('should return comprehensive metrics', async () => {
      ;(prisma.abandonedCart.count as jest.Mock)
        .mockResolvedValueOnce(100) // total abandoned
        .mockResolvedValueOnce(25) // total recovered
        .mockResolvedValueOnce(80) // total emails sent
      ;(prisma.abandonedCart.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: 747500 } }) // revenue lost
        .mockResolvedValueOnce({ _sum: { amount: 247500 } }) // revenue recovered

      const metrics = await service.getMetrics(30)

      expect(metrics).toEqual({
        totalAbandoned: 100,
        totalRecovered: 25,
        totalEmailsSent: 80,
        totalRevenueLost: 7475,
        totalRevenueRecovered: 2475,
        recoveryRate: 31.25,
        period: '30 days',
      })
    })

    it('should handle zero values gracefully', async () => {
      ;(prisma.abandonedCart.count as jest.Mock).mockResolvedValue(0)
      ;(prisma.abandonedCart.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: null },
      })

      const metrics = await service.getMetrics(7)

      expect(metrics).toEqual({
        totalAbandoned: 0,
        totalRecovered: 0,
        totalEmailsSent: 0,
        totalRevenueLost: 0,
        totalRevenueRecovered: 0,
        recoveryRate: 0,
        period: '7 days',
      })
    })
  })
})
