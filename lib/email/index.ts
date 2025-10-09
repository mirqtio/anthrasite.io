// Export email service functions
export {
  sendOrderConfirmation,
  sendReportReady,
  sendWelcomeEmail,
  sendCartRecoveryEmail,
  retryQueuedEmail,
  processRetryQueue,
  getEmailQueueStats,
} from './email-service'

// Stub for purchase confirmation (to be implemented)
export async function sendPurchaseConfirmationEmail(
  purchase: any,
  metadata?: { eventId?: string }
) {
  // TODO: Wire to actual mailer when webhook handler is implemented
  console.log(
    `[EMAIL STUB] Would send purchase confirmation for purchase ${purchase.id} (event: ${metadata?.eventId})`
  )
  return { ok: true }
}

// Export email configuration
export { emailConfig, isEmailConfigured } from './config'

// Export email queue
export { emailQueue } from './queue'

// Export types
export type {
  BaseEmailData,
  OrderConfirmationData,
  ReportReadyData,
  WelcomeEmailData,
  EmailTemplate,
  EmailMetadata,
  EmailStatus,
  EmailDeliveryResult,
  EmailQueueItem,
  SendGridEventType,
  SendGridWebhookEvent,
  EmailOptions,
} from './types'
