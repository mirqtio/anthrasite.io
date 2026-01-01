/**
 * Email Types
 *
 * Minimal type definitions for email functionality.
 * Email sending is handled by LeadShop; Anthrasite only provides:
 * - Click tracking tokens (tokens.ts)
 * - Report ready email template (templates/reportReady.ts)
 */

// Report ready email context (used by LeadShop via API)
export interface ReportReadyContext {
  firstName: string
  businessName: string
  reportLink: string // The tracked click URL (via /api/email/click)
}

// Report ready email output
export interface ReportReadyEmail {
  subject: string
  html: string
  text: string
}

// Click token payload (used by tokens.ts)
export interface ClickTokenPayload {
  leadId: string
  runId: string
  linkType: 'report_download' | 'landing_page' | 'unsubscribe'
  download?: boolean // For report downloads, triggers download header
}
