/**
 * Landing Page Context Types
 * Data contract for the /landing/[token] page
 */

export type EffortLevel = 'EASY' | 'MODERATE' | 'COMPLEX'

export interface AnchorMetric {
  /** Human-readable metric label (e.g., "Profile Completeness") */
  label: string
  /** Current metric value (e.g., "40%") */
  value: string
  /** Target threshold (e.g., "85%") */
  target: string
}

export interface HookOpportunity {
  /** Opportunity title from catalog */
  title: string
  /** Effort level badge */
  effort: EffortLevel
  /** Description text (from Phase C or catalog concept) */
  description: string
  /** Plain English pain statement for hero section (e.g., "Your pages take too long to load—most visitors won't wait.") */
  painStatement: string
  /** Primary metric with value/target for display */
  anchorMetric: AnchorMetric
}

export interface LandingContext {
  // Company info
  /** Business/company name */
  company: string
  /** Domain URL */
  domainUrl: string

  // Score & impact
  /** Overall assessment score (0-100) */
  score: number
  /** Number of identified issues/opportunities */
  issueCount: number
  /** Lower bound of impact range (formatted, e.g., "$41,700") */
  impactLow: string
  /** Upper bound of impact range (formatted, e.g., "$62,500") */
  impactHigh: string

  // Hook opportunity (from cold email selection)
  /** The primary opportunity highlighted in cold email */
  hookOpportunity: HookOpportunity

  // Screenshots
  /** Desktop homepage screenshot URL */
  desktopScreenshotUrl: string
  /** Mobile homepage screenshot URL */
  mobileScreenshotUrl: string

  // Purchase
  /** Report price in dollars */
  price: number
  /** Lead identifier */
  leadId: string
  /** Business identifier */
  businessId: string
  /** Contact identifier (for multi-buyer support) */
  contactId?: string
}

/**
 * FAQ item structure for landing page
 */
export interface FAQItem {
  question: string
  answer: string
}
