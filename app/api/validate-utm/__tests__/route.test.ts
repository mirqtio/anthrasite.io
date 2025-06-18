/**
 * @jest-environment node
 */
import { GET } from '../route'
import { validateUTMToken } from '@/lib/utm/crypto'
import { getUTMToken, markTokenUsed } from '@/lib/utm/storage'
import { prisma } from '@/lib/db'
import { trackEvent, sendAlert } from '@/lib/monitoring'
import { NextRequest } from 'next/server'

// Add a proper NextRequest mock for node environment
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    url: string
    method: string
    headers: Map<string, string>
    nextUrl: URL

    constructor(input: string | URL, init?: any) {
      const url = typeof input === 'string' ? new URL(input) : input
      this.url = url.toString()
      this.nextUrl = url
      this.method = init?.method || 'GET'
      this.headers = new Map()
      
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string)
        })
      }
    }
  },
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: {
          ...init?.headers,
          'content-type': 'application/json',
        },
      })
      return response
    },
  },
}))

// Mock dependencies
jest.mock('@/lib/utm/crypto')
jest.mock('@/lib/utm/storage')
jest.mock('@/lib/db', () => ({
  prisma: {
    business: {
      findUnique: jest.fn(),
    },
  },
}))
jest.mock('@/lib/monitoring', () => ({
  trackEvent: jest.fn(),
  sendAlert: jest.fn(),
  AlertType: {
    UTM_VALIDATION_FAILED: 'UTM_VALIDATION_FAILED',
  },
}))
jest.mock('@/lib/utm/rate-limit', () => ({
  withRateLimit: (handler: any) => handler,
}))
jest.mock('@/lib/monitoring/api-middleware', () => ({
  withMonitoring: (handler: any) => handler,
}))

describe('UTM Validation API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (utm?: string) => {
    const url = utm
      ? `http://localhost/api/validate-utm?utm=${utm}`
      : 'http://localhost/api/validate-utm'

    return new NextRequest(url, {
      method: 'GET',
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    })
  }

  describe('Valid UTM flow', () => {
    it('should validate and return business data for valid UTM', async () => {
      const mockUTM = 'valid-utm-token'
      const mockPayload = {
        businessId: 'business-123',
        nonce: 'nonce-123',
        timestamp: Date.now(),
        expires: Date.now() + 86400000,
      }

      ;(validateUTMToken as jest.Mock).mockReturnValue({
        valid: true,
        payload: mockPayload,
      })
      ;(getUTMToken as jest.Mock).mockResolvedValue({
        nonce: 'nonce-123',
        businessId: 'business-123',
        usedAt: null,
      })
      ;(markTokenUsed as jest.Mock).mockResolvedValue(true)
      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'business-123',
        name: 'Test Business',
        domain: 'example.com',
        reportData: { score: 85 },
      })

      const response = await GET(createMockRequest(mockUTM))
      const data = await response.json()

      if (response.status !== 200) {
        console.log('Response error:', data)
      }

      expect(response.status).toBe(200)
      expect(data).toEqual({
        valid: true,
        businessId: 'business-123',
        businessName: 'Test Business',
        reportData: { score: 85 },
      })

      expect(trackEvent).toHaveBeenCalledWith('utm.validation.success', {
        businessId: 'business-123',
        domain: 'example.com',
      })
    })
  })

  describe('Invalid UTM scenarios', () => {
    it('should return error for missing UTM parameter', async () => {
      const response = await GET(createMockRequest())
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        valid: false,
        error: 'Missing UTM parameter',
      })

      expect(trackEvent).toHaveBeenCalledWith(
        'utm.validation.missing_parameter'
      )
    })

    it('should handle invalid UTM format', async () => {
      ;(validateUTMToken as jest.Mock).mockReturnValue({
        valid: false,
        reason: 'invalid_format',
      })

      const response = await GET(createMockRequest('invalid-format'))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        valid: false,
        error: 'Invalid UTM format',
      })

      expect(trackEvent).toHaveBeenCalledWith('utm.validation.failed', {
        reason: 'invalid_format',
      })
    })

    it('should handle expired UTM with friendly message', async () => {
      ;(validateUTMToken as jest.Mock).mockReturnValue({
        valid: false,
        reason: 'expired',
      })

      const response = await GET(createMockRequest('expired-utm'))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        valid: false,
        error: 'This link has expired. Please request a new one.',
      })
    })

    it('should handle tampered UTM', async () => {
      ;(validateUTMToken as jest.Mock).mockReturnValue({
        valid: false,
        reason: 'invalid_signature',
      })

      const response = await GET(createMockRequest('tampered-utm'))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        valid: false,
        error: 'Invalid or tampered UTM',
      })
    })
  })

  describe('One-time use enforcement', () => {
    it('should reject already used tokens', async () => {
      const mockPayload = {
        businessId: 'business-123',
        nonce: 'used-nonce',
        timestamp: Date.now(),
        expires: Date.now() + 86400000,
      }

      ;(validateUTMToken as jest.Mock).mockReturnValue({
        valid: true,
        payload: mockPayload,
      })
      ;(getUTMToken as jest.Mock).mockResolvedValue({
        nonce: 'used-nonce',
        businessId: 'business-123',
        usedAt: new Date(),
      })

      const response = await GET(createMockRequest('used-utm'))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        valid: false,
        error: 'This link has already been used',
      })

      expect(trackEvent).toHaveBeenCalledWith(
        'utm.validation.token_already_used',
        {
          nonce: 'used-nonce',
          usedAt: expect.any(Date),
        }
      )
    })

    it('should handle race conditions', async () => {
      const mockPayload = {
        businessId: 'business-123',
        nonce: 'race-nonce',
        timestamp: Date.now(),
        expires: Date.now() + 86400000,
      }

      ;(validateUTMToken as jest.Mock).mockReturnValue({
        valid: true,
        payload: mockPayload,
      })
      ;(getUTMToken as jest.Mock).mockResolvedValue({
        nonce: 'race-nonce',
        businessId: 'business-123',
        usedAt: null,
      })
      ;(markTokenUsed as jest.Mock).mockResolvedValue(false) // Failed to mark

      const response = await GET(createMockRequest('race-utm'))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        valid: false,
        error: 'This link has already been used',
      })

      expect(trackEvent).toHaveBeenCalledWith('utm.validation.race_condition', {
        nonce: 'race-nonce',
      })
    })
  })

  describe('Business data handling', () => {
    it('should handle business not found', async () => {
      const mockPayload = {
        businessId: 'missing-business',
        nonce: 'nonce-123',
        timestamp: Date.now(),
        expires: Date.now() + 86400000,
      }

      ;(validateUTMToken as jest.Mock).mockReturnValue({
        valid: true,
        payload: mockPayload,
      })
      ;(getUTMToken as jest.Mock).mockResolvedValue({
        nonce: 'nonce-123',
        businessId: 'missing-business',
        usedAt: null,
      })
      ;(markTokenUsed as jest.Mock).mockResolvedValue(true)
      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await GET(createMockRequest('valid-utm'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({
        valid: false,
        error: 'Business not found',
      })

      expect(sendAlert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reason: 'business_not_found',
          businessId: 'missing-business',
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should handle internal errors gracefully', async () => {
      ;(validateUTMToken as jest.Mock).mockImplementation(() => {
        throw new Error('Crypto error')
      })

      const response = await GET(createMockRequest('error-utm'))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        valid: false,
        error: 'Internal server error',
      })

      expect(sendAlert).toHaveBeenCalled()
    })
  })
})
