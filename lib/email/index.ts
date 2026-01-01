/**
 * Email Module
 *
 * Email sending is handled by LeadShop. Anthrasite only provides:
 * - Click tracking tokens and validation
 * - Report ready email template
 */

// Click tracking tokens
export { mintClickToken, validateClickToken } from './tokens'

// Report ready email template
export { buildReportReadyEmail } from './templates/reportReady'

// Types
export type {
  ReportReadyContext,
  ReportReadyEmail,
  ClickTokenPayload,
} from './types'
