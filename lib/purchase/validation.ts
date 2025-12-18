import { jwtVerify } from 'jose'
import type { PurchaseTokenPayload } from './types'

/**
 * Validate purchase JWT token
 * Mirrors survey pattern from lib/survey/validation.ts
 *
 * Checks signature, expiration, audience, scope, and required fields
 */
export async function validatePurchaseToken(
  token: string
): Promise<PurchaseTokenPayload | null> {
  try {
    if (!process.env.SURVEY_SECRET_KEY && token !== 'dev-token') {
      console.error('[validatePurchaseToken] SURVEY_SECRET_KEY not configured')
      return null
    }

    // Dev bypass
    if (token === 'dev-token') {
      return {
        leadId: '3093',
        businessId: 'dev-business-123',
        runId: 'dev-run',
        scope: 'buy',
        aud: 'purchase',
        jti: 'dev-jti',
        iat: Date.now(),
        exp: Date.now() + 3600,
      }
    }

    // Create symmetric key from secret (same key as survey)
    const secret = new TextEncoder().encode(process.env.SURVEY_SECRET_KEY)

    // Verify JWT
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      audience: 'purchase',
    })

    // Validate required fields
    // leadId IS required for purchase (unlike survey where optional for public)
    if (!payload.jti || !payload.leadId || payload.scope !== 'buy') {
      console.error(
        '[validatePurchaseToken] Token missing required fields or invalid scope',
        {
          hasJti: !!payload.jti,
          hasLeadId: !!payload.leadId,
          scope: payload.scope,
        }
      )
      return null
    }

    return payload as unknown as PurchaseTokenPayload
  } catch (error) {
    console.error('[validatePurchaseToken] Token validation failed:', error)
    return null
  }
}
