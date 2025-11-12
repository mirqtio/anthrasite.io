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
      audience: 'anthrasite.io',
    })

    // Validate required fields
    if (!payload.leadId || !payload.jti || payload.scope !== 'survey') {
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
 * Validate that token hasn't been used to complete survey
 * This is checked at the database level via unique constraint on jtiHash
 */
export async function checkTokenUsed(
  jtiHash: string,
  prisma: any
): Promise<boolean> {
  const existing = await prisma.surveyResponse.findUnique({
    where: { jtiHash },
    select: { completedAt: true },
  })

  return existing?.completedAt != null
}
