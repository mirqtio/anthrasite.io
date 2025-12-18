import { PurchaseContext, PurchaseIssue } from './types'

// Re-export types for consumers importing from '@/lib/purchase'
export * from './types'

export async function validatePurchaseToken(
  token: string
): Promise<{ leadId: string; runId?: string } | null> {
  // Mock validation returning payload
  return { leadId: '12345', runId: 'run-abc' }
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
