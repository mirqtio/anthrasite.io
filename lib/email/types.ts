import type { MailDataRequired } from '@sendgrid/mail'

// Base email template data
export interface BaseEmailData {
  to: string
  customerName?: string
}

// Order confirmation email data
export interface OrderConfirmationData extends BaseEmailData {
  orderId: string
  businessDomain: string
  amount: number
  currency: string
  purchaseDate: Date
}

// Report ready email data
export interface ReportReadyData extends BaseEmailData {
  orderId: string
  businessDomain: string
  reportUrl: string
  expiresAt: Date
}

// Welcome email data
export interface WelcomeEmailData extends BaseEmailData {
  businessDomain: string
}

// Cart recovery email data
export interface CartRecoveryEmailData extends BaseEmailData {
  businessName: string
  amount: string
  recoveryUrl: string
}

// Email template types
export type EmailTemplate =
  | 'orderConfirmation'
  | 'reportReady'
  | 'welcomeEmail'
  | 'cartRecovery'

// Email metadata for tracking
export interface EmailMetadata {
  template: EmailTemplate
  purchaseId?: string
  businessId?: string
  customerId?: string
  timestamp: Date
}

// Email delivery status
export type EmailStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'bounced'
  | 'complained'

// Email delivery result
export interface EmailDeliveryResult {
  success: boolean
  messageId?: string
  error?: string
  status: EmailStatus
}

// Email queue item
export interface EmailQueueItem {
  id: string
  template: EmailTemplate
  data: BaseEmailData
  metadata: EmailMetadata
  attempts: number
  lastAttemptAt?: Date
  nextRetryAt?: Date
  error?: string
  status: EmailStatus
  createdAt: Date
}

// SendGrid event types for webhook handling
export type SendGridEventType =
  | 'delivered'
  | 'bounce'
  | 'deferred'
  | 'complaint'
  | 'unsubscribed'
  | 'open'
  | 'click'

// SendGrid webhook event
export interface SendGridWebhookEvent {
  email: string
  event: SendGridEventType
  sg_message_id: string
  timestamp: number
  category?: string[]
  reason?: string
  type?: string
  url?: string
}

// Email options
export interface EmailOptions {
  trackOpens?: boolean
  trackClicks?: boolean
  sandboxMode?: boolean
  categories?: string[]
  customArgs?: Record<string, string>
}
