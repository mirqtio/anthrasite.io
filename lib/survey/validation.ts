import { jwtVerify, importJWK } from 'jose'
import type { SurveyTokenPayload } from './types'
import crypto from 'crypto'

/**
 * Validate survey JWT token
 * Checks signature, expiration, audience, scope, and required fields
 */
export async function validateSurveyToken(
  token: string
): Promise<SurveyTokenPayload | null> {
  try {
    if (!process.env.SURVEY_SECRET_KEY) {
      console.error('SURVEY_SECRET_KEY not configured')
      return null
    }

    // Create symmetric key from secret
    const secret = new TextEncoder().encode(process.env.SURVEY_SECRET_KEY)

    // Verify JWT
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      audience: 'survey',
    })

    // Validate required fields
    if (!payload.leadId || !payload.jti || payload.scope !== 'feedback') {
      console.error('Token missing required fields or invalid scope')
      return null
    }

    return payload as unknown as SurveyTokenPayload
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}

/**
 * Generate SHA256 hash of JTI for database storage
 */
export function hashJti(jti: string): string {
  return crypto.createHash('sha256').update(jti).digest('hex')
}

/**
 * Generate SHA256 hash of IP address for privacy-safe storage
 * Uses a server-side salt to prevent rainbow table attacks
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'default-salt-change-me'
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
}
