import { POST } from '../route'
import { NextRequest } from 'next/server'
import { retrieveSession, createCheckoutSession } from '@/lib/stripe/checkout'
import { validateUTMToken } from '@/lib/utm/crypto'
import { prisma } from '@/lib/db'
import { trackEvent } from '@/lib/analytics/analytics-server'

// Mock dependencies
jest.mock('@/lib/stripe/checkout')
jest.mock('@/lib/utm/crypto')
jest.mock('@/lib/db', () => ({
  prisma: {
    business: {
      findUnique: jest.fn()
    }
  }
}))
jest.mock('@/lib/analytics/analytics-server')
jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue('localhost:3000')
  })
}))

describe('Recover Session API', () => {
  const mockUTMToken = 'valid-utm-token'
  const mockBusinessId = 'business-123'
  const mockSessionId = 'cs_test_123'

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mocks
    ;(validateUTMToken as jest.Mock).mockResolvedValue({
      valid: true,
      payload: { businessId: mockBusinessId }
    })
    
    ;(prisma.business.findUnique as jest.Mock).mockResolvedValue({
      id: mockBusinessId,
      name: 'Test Business',
      email: 'test@example.com'
    })
  })

  it('should successfully recover an existing open session', async () => {
    const mockSession = {
      id: mockSessionId,
      status: 'open',
      url: 'https://checkout.stripe.com/session/123'
    }
    
    ;(retrieveSession as jest.Mock).mockResolvedValue(mockSession)

    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: JSON.stringify({ utm: mockUTMToken, sessionId: mockSessionId })
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      sessionUrl: mockSession.url,
      sessionId: mockSession.id
    })
    
    expect(trackEvent).toHaveBeenCalledWith('checkout_recovery_attempt', {
      business_id: mockBusinessId,
      utm_token: mockUTMToken,
      has_session_id: true
    })
    
    expect(trackEvent).toHaveBeenCalledWith('checkout_recovery_success', {
      business_id: mockBusinessId,
      session_id: mockSessionId,
      recovery_type: 'existing_session'
    })
  })

  it('should create new session when existing session is not open', async () => {
    const closedSession = {
      id: mockSessionId,
      status: 'complete',
      url: null
    }
    
    const newSession = {
      id: 'cs_test_new',
      url: 'https://checkout.stripe.com/session/new'
    }
    
    ;(retrieveSession as jest.Mock).mockResolvedValue(closedSession)
    ;(createCheckoutSession as jest.Mock).mockResolvedValue(newSession)

    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: JSON.stringify({ utm: mockUTMToken, sessionId: mockSessionId })
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      sessionUrl: newSession.url,
      sessionId: newSession.id
    })
    
    expect(createCheckoutSession).toHaveBeenCalledWith({
      businessId: mockBusinessId,
      utmToken: mockUTMToken,
      customerEmail: 'test@example.com',
      baseUrl: 'http://localhost:3000'
    })
    
    expect(trackEvent).toHaveBeenCalledWith('checkout_recovery_success', {
      business_id: mockBusinessId,
      session_id: newSession.id,
      recovery_type: 'new_session'
    })
  })

  it('should create new session when no sessionId provided', async () => {
    const newSession = {
      id: 'cs_test_new',
      url: 'https://checkout.stripe.com/session/new'
    }
    
    ;(createCheckoutSession as jest.Mock).mockResolvedValue(newSession)

    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: JSON.stringify({ utm: mockUTMToken })
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      sessionUrl: newSession.url,
      sessionId: newSession.id
    })
    
    expect(retrieveSession).not.toHaveBeenCalled()
  })

  it('should handle invalid request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' })
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid request body' })
  })

  it('should handle invalid UTM token', async () => {
    ;(validateUTMToken as jest.Mock).mockResolvedValue({
      valid: false,
      payload: null
    })

    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: JSON.stringify({ utm: 'invalid-token' })
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid or expired UTM token' })
  })

  it('should handle missing business', async () => {
    ;(prisma.business.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: JSON.stringify({ utm: mockUTMToken })
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Business not found' })
  })

  it('should handle createCheckoutSession errors', async () => {
    ;(createCheckoutSession as jest.Mock).mockRejectedValue(new Error('Stripe error'))

    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: JSON.stringify({ utm: mockUTMToken })
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to recover checkout session' })
    
    expect(trackEvent).toHaveBeenCalledWith('checkout_recovery_failed', {
      error: 'Stripe error'
    })
  })

  it('should handle malformed JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: 'invalid json'
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to recover checkout session' })
  })

  it('should use production URL in production environment', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    const newSession = {
      id: 'cs_test_new',
      url: 'https://checkout.stripe.com/session/new'
    }
    
    ;(createCheckoutSession as jest.Mock).mockResolvedValue(newSession)

    const request = new NextRequest('http://localhost:3000/api/stripe/recover-session', {
      method: 'POST',
      body: JSON.stringify({ utm: mockUTMToken })
    })
    
    const response = await POST(request)
    await response.json()

    expect(response.status).toBe(200)
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'https://localhost:3000'
      })
    )
    
    process.env.NODE_ENV = originalEnv
  })
})