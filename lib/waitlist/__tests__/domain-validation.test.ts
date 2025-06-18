/**
 * @jest-environment node
 */
import {
  normalizeDomain,
  validateEmail,
  getDomainSuggestion,
  validateDomain,
  clearExpiredCache,
} from '../domain-validation'

// Mock fetch for DNS queries
global.fetch = jest.fn()

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  captureError: jest.fn(),
  trackEvent: jest.fn(),
}))

describe('Domain Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear cache between tests
    clearExpiredCache()
  })
  
  describe('normalizeDomain', () => {
    it('should remove www prefix', () => {
      expect(normalizeDomain('www.example.com')).toBe('example.com')
      expect(normalizeDomain('WWW.EXAMPLE.COM')).toBe('example.com')
    })
    
    it('should remove protocol', () => {
      expect(normalizeDomain('https://example.com')).toBe('example.com')
      expect(normalizeDomain('http://example.com')).toBe('example.com')
    })
    
    it('should remove path and query params', () => {
      expect(normalizeDomain('example.com/path')).toBe('example.com')
      expect(normalizeDomain('example.com/path?query=1')).toBe('example.com')
    })
    
    it('should remove port', () => {
      expect(normalizeDomain('example.com:8080')).toBe('example.com')
    })
    
    it('should convert to lowercase', () => {
      expect(normalizeDomain('Example.COM')).toBe('example.com')
    })
    
    it('should trim whitespace', () => {
      expect(normalizeDomain('  example.com  ')).toBe('example.com')
    })
    
    it('should handle all transformations combined', () => {
      expect(normalizeDomain('  https://WWW.Example.COM:8080/path?q=1  ')).toBe('example.com')
    })
  })
  
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('user.name@example.com')).toBe(true)
      expect(validateEmail('user+tag@example.co.uk')).toBe(true)
      expect(validateEmail('user123@subdomain.example.com')).toBe(true)
    })
    
    it('should reject invalid email formats', () => {
      expect(validateEmail('notanemail')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('user@@example.com')).toBe(false)
      expect(validateEmail('user@example')).toBe(false)
    })
    
    it('should reject emails with consecutive dots', () => {
      expect(validateEmail('user..name@example.com')).toBe(false)
      expect(validateEmail('user@example..com')).toBe(false)
    })
    
    it('should reject emails starting or ending with dots', () => {
      expect(validateEmail('.user@example.com')).toBe(false)
      expect(validateEmail('user.@example.com')).toBe(false)
      expect(validateEmail('user@.example.com')).toBe(false)
      expect(validateEmail('user@example.com.')).toBe(false)
    })
    
    it('should enforce length limits', () => {
      const longLocal = 'a'.repeat(65) + '@example.com'
      expect(validateEmail(longLocal)).toBe(false)
      
      const longDomain = 'user@' + 'a'.repeat(256) + '.com'
      expect(validateEmail(longDomain)).toBe(false)
    })
  })
  
  describe('getDomainSuggestion', () => {
    it('should suggest corrections for common typos', () => {
      expect(getDomainSuggestion('gmial.com')).toBe('gmail.com')
      expect(getDomainSuggestion('yahooo.com')).toBe('yahoo.com')
      expect(getDomainSuggestion('hotmial.com')).toBe('hotmail.com')
      expect(getDomainSuggestion('outlok.com')).toBe('outlook.com')
    })
    
    it('should suggest corrections for TLD typos', () => {
      expect(getDomainSuggestion('example.con')).toBe('example.com')
      expect(getDomainSuggestion('example.comm')).toBe('example.com')
      expect(getDomainSuggestion('example.og')).toBe('example.org')
      expect(getDomainSuggestion('example.met')).toBe('example.net')
    })
    
    it('should normalize domain before checking', () => {
      expect(getDomainSuggestion('WWW.GMIAL.COM')).toBe('gmail.com')
      expect(getDomainSuggestion('https://yahooo.com')).toBe('yahoo.com')
    })
    
    it('should return undefined for domains without typos', () => {
      expect(getDomainSuggestion('example.com')).toBeUndefined()
      expect(getDomainSuggestion('valid.org')).toBeUndefined()
    })
  })
  
  describe('validateDomain', () => {
    it('should reject invalid domain formats', async () => {
      const shortDomain = await validateDomain('ab')
      expect(shortDomain.isValid).toBe(false)
      expect(shortDomain.error).toBe('Domain too short')
      
      const invalidChars = await validateDomain('exam ple.com')
      expect(invalidChars.isValid).toBe(false)
      expect(invalidChars.error).toBe('Invalid characters in domain')
      
      const noDot = await validateDomain('examplecom')
      expect(noDot.isValid).toBe(false)
      expect(noDot.error).toBe('Invalid domain format')
    })
    
    it('should validate domain with successful DNS lookup', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Status: 0,
          Answer: [{ data: '93.184.216.34' }],
        }),
      } as Response)
      
      const result = await validateDomain('example.com')
      expect(result.isValid).toBe(true)
      expect(result.normalizedDomain).toBe('example.com')
      expect(result.suggestion).toBeUndefined()
    })
    
    it('should handle failed DNS lookup', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Status: 0,
          Answer: [],
        }),
      } as Response)
      
      const result = await validateDomain('nonexistent.com')
      expect(result.isValid).toBe(false)
      expect(result.normalizedDomain).toBe('nonexistent.com')
    })
    
    it('should provide suggestion for typos with failed DNS', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Status: 0,
          Answer: [],
        }),
      } as Response)
      
      const result = await validateDomain('gmial.com')
      expect(result.isValid).toBe(false)
      expect(result.suggestion).toBe('gmail.com')
    })
    
    it('should cache DNS results', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Status: 0,
          Answer: [{ data: '93.184.216.34' }],
        }),
      } as Response)
      
      // First call - should hit DNS
      const result1 = await validateDomain('cached.com')
      expect(result1.isValid).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      
      // Second call - should use cache
      const result2 = await validateDomain('cached.com')
      expect(result2.isValid).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1) // Still only 1 call
    })
    
    it('should fallback to Google DNS if Cloudflare fails', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      
      // First call to Cloudflare fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      // Second call to Google succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Status: 0,
          Answer: [{ data: '93.184.216.34' }],
        }),
      } as Response)
      
      const result = await validateDomain('fallback.com')
      expect(result.isValid).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
      
      // Check that second call was to Google DNS
      const secondCall = mockFetch.mock.calls[1][0] as string
      expect(secondCall).toContain('dns.google')
    })
    
    it('should handle complete DNS failure gracefully', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      const result = await validateDomain('error.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Unable to validate domain')
    })
  })
})