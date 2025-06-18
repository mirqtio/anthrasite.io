/**
 * @jest-environment node
 */
import {
  generateNonce,
  createSignature,
  verifySignature,
  encodePayload,
  decodePayload,
  generateUTMToken,
  createUTMParameter,
  parseUTMParameter,
  validateUTMToken,
  generateUTMUrl,
  UTMPayload,
} from '../crypto'

describe('UTM Signing Service', () => {
  describe('generateNonce', () => {
    it('generates unique nonces', () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()
      
      expect(nonce1).toHaveLength(32) // 16 bytes = 32 hex chars
      expect(nonce2).toHaveLength(32)
      expect(nonce1).not.toBe(nonce2)
    })
  })
  
  describe('HMAC signature', () => {
    it('generates valid HMAC signature', async () => {
      const data = 'test-data'
      const signature = await createSignature(data)
      
      expect(signature).toBeTruthy()
      expect(signature).toMatch(/^[A-Za-z0-9_-]+$/) // base64url chars
    })
    
    it('generates consistent signatures for same data', async () => {
      const data = 'test-data'
      const sig1 = await createSignature(data)
      const sig2 = await createSignature(data)
      
      expect(sig1).toBe(sig2)
    })
    
    it('generates different signatures for different data', async () => {
      const sig1 = await createSignature('data1')
      const sig2 = await createSignature('data2')
      
      expect(sig1).not.toBe(sig2)
    })
  })
  
  describe('signature verification', () => {
    it('validates correct signatures', async () => {
      const data = 'test-data'
      const signature = await createSignature(data)
      
      expect(await verifySignature(data, signature)).toBe(true)
    })
    
    it('rejects invalid signatures', async () => {
      const data = 'test-data'
      const invalidSignature = 'invalid-signature'
      
      expect(await verifySignature(data, invalidSignature)).toBe(false)
    })
    
    it('rejects tampered data', async () => {
      const originalData = 'test-data'
      const signature = await createSignature(originalData)
      const tamperedData = 'tampered-data'
      
      expect(await verifySignature(tamperedData, signature)).toBe(false)
    })
  })
  
  describe('payload encoding', () => {
    it('encodes to URL-safe base64', () => {
      const payload: UTMPayload = {
        businessId: 'test-123',
        timestamp: Date.now(),
        nonce: 'test-nonce',
        expires: Date.now() + 86400000,
      }
      
      const encoded = encodePayload(payload)
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/) // base64url chars
    })
    
    it('decodes payload correctly', () => {
      const payload: UTMPayload = {
        businessId: 'test-123',
        timestamp: 1234567890,
        nonce: 'test-nonce',
        expires: 9876543210,
      }
      
      const encoded = encodePayload(payload)
      const decoded = decodePayload(encoded)
      
      expect(decoded).toEqual(payload)
    })
    
    it('returns null for invalid encoded data', () => {
      expect(decodePayload('invalid-base64!')).toBeNull()
      expect(decodePayload('')).toBeNull()
    })
  })
  
  describe('UTM token generation', () => {
    it('generates token with all required fields', async () => {
      const businessId = 'test-business-123'
      const token = await generateUTMToken(businessId)
      
      expect(token.payload).toBeTruthy()
      expect(token.signature).toBeTruthy()
      
      const payload = decodePayload(token.payload)
      expect(payload).toBeTruthy()
      expect(payload!.businessId).toBe(businessId)
      expect(payload!.timestamp).toBeLessThanOrEqual(Date.now())
      expect(payload!.nonce).toHaveLength(32)
      expect(payload!.expires).toBeGreaterThan(Date.now())
    })
    
    it('includes timestamp in payload', async () => {
      const before = Date.now()
      const token = await generateUTMToken('test')
      const after = Date.now()
      
      const payload = decodePayload(token.payload)!
      expect(payload.timestamp).toBeGreaterThanOrEqual(before)
      expect(payload.timestamp).toBeLessThanOrEqual(after)
    })
    
    it('sets expiration to 24 hours', async () => {
      const token = await generateUTMToken('test')
      const payload = decodePayload(token.payload)!
      
      const expectedExpiry = payload.timestamp + (24 * 60 * 60 * 1000)
      expect(payload.expires).toBe(expectedExpiry)
    })
  })
  
  describe('UTM parameter handling', () => {
    it('creates parameter string correctly', async () => {
      const token = await generateUTMToken('test')
      const param = createUTMParameter(token)
      
      expect(param).toBe(`${token.payload}.${token.signature}`)
      expect(param.split('.').length).toBe(2)
    })
    
    it('parses parameter string correctly', async () => {
      const token = await generateUTMToken('test')
      const param = createUTMParameter(token)
      const parsed = parseUTMParameter(param)
      
      expect(parsed).toEqual(token)
    })
    
    it('returns null for invalid parameter format', () => {
      expect(parseUTMParameter('no-dot')).toBeNull()
      expect(parseUTMParameter('too.many.dots')).toBeNull()
      expect(parseUTMParameter('')).toBeNull()
    })
  })
  
  describe('UTM token validation', () => {
    it('validates correct tokens', async () => {
      const token = await generateUTMToken('test-business')
      const param = createUTMParameter(token)
      const result = await validateUTMToken(param)
      
      expect(result.valid).toBe(true)
      expect(result.payload).toBeTruthy()
      expect(result.payload!.businessId).toBe('test-business')
    })
    
    it('rejects expired tokens', async () => {
      // Create an expired token
      const payload: UTMPayload = {
        businessId: 'test',
        timestamp: Date.now() - 48 * 60 * 60 * 1000, // 48 hours ago
        nonce: generateNonce(),
        expires: Date.now() - 24 * 60 * 60 * 1000, // Expired 24 hours ago
      }
      
      const encodedPayload = encodePayload(payload)
      const signature = await createSignature(encodedPayload)
      const param = `${encodedPayload}.${signature}`
      
      const result = await validateUTMToken(param)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('expired')
    })
    
    it('rejects tokens with invalid format', async () => {
      const result = await validateUTMToken('invalid-format')
      
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('invalid_format')
    })
    
    it('rejects tokens with invalid signature', async () => {
      const token = await generateUTMToken('test')
      const param = `${token.payload}.invalid-signature`
      const result = await validateUTMToken(param)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('invalid_signature')
    })
    
    it('rejects tokens with invalid payload', async () => {
      const invalidPayload = 'not-valid-base64!'
      const signature = await createSignature(invalidPayload)
      const param = `${invalidPayload}.${signature}`
      const result = await validateUTMToken(param)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('invalid_payload')
    })
    
    it('prevents replay attacks with unique nonces', async () => {
      const token1 = await generateUTMToken('test')
      const token2 = await generateUTMToken('test')
      
      const payload1 = decodePayload(token1.payload)!
      const payload2 = decodePayload(token2.payload)!
      
      expect(payload1.nonce).not.toBe(payload2.nonce)
    })
  })
  
  describe('URL generation', () => {
    it('generates complete UTM URL', async () => {
      const baseUrl = 'https://anthrasite.io/purchase'
      const businessId = 'test-business'
      const url = await generateUTMUrl(baseUrl, businessId)
      
      const urlObj = new URL(url)
      expect(urlObj.origin).toBe('https://anthrasite.io')
      expect(urlObj.pathname).toBe('/purchase')
      expect(urlObj.searchParams.has('utm')).toBe(true)
      
      const utm = urlObj.searchParams.get('utm')!
      const validation = await validateUTMToken(utm)
      expect(validation.valid).toBe(true)
      expect(validation.payload!.businessId).toBe(businessId)
    })
    
    it('includes additional parameters', async () => {
      const baseUrl = 'https://anthrasite.io/purchase'
      const businessId = 'test-business'
      const additionalParams = {
        source: 'email',
        campaign: 'launch-2024',
      }
      
      const url = await generateUTMUrl(baseUrl, businessId, additionalParams)
      const urlObj = new URL(url)
      
      expect(urlObj.searchParams.get('source')).toBe('email')
      expect(urlObj.searchParams.get('campaign')).toBe('launch-2024')
      expect(urlObj.searchParams.has('utm')).toBe(true)
    })
  })
})