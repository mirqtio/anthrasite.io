/**
 * Context for the post-purchase confirmation page.
 * Retrieved from Stripe session metadata + lead data.
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
}

/**
 * FAQ item for the confirmation page accordion.
 */
export interface ConfirmationFAQItem {
  question: string
  answer: string
}
