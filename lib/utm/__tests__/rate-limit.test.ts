/**
 * @jest-environment node
 */
import { 
  checkRateLimit, 
  withRateLimit, 
  resetRateLimit, 
  getRateLimitStatus 
} from '../rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset rate limits before each test
    resetRateLimit('127.0.0.1')
    resetRateLimit('192.168.1.1')
  })
  
  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const ip = '127.0.0.1'
      
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(ip)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(9 - i)
      }
    })
    
    it('should block requests over limit', () => {
      const ip = '127.0.0.1'
      
      // Use up all requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip)
      }
      
      // Next request should be blocked
      const result = checkRateLimit(ip)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })
    
    it('should track different IPs separately', () => {
      const ip1 = '127.0.0.1'
      const ip2 = '192.168.1.1'
      
      // Use up all requests for IP1
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip1)
      }
      
      // IP2 should still be allowed
      const result = checkRateLimit(ip2)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
    })
    
    it('should reset after time window', async () => {
      const ip = '127.0.0.1'
      
      // Mock time to test window expiration
      const originalDateNow = Date.now
      let currentTime = originalDateNow()
      Date.now = jest.fn(() => currentTime)
      
      // Use up all requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip)
      }
      
      // Should be blocked
      expect(checkRateLimit(ip).allowed).toBe(false)
      
      // Advance time by 61 seconds (past the 1-minute window)
      currentTime += 61 * 1000
      
      // Should be allowed again
      const result = checkRateLimit(ip)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
      
      // Restore Date.now
      Date.now = originalDateNow
    })
  })
  
  describe('withRateLimit middleware', () => {
    it('should allow requests within limit', async () => {
      const handler = jest.fn().mockResolvedValue(new Response('OK'))
      const rateLimitedHandler = withRateLimit(handler)
      
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      })
      
      const response = await rateLimitedHandler(req)
      
      expect(handler).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9')
    })
    
    it('should block requests over limit', async () => {
      const handler = jest.fn().mockResolvedValue(new Response('OK'))
      const rateLimitedHandler = withRateLimit(handler)
      
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      })
      
      // Use up rate limit
      for (let i = 0; i < 10; i++) {
        await rateLimitedHandler(req)
      }
      
      // Next request should be blocked
      const response = await rateLimitedHandler(req)
      
      expect(handler).toHaveBeenCalledTimes(10) // Not called for blocked request
      expect(response.status).toBe(429)
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('Retry-After')).toBeDefined()
      
      const body = await response.json()
      expect(body.error).toBe('Too many requests')
    })
    
    it('should extract IP from various headers', async () => {
      const handler = jest.fn().mockResolvedValue(new Response('OK'))
      const rateLimitedHandler = withRateLimit(handler)
      
      // Test x-forwarded-for
      let req = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '10.0.0.1, 192.168.1.1' },
      })
      await rateLimitedHandler(req)
      
      // Test x-real-ip
      req = new Request('http://localhost/api/test', {
        headers: { 'x-real-ip': '10.0.0.2' },
      })
      await rateLimitedHandler(req)
      
      expect(handler).toHaveBeenCalledTimes(2)
    })
  })
  
  describe('getRateLimitStatus', () => {
    it('should return current rate limit status', () => {
      const ip = '127.0.0.1'
      
      // Use some requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip)
      }
      
      const status = getRateLimitStatus(ip)
      expect(status.allowed).toBe(true)
      expect(status.remaining).toBe(5)
      expect(status.resetAt).toBeGreaterThan(Date.now())
    })
    
    it('should return correct status for new IP', () => {
      const status = getRateLimitStatus('new-ip')
      expect(status.allowed).toBe(true)
      expect(status.remaining).toBe(10)
    })
  })
  
  describe('resetRateLimit', () => {
    it('should reset rate limit for an IP', () => {
      const ip = '127.0.0.1'
      
      // Use up all requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip)
      }
      
      expect(checkRateLimit(ip).allowed).toBe(false)
      
      // Reset
      resetRateLimit(ip)
      
      // Should be allowed again
      expect(checkRateLimit(ip).allowed).toBe(true)
      expect(checkRateLimit(ip).remaining).toBe(8)
    })
  })
})