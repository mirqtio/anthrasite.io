/**
 * Purchase Token Types
 * Mirrors survey token pattern from lib/survey/types.ts
 */

// JWT Payload for purchase page access
export interface PurchaseTokenPayload {
  leadId: string // Required for purchase (unlike survey where optional)
  runId?: string // Optional - falls back to most recent report
  jti: string // Unique token identifier
  aud: 'purchase' // Audience - distinguishes from survey tokens
  scope: 'buy' // Scope - purchase-specific
  tier?: string // Pricing tier (default: 'basic')
  iat: number // Issued at
  exp: number // Expiry
}

// Hero issue from Phase C
export interface HeroIssue {
  title: string
  description: string
  impact_low: string // Formatted currency string e.g. "19,800"
  impact_high: string // Formatted currency string e.g. "29,700"
}

// Purchase context from database
export interface PurchaseContext {
  businessName: string
  domainUrl: string
  homepageScreenshotUrl?: string | null
  impactMonthlyLow: number // In whole dollars
  impactMonthlyHigh: number // In whole dollars
  issues: HeroIssue[]
  leadId: number
  runId?: string
}
