export interface PurchaseIssue {
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  effort?: string
}

export interface PurchaseContext {
  businessId: string
  businessName: string
  leadId: string | number
  score: number
  totalIssues: number
  issues: PurchaseIssue[]
  estimatedValue: number | string
  impactMonthlyHigh: number
  impactMonthlyLow: number
  price: number
  currency: string
  stripePayload?: any
  mobileScreenshotUrl?: string
  homepageScreenshotUrl?: string
  runId?: string
  domainUrl: string
}

export interface PurchaseState {
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string
}

export interface ReportPreviewData {
  domain: string
  metrics: {
    performanceScore: number
    seoScore: number
    securityScore: number
    accessibilityScore: number
  }
  improvements: string[]
  estimatedValue: string
}
