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
