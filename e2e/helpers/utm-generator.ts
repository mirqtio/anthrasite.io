// Minimal UTM token generator for E2E tests
// Aligned to lib/utm/crypto.ts implementation

import crypto from 'node:crypto'

const SECRET =
  process.env.UTM_SECRET_KEY || 'development-secret-key-replace-in-production'

export interface UTMPayload {
  businessId: string
  timestamp: number
  nonce: string
  expires: number
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
}

function generateNonce(): string {
  const bytes = crypto.randomBytes(16)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function makeValidUtmToken(overrides: Partial<UTMPayload> = {}): string {
  const now = Date.now()
  const payload: UTMPayload = {
    businessId: 'test-business-001',
    timestamp: now,
    nonce: generateNonce(),
    expires: now + 60 * 60 * 1000, // 1 hour from now
    ...overrides,
  }

  const json = base64url(JSON.stringify(payload))
  const signature = sign(json)
  return `${json}.${signature}`
}

export function makeExpiredUtmToken(
  overrides: Partial<UTMPayload> = {}
): string {
  const now = Date.now()
  const payload: UTMPayload = {
    businessId: 'test-business-001',
    timestamp: now - 25 * 60 * 60 * 1000, // 25 hours ago
    nonce: generateNonce(),
    expires: now - 60 * 1000, // expired 1 minute ago
    ...overrides,
  }

  const json = base64url(JSON.stringify(payload))
  const signature = sign(json)
  return `${json}.${signature}`
}

export function makeTamperedUtmToken(): string {
  const valid = makeValidUtmToken()
  const [json, _signature] = valid.split('.')
  // Tamper with the payload
  const tampered = json.slice(0, -5) + 'XXXXX'
  const bogusSignature = 'tampered_signature_xyz'
  return `${tampered}.${bogusSignature}`
}

// Re-export for compatibility with existing imports
export const generateUTMToken = makeValidUtmToken
