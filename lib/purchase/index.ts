import { jwtVerify } from 'jose'
import { PurchaseContext, PurchaseIssue } from './types'

// Re-export types for consumers importing from '@/lib/purchase'
export * from './types'

// Valid audiences for purchase/landing tokens
const VALID_AUDIENCES = ['purchase', 'landing'] as const

// LeadShop API URL for short token lookups
const LEADSHOP_API_URL =
  process.env.LEADSHOP_API_URL || 'http://5.161.19.136:8000'

/**
 * Check if a string looks like a short link ID vs a JWT.
 * Short IDs are 8 alphanumeric chars, JWTs have dots and are longer.
 */
function isShortLinkId(token: string): boolean {
  // Short link IDs are 8 lowercase alphanumeric characters
  // JWTs have dots (header.payload.signature) and are much longer
  return /^[a-z0-9]{8}$/i.test(token) && !token.includes('.')
}

/**
 * Look up a short link ID from LeadShop API to get leadId/runId.
 */
async function lookupShortToken(
  shortId: string
): Promise<{ leadId: string; runId?: string } | null> {
  try {
    const response = await fetch(
      `${LEADSHOP_API_URL}/api/v1/landing-tokens/${shortId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.error(
        `Short token lookup failed: ${response.status} for ${shortId}`
      )
      return null
    }

    const data = await response.json()
    return {
      leadId: String(data.leadId),
      runId: data.runId || undefined,
    }
  } catch (error) {
    console.error('Short token lookup error:', error)
    return null
  }
}

/**
 * Validate purchase/landing token - supports both JWT tokens and short link IDs.
 * Extracts leadId, runId, and contactId from the token payload.
 *
 * For JWTs, token must contain:
 * - leadId: Lead identifier
 * - runId: Run identifier (for data consistency)
 * - contactId: Contact identifier (for multi-buyer support)
 * - aud: 'purchase' or 'landing'
 *
 * For short link IDs (8-char alphanumeric), looks up via LeadShop API.
 */
export async function validatePurchaseToken(
  token: string
): Promise<{ leadId: string; runId?: string; contactId?: string } | null> {
  // Dev-only: Allow numeric tokens for local testing (NEVER in production)
  if (process.env.NODE_ENV !== 'production') {
    if (token === 'test-token' || token === '3102') {
      return { leadId: '3102' }
    }
    if (/^\d+$/.test(token)) {
      return { leadId: token }
    }
  }

  // Check if this is a short link ID (8 alphanumeric chars, no dots)
  if (isShortLinkId(token)) {
    const result = await lookupShortToken(token)
    if (result) {
      return { leadId: result.leadId, runId: result.runId }
    }
    console.error('Short token lookup returned null for:', token)
    return null
  }

  // Otherwise, treat as JWT
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

    // Extract contactId (for multi-buyer support)
    const contactId = payload.contactId as string | undefined

    return { leadId, runId, contactId }
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
