import { jwtVerify } from 'jose'
import { PurchaseContext, PurchaseIssue } from './types'

// Re-export types for consumers importing from '@/lib/purchase'
export * from './types'

// Valid audiences for purchase/landing tokens
const VALID_AUDIENCES = ['purchase', 'landing'] as const

/**
 * Validate purchase/landing JWT token
 * Extracts leadId and runId from the token payload
 *
 * Token must contain:
 * - leadId: Lead identifier
 * - runId: Run identifier (for data consistency)
 * - aud: 'purchase' or 'landing'
 */
export async function validatePurchaseToken(
  token: string
): Promise<{ leadId: string; runId?: string } | null> {
  // Dev-only: Allow numeric tokens for local testing (NEVER in production)
  if (process.env.NODE_ENV !== 'production') {
    if (token === 'test-token' || token === '3102') {
      return { leadId: '3102' }
    }
    if (/^\d+$/.test(token)) {
      return { leadId: token }
    }
  }

  try {
    // Use SURVEY_SECRET_KEY (shared secret for all JWT tokens)
    if (!process.env.SURVEY_SECRET_KEY) {
      console.error('SURVEY_SECRET_KEY not configured')
      return null
    }

    const secret = new TextEncoder().encode(process.env.SURVEY_SECRET_KEY)

    // Verify JWT signature and expiration
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      audience: VALID_AUDIENCES as unknown as string[],
    })

    // Extract leadId (required)
    const leadId = payload.leadId as string | undefined
    if (!leadId) {
      console.error('Token missing required leadId field')
      return null
    }

    // Extract runId (required for data consistency)
    const runId = payload.runId as string | undefined
    if (!runId) {
      console.warn('Token missing runId - will use latest run for lead', leadId)
    }

    return { leadId, runId }
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}

export async function lookupPurchaseContext(
  leadId: string | number,
  runId?: string
): Promise<PurchaseContext | null> {
  // Return mock context for UI development
  const issues: PurchaseIssue[] = [
    {
      severity: 'high',
      title: 'Missing Security Headers',
      description: 'Your site is vulnerable to XSS attacks.',
      effort: 'EASY',
    },
    {
      severity: 'medium',
      title: 'Slow Load Time',
      description: 'Page load is 4.2s (Target: <2.5s)',
      effort: 'MODERATE',
    },
  ]

  return {
    businessId: 'mock-business-123',
    businessName: 'Mock Business Inc',
    leadId: leadId,
    score: 72,
    totalIssues: 15,
    issues: issues,
    estimatedValue: 12450,
    impactMonthlyHigh: 12450,
    impactMonthlyLow: 8500,
    price: 199,
    currency: 'USD',
    runId: runId,
    domainUrl: 'example.com',
    mobileScreenshotUrl: 'https://placehold.co/375x812',
    homepageScreenshotUrl: 'https://placehold.co/1440x900',
  }
}
