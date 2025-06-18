import {
  fetchBusinessByUTM,
  createCheckoutSession,
  markUTMAsUsed,
  getReportPreview,
} from '../purchase-service'
import { prisma } from '@/lib/db'
import { generateUTMToken, createUTMParameter } from '@/lib/utm/crypto'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    business: {
      findUnique: jest.fn(),
    },
    utmToken: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    purchase: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/utm/crypto')

describe('Purchase Service', () => {
  const mockBusiness = {
    id: 'business-123',
    domain: 'example.com',
    name: 'Example Business',
    reportData: null,
    createdAt: new Date(),
  }

  const mockUTMPayload = {
    businessId: 'business-123',
    timestamp: Date.now(),
    nonce: 'test-nonce',
    expires: Date.now() + 24 * 60 * 60 * 1000,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchBusinessByUTM', () => {
    it('should return business data for valid UTM', async () => {
      const mockToken = { payload: 'payload', signature: 'signature' }
      const utm = 'payload.signature'

      ;(
        require('@/lib/utm/crypto').validateUTMToken as jest.Mock
      ).mockResolvedValue({
        valid: true,
        payload: mockUTMPayload,
      })
      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue(mockBusiness)
      ;(prisma.utmToken.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await fetchBusinessByUTM(utm)

      expect(result).toEqual({
        business: mockBusiness,
        utm,
        isValid: true,
      })

      expect(prisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: mockUTMPayload.businessId },
      })
    })

    it('should return null for invalid UTM', async () => {
      ;(
        require('@/lib/utm/crypto').validateUTMToken as jest.Mock
      ).mockResolvedValue({
        valid: false,
        reason: 'invalid_signature',
      })

      const result = await fetchBusinessByUTM('invalid.utm')

      expect(result).toBeNull()
      expect(prisma.business.findUnique).not.toHaveBeenCalled()
    })

    it('should return isValid false for used UTM token', async () => {
      ;(
        require('@/lib/utm/crypto').validateUTMToken as jest.Mock
      ).mockResolvedValue({
        valid: true,
        payload: mockUTMPayload,
      })
      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue(mockBusiness)
      ;(prisma.utmToken.findUnique as jest.Mock).mockResolvedValue({
        nonce: 'test-nonce',
        usedAt: new Date(),
      })

      const result = await fetchBusinessByUTM('payload.signature')

      expect(result).toEqual({
        business: mockBusiness,
        utm: 'payload.signature',
        isValid: false,
      })
    })

    it('should handle database errors gracefully', async () => {
      ;(
        require('@/lib/utm/crypto').validateUTMToken as jest.Mock
      ).mockResolvedValue({
        valid: true,
        payload: mockUTMPayload,
      })
      ;(prisma.business.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await fetchBusinessByUTM('payload.signature')

      expect(result).toBeNull()
    })
  })

  describe('createCheckoutSession', () => {
    it('should create a checkout session', async () => {
      const mockPurchase = {
        id: 'purchase-123',
        businessId: 'business-123',
        stripeSessionId: 'cs_test_123456',
        amountCents: 9900,
        status: 'pending',
        metadata: {},
        createdAt: new Date(),
      }

      ;(prisma.purchase.create as jest.Mock).mockResolvedValue(mockPurchase)

      const result = await createCheckoutSession('business-123', 'utm-token')

      expect(result).toEqual({
        id: 'cs_test_123456',
        url: '/checkout?session_id=cs_test_123456',
        amountCents: 9900,
      })

      expect(prisma.purchase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          businessId: 'business-123',
          amountCents: 9900,
          status: 'pending',
          metadata: expect.objectContaining({
            utm: 'utm-token',
          }),
        }),
      })
    })

    it('should handle errors gracefully', async () => {
      ;(prisma.purchase.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await createCheckoutSession('business-123', 'utm-token')

      expect(result).toBeNull()
    })
  })

  describe('markUTMAsUsed', () => {
    it('should mark UTM token as used', async () => {
      ;(
        require('@/lib/utm/crypto').validateUTMToken as jest.Mock
      ).mockResolvedValue({
        valid: true,
        payload: mockUTMPayload,
      })
      ;(prisma.utmToken.update as jest.Mock).mockResolvedValue({
        nonce: 'test-nonce',
        usedAt: new Date(),
      })

      const result = await markUTMAsUsed('payload.signature')

      expect(result).toBe(true)
      expect(prisma.utmToken.update).toHaveBeenCalledWith({
        where: { nonce: mockUTMPayload.nonce },
        data: { usedAt: expect.any(Date) },
      })
    })

    it('should return false for invalid UTM', async () => {
      ;(
        require('@/lib/utm/crypto').validateUTMToken as jest.Mock
      ).mockResolvedValue({
        valid: false,
      })

      const result = await markUTMAsUsed('invalid.utm')

      expect(result).toBe(false)
      expect(prisma.utmToken.update).not.toHaveBeenCalled()
    })
  })

  describe('getReportPreview', () => {
    it('should generate report preview data', () => {
      const result = getReportPreview(mockBusiness)

      expect(result).toMatchObject({
        domain: 'example.com',
        metrics: {
          performanceScore: expect.any(Number),
          seoScore: expect.any(Number),
          securityScore: expect.any(Number),
          accessibilityScore: expect.any(Number),
        },
        improvements: expect.arrayContaining([expect.any(String)]),
        estimatedValue: '$2,500 - $5,000 per month',
      })

      // Check score ranges
      expect(result.metrics.performanceScore).toBeGreaterThanOrEqual(60)
      expect(result.metrics.performanceScore).toBeLessThanOrEqual(90)

      expect(result.metrics.seoScore).toBeGreaterThanOrEqual(70)
      expect(result.metrics.seoScore).toBeLessThanOrEqual(95)

      expect(result.metrics.securityScore).toBeGreaterThanOrEqual(75)
      expect(result.metrics.securityScore).toBeLessThanOrEqual(95)

      expect(result.metrics.accessibilityScore).toBeGreaterThanOrEqual(65)
      expect(result.metrics.accessibilityScore).toBeLessThanOrEqual(95)

      // Should have exactly 3 improvements
      expect(result.improvements).toHaveLength(3)
    })
  })
})
