// Email service (SendGrid removed - email functionality disabled)
import { emailConfig, isEmailConfigured } from './config'
import { emailQueue } from './queue'
import { orderConfirmationTemplate } from './templates/orderConfirmation'
import { reportReadyTemplate } from './templates/reportReady'
import { welcomeEmailTemplate } from './templates/welcomeEmail'
import { cartRecoveryEmail } from './templates/cartRecovery'
import type {
  EmailDeliveryResult,
  EmailOptions,
  OrderConfirmationData,
  ReportReadyData,
  WelcomeEmailData,
  CartRecoveryEmailData,
  EmailMetadata,
} from './types'

/**
 * Send an email (DISABLED - SendGrid removed)
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options?: EmailOptions,
  metadata?: EmailMetadata
): Promise<EmailDeliveryResult> {
  console.log('[EMAIL DISABLED] Would send email:', {
    to,
    subject,
    template: metadata?.template,
  })

  return {
    success: false,
    status: 'failed',
    error: 'Email service not configured (SendGrid removed)',
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(
  data: OrderConfirmationData,
  options?: EmailOptions
): Promise<EmailDeliveryResult> {
  const template = orderConfirmationTemplate(data)
  const subject = emailConfig.templates.orderConfirmation.subject

  const metadata: EmailMetadata = {
    template: 'orderConfirmation',
    purchaseId: data.orderId,
    businessId: data.businessDomain,
    timestamp: new Date(),
  }

  return sendEmail(data.to, subject, template, options, metadata)
}

/**
 * Send report ready notification
 */
export async function sendReportReady(
  data: ReportReadyData,
  options?: EmailOptions
): Promise<EmailDeliveryResult> {
  const template = reportReadyTemplate(data)
  const subject = emailConfig.templates.reportReady.subject

  const metadata: EmailMetadata = {
    template: 'reportReady',
    purchaseId: data.orderId,
    businessId: data.businessDomain,
    timestamp: new Date(),
  }

  return sendEmail(data.to, subject, template, options, metadata)
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData,
  options?: EmailOptions
): Promise<EmailDeliveryResult> {
  const template = welcomeEmailTemplate(data)
  const subject = emailConfig.templates.welcomeEmail.subject

  const metadata: EmailMetadata = {
    template: 'welcomeEmail',
    businessId: data.businessDomain,
    timestamp: new Date(),
  }

  return sendEmail(data.to, subject, template, options, metadata)
}

/**
 * Retry sending a queued email
 */
export async function retryQueuedEmail(
  queueItemId: string
): Promise<EmailDeliveryResult> {
  const items = emailQueue.getAllItems()
  const item = items.find((i) => i.id === queueItemId)

  if (!item) {
    return {
      success: false,
      status: 'failed',
      error: 'Queue item not found',
    }
  }

  let result: EmailDeliveryResult

  // Send based on template type
  switch (item.template) {
    case 'orderConfirmation':
      result = await sendOrderConfirmation(item.data as OrderConfirmationData)
      break
    case 'reportReady':
      result = await sendReportReady(item.data as ReportReadyData)
      break
    case 'welcomeEmail':
      result = await sendWelcomeEmail(item.data as WelcomeEmailData)
      break
    case 'cartRecovery':
      result = await sendCartRecoveryEmail(
        item.data as CartRecoveryEmailData & { to: string }
      )
      break
    default:
      result = {
        success: false,
        status: 'failed',
        error: 'Unknown template type',
      }
  }

  // Update queue item
  emailQueue.updateAfterAttempt(queueItemId, result.success, result.error)

  return result
}

/**
 * Process all items in the retry queue
 */
export async function processRetryQueue(): Promise<void> {
  const items = emailQueue.getItemsForRetry()

  for (const item of items) {
    await retryQueuedEmail(item.id)

    // Add small delay between sends to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

/**
 * Send cart recovery email
 */
export async function sendCartRecoveryEmail(
  data: CartRecoveryEmailData & { to: string }
): Promise<EmailDeliveryResult> {
  const htmlContent = cartRecoveryEmail(data)
  const subject = `Complete your purchase for ${data.businessName}`

  const metadata: EmailMetadata = {
    template: 'cartRecovery',
    businessId: data.businessName,
    timestamp: new Date(),
  }

  const options: EmailOptions = {
    categories: ['cart_recovery'],
    customArgs: {
      businessName: data.businessName,
      amount: data.amount,
    },
  }

  return sendEmail(data.to, subject, htmlContent, options, metadata)
}

/**
 * Get email queue statistics
 */
export function getEmailQueueStats() {
  return emailQueue.getStats()
}
