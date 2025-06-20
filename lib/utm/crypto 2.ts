// UTM token configuration
const UTM_SECRET =
  process.env.UTM_SECRET_KEY || 'development-secret-key-replace-in-production'
const TOKEN_EXPIRY_HOURS = 24

export interface UTMPayload {
  businessId: string
  timestamp: number
  nonce: string
  expires: number
}

export interface UTMToken {
  payload: string
  signature: string
}

/**
 * Get crypto implementation based on environment
 */
function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== 'undefined') {
    return globalThis.crypto
  }
  // Fallback for Node.js environments
  // @ts-ignore
  return require('crypto').webcrypto
}

/**
 * Get TextEncoder implementation based on environment
 */
function getTextEncoder(): TextEncoder {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder()
  }
  // Polyfill for Node.js environments
  const { TextEncoder: NodeTextEncoder } = require('util')
  return new NodeTextEncoder()
}

/**
 * Get TextDecoder implementation based on environment
 */
function getTextDecoder(): TextDecoder {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder()
  }
  // Polyfill for Node.js environments
  const { TextDecoder: NodeTextDecoder } = require('util')
  return new NodeTextDecoder()
}

/**
 * Convert string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  const encoder = getTextEncoder()
  return encoder.encode(str)
}

/**
 * Get btoa implementation based on environment
 */
function getBtoa(): (data: string) => string {
  if (typeof btoa !== 'undefined') {
    return btoa
  }
  // Polyfill for Node.js environments
  return (data: string) => Buffer.from(data, 'binary').toString('base64')
}

/**
 * Convert Uint8Array to base64url string
 */
function uint8ArrayToBase64Url(array: Uint8Array): string {
  // Convert to base64
  let base64 = ''
  const bytes = array
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    base64 += String.fromCharCode(bytes[i])
  }
  const btoaFunc = getBtoa()
  base64 = btoaFunc(base64)

  // Convert base64 to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Get atob implementation based on environment
 */
function getAtob(): (data: string) => string {
  if (typeof atob !== 'undefined') {
    return atob
  }
  // Polyfill for Node.js environments
  return (data: string) => Buffer.from(data, 'base64').toString('binary')
}

/**
 * Convert base64url string to Uint8Array
 */
function base64UrlToUint8Array(base64url: string): Uint8Array {
  // Convert base64url to base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')

  // Pad with '=' to make length multiple of 4
  while (base64.length % 4) {
    base64 += '='
  }

  // Decode base64
  const atobFunc = getAtob()
  const binaryString = atobFunc(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Import HMAC key from secret string
 */
async function importHmacKey(secret: string): Promise<CryptoKey> {
  const crypto = getCrypto()
  const keyData = stringToUint8Array(secret)

  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  const crypto = getCrypto()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Convert to hex string
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Create HMAC-SHA256 signature
 */
export async function createSignature(data: string): Promise<string> {
  const crypto = getCrypto()
  const key = await importHmacKey(UTM_SECRET)
  const dataBytes = stringToUint8Array(data)

  const signature = await crypto.subtle.sign('HMAC', key, dataBytes)

  return uint8ArrayToBase64Url(new Uint8Array(signature))
}

/**
 * Verify HMAC-SHA256 signature
 */
export async function verifySignature(
  data: string,
  signature: string
): Promise<boolean> {
  try {
    const crypto = getCrypto()
    const key = await importHmacKey(UTM_SECRET)
    const dataBytes = stringToUint8Array(data)
    const signatureBytes = base64UrlToUint8Array(signature)

    return await crypto.subtle.verify('HMAC', key, signatureBytes, dataBytes)
  } catch (error) {
    return false
  }
}

/**
 * Encode payload to base64url
 */
export function encodePayload(payload: UTMPayload): string {
  const jsonString = JSON.stringify(payload)
  const bytes = stringToUint8Array(jsonString)
  return uint8ArrayToBase64Url(bytes)
}

/**
 * Decode payload from base64url
 */
export function decodePayload(encoded: string): UTMPayload | null {
  try {
    const bytes = base64UrlToUint8Array(encoded)
    const decoder = getTextDecoder()
    const jsonString = decoder.decode(bytes)
    return JSON.parse(jsonString)
  } catch (error) {
    return null
  }
}

/**
 * Generate a signed UTM token
 */
export async function generateUTMToken(businessId: string): Promise<UTMToken> {
  const now = Date.now()
  const expires = now + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000

  const payload: UTMPayload = {
    businessId,
    timestamp: now,
    nonce: generateNonce(),
    expires,
  }

  const encodedPayload = encodePayload(payload)
  const signature = await createSignature(encodedPayload)

  return {
    payload: encodedPayload,
    signature,
  }
}

/**
 * Create UTM parameter string
 */
export function createUTMParameter(token: UTMToken): string {
  return `${token.payload}.${token.signature}`
}

/**
 * Parse UTM parameter string
 */
export function parseUTMParameter(utm: string): UTMToken | null {
  const parts = utm.split('.')
  if (parts.length !== 2) {
    return null
  }

  return {
    payload: parts[0],
    signature: parts[1],
  }
}

/**
 * Validate UTM token
 */
export interface ValidationResult {
  valid: boolean
  reason?:
    | 'invalid_format'
    | 'invalid_signature'
    | 'expired'
    | 'invalid_payload'
  payload?: UTMPayload
}

export async function validateUTMToken(utm: string): Promise<ValidationResult> {
  // In development mode with mock data, accept specific test tokens
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_USE_MOCK_PURCHASE === 'true'
  ) {
    const mockTokens: Record<string, UTMPayload> = {
      'dev-utm-valid': {
        businessId: 'dev-business-1',
        timestamp: Date.now(),
        nonce: 'mock-nonce-1',
        expires: Date.now() + 24 * 60 * 60 * 1000,
      },
      'dev-utm-used': {
        businessId: 'dev-business-2',
        timestamp: Date.now(),
        nonce: 'mock-nonce-2',
        expires: Date.now() + 24 * 60 * 60 * 1000,
      },
      'dev-utm-test': {
        businessId: 'dev-business-3',
        timestamp: Date.now(),
        nonce: 'mock-nonce-3',
        expires: Date.now() + 24 * 60 * 60 * 1000,
      },
      'mock-hash-123': {
        businessId: 'mock-business-1',
        timestamp: Date.now(),
        nonce: 'mock-nonce-123',
        expires: Date.now() + 24 * 60 * 60 * 1000,
      },
      'mock-hash-456': {
        businessId: 'mock-business-2',
        timestamp: Date.now(),
        nonce: 'mock-nonce-456',
        expires: Date.now() + 24 * 60 * 60 * 1000,
      },
    }

    if (mockTokens[utm]) {
      return { valid: true, payload: mockTokens[utm] }
    }
  }

  // Parse the token
  const token = parseUTMParameter(utm)
  if (!token) {
    return { valid: false, reason: 'invalid_format' }
  }

  // Verify signature
  const isValidSignature = await verifySignature(token.payload, token.signature)
  if (!isValidSignature) {
    return { valid: false, reason: 'invalid_signature' }
  }

  // Decode payload
  const payload = decodePayload(token.payload)
  if (!payload) {
    return { valid: false, reason: 'invalid_payload' }
  }

  // Check expiration
  if (Date.now() > payload.expires) {
    return { valid: false, reason: 'expired' }
  }

  return { valid: true, payload }
}

/**
 * Generate a complete UTM URL
 */
export async function generateUTMUrl(
  baseUrl: string,
  businessId: string,
  additionalParams?: Record<string, string>
): Promise<string> {
  const token = await generateUTMToken(businessId)
  const utm = createUTMParameter(token)

  const url = new URL(baseUrl)
  url.searchParams.set('utm', utm)

  // Add any additional parameters
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  return url.toString()
}
