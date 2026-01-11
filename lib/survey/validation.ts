import { jwtVerify } from 'jose'
import type { SurveyTokenPayload } from './types'
import { VALID_AUDIENCES, VALID_SCOPES } from './types'
import crypto from 'crypto'

/**
 * Validate survey or report JWT token
 * Checks signature, expiration, audience, scope, and required fields
 *
 * Accepts:
 * - Survey tokens: aud='survey', scope='feedback'
 * - Report tokens: aud='report', scope='report:download'
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

    // Verify JWT - accept multiple audiences
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      audience: VALID_AUDIENCES as unknown as string[],
    })

    // Validate required fields
    // leadId is optional for public surveys
    if (!payload.jti) {
      console.error('Token missing required jti field')
      return null
    }

    // Validate scope matches audience
    const scope = payload.scope as string
    if (!VALID_SCOPES.includes(scope as (typeof VALID_SCOPES)[number])) {
      console.error('Invalid scope:', scope)
      return null
    }

    // Enforce scope/audience consistency
    const aud = payload.aud as string
    if (aud === 'survey' && scope !== 'feedback' && scope !== 'survey:access') {
      console.error(
        'Survey tokens must have scope=feedback or scope=survey:access'
      )
      return null
    }
    if (aud === 'report' && scope !== 'report:download') {
      console.error('Report tokens must have scope=report:download')
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
