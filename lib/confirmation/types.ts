/**
 * Context for the post-purchase confirmation page.
 * Retrieved from Stripe session metadata + landing page context.
 */
export interface ConfirmationContext {
  /** Stripe checkout session ID */
  sessionId: string

  /** Last 8 characters of session ID for order reference */
  orderRef: string

  /** Lead ID from JWT token */
  leadId: string

  /** Run ID from JWT token (optional) */
  runId?: string

  /** Company name from leads table (null if not found) */
  company: string | null

  /** Domain URL from leads table (null if not found) */
  domain: string | null

  /** Customer email from Stripe session */
  purchaseEmail: string | null

  /** Purchase price in dollars */
  price: number

  /** Number of issues identified (from LP context) */
  issueCount: number

  /** Lower bound of impact range, formatted (e.g., "$41,700") */
  impactLow: string

  /** Upper bound of impact range, formatted (e.g., "$62,500") */
  impactHigh: string

  /** Referral code for this purchase (if generated) */
  referralCode?: string | null

  /** Referral discount display text (e.g., "$100 off") */
  referralDiscountDisplay?: string | null

  /** Referral reward display text (e.g., "$100", "10%") - what referrer earns */
  referralRewardDisplay?: string | null

  /** Max redemptions for this referral code (null = unlimited) */
  referralMaxRedemptions?: number | null

  // Enhanced Conversions customer data (from Stripe)
  /** Customer first name (for Enhanced Conversions) */
  customerFirstName?: string | null
  /** Customer last name (for Enhanced Conversions) */
  customerLastName?: string | null
  /** Customer phone number (for Enhanced Conversions) */
  customerPhone?: string | null
  /** Customer street address (for Enhanced Conversions) */
  customerStreet?: string | null
  /** Customer city (for Enhanced Conversions) */
  customerCity?: string | null
  /** Customer state/region (for Enhanced Conversions) */
  customerState?: string | null
  /** Customer postal code (for Enhanced Conversions) */
  customerPostalCode?: string | null
  /** Customer country code (for Enhanced Conversions) */
  customerCountry?: string | null
}

/**
 * FAQ item for the confirmation page accordion.
 */
export interface ConfirmationFAQItem {
  question: string
  answer: string
}
