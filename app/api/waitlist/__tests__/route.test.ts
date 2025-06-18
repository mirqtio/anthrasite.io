import { POST, GET } from '../route'
import { NextRequest } from 'next/server'
import { validateDomain, validateEmail } from '@/lib/waitlist/domain-validation'
import { addToWaitlist, getWaitlistPosition } from '@/lib/waitlist/service'

// Mock dependencies
jest.mock('@/lib/waitlist/domain-validation')
jest.mock('@/lib/waitlist/service')
jest.mock('@/lib/utm/rate-limit', () => ({
  withRateLimit: (handler: any) => handler,
}))
jest.mock('@/lib/monitoring/api-middleware', () => ({
  withMonitoring: (handler: any) => handler,
}))

describe('Waitlist API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/waitlist', () => {
    it('should successfully add new entry to waitlist', async () => {
      const requestData = {
        domain: 'example.com',
        email: 'test@example.com',
        referralSource: 'organic',
      }

      // Mock validations
      ;(validateEmail as jest.Mock).mockReturnValue(true)
      ;(validateDomain as jest.Mock).mockResolvedValue({
        isValid: true,
        normalizedDomain: 'example.com',
      })

      // Mock successful addition
      ;(addToWaitlist as jest.Mock).mockResolvedValue({
        success: true,
        position: 100,
      })

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        position: 100,
        normalizedDomain: 'example.com',
      })

      expect(validateEmail).toHaveBeenCalledWith('test@example.com')
      expect(validateDomain).toHaveBeenCalledWith('example.com')
      expect(addToWaitlist).toHaveBeenCalledWith({
        domain: 'example.com',
        email: 'test@example.com',
        referralSource: 'organic',
      })
    })

    it('should return error when fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          domain: 'example.com',
          // missing email
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Domain and email are required',
      })
    })

    it('should return error for invalid email', async () => {
      ;(validateEmail as jest.Mock).mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          domain: 'example.com',
          email: 'invalid-email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid email format',
      })
    })

    it('should return error for invalid domain', async () => {
      ;(validateEmail as jest.Mock).mockReturnValue(true)
      ;(validateDomain as jest.Mock).mockResolvedValue({
        isValid: false,
        error: 'Domain not found',
        suggestion: 'example.com',
      })

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          domain: 'exampl.com',
          email: 'test@example.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Domain not found',
        suggestion: 'example.com',
      })
    })

    it('should handle service errors gracefully', async () => {
      ;(validateEmail as jest.Mock).mockReturnValue(true)
      ;(validateDomain as jest.Mock).mockResolvedValue({
        isValid: true,
        normalizedDomain: 'example.com',
      })
      ;(addToWaitlist as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error',
      })

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          domain: 'example.com',
          email: 'test@example.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Database error',
      })
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Internal server error',
      })
    })
  })

  describe('GET /api/waitlist', () => {
    it('should return position for existing domain', async () => {
      ;(getWaitlistPosition as jest.Mock).mockResolvedValue(50)

      const request = new NextRequest(
        'http://localhost:3000/api/waitlist?domain=example.com'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        position: 50,
      })
      expect(getWaitlistPosition).toHaveBeenCalledWith('example.com')
    })

    it('should return error when domain is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Domain is required',
      })
    })

    it('should return 404 when domain not found', async () => {
      ;(getWaitlistPosition as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/waitlist?domain=notfound.com'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({
        error: 'Domain not found in waitlist',
      })
    })

    it('should handle service errors', async () => {
      ;(getWaitlistPosition as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/waitlist?domain=example.com'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Internal server error',
      })
    })
  })
})
