import { MailDataRequired } from '@sendgrid/mail'
import { sgMail, emailConfig, isEmailConfigured } from './config'
import { emailQueue } from './queue'
import { orderConfirmationTemplate } from './templates/orderConfirmation'
import { reportReadyTemplate } from './templates/reportReady'
import { welcomeEmailTemplate } from './templates/welcomeEmail'
import { cartRecoveryEmail, CartRecoveryEmailData } from './templates/cartRecovery'
import type {
  EmailDeliveryResult,
  EmailOptions,
  OrderConfirmationData,
  ReportReadyData,
  WelcomeEmailData,
  EmailMetadata,
} from './types'

/**
 * Send an email using SendGrid
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options?: EmailOptions,
  metadata?: EmailMetadata
): Promise<EmailDeliveryResult> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    console.warn('Email not configured, skipping send')
    return {
      success: false,
      status: 'failed',
      error: 'Email service not configured',
    }
  }

  try {
    const msg: MailDataRequired = {
      to,
      from: emailConfig.from,
      replyTo: emailConfig.replyTo,
      subject,
      html,
      trackingSettings: {
        clickTracking: {
          enable: options?.trackClicks ?? emailConfig.features.trackClicks,
        },
        openTracking: {
          enable: options?.trackOpens ?? emailConfig.features.trackOpens,
        },
      },
      mailSettings: {
        sandboxMode: {
          enable: options?.sandboxMode ?? emailConfig.features.sandboxMode,
        },
      },
    }

    // Add categories for tracking
    if (options?.categories || metadata?.template) {
      msg.categories = options?.categories || [metadata?.template || 'transactional']
    }

    // Add custom args for webhook tracking
    if (options?.customArgs || metadata) {
      msg.customArgs = {
        ...options?.customArgs,
        ...(metadata?.purchaseId && { purchaseId: metadata.purchaseId }),
        ...(metadata?.businessId && { businessId: metadata.businessId }),
        ...(metadata?.template && { template: metadata.template }),
      }
    }

    // Send email
    const [response] = await sgMail.send(msg)

    console.log(`Email sent successfully: ${response.headers['x-message-id']}`)

    return {
      success: true,
      messageId: response.headers['x-message-id'] as string,
      status: 'sent',
    }
  } catch (error: any) {
    console.error('Failed to send email:', error)

    // Extract error details
    const errorMessage = error.response?.body?.errors?.[0]?.message || error.message

    return {
      success: false,
      status: 'failed',
      error: errorMessage,
    }
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

  const result = await sendEmail(data.to, subject, template, options, metadata)

  // Queue for retry if failed
  if (!result.success && result.error !== 'Email service not configured') {
    emailQueue.add('orderConfirmation', data, metadata, result.error)
  }

  return result
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

  const result = await sendEmail(data.to, subject, template, options, metadata)

  // Queue for retry if failed
  if (!result.success && result.error !== 'Email service not configured') {
    emailQueue.add('reportReady', data, metadata, result.error)
  }

  return result
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

  const result = await sendEmail(data.to, subject, template, options, metadata)

  // Queue for retry if failed
  if (!result.success && result.error !== 'Email service not configured') {
    emailQueue.add('welcomeEmail', data, metadata, result.error)
  }

  return result
}

/**
 * Retry sending a queued email
 */
export async function retryQueuedEmail(queueItemId: string): Promise<EmailDeliveryResult> {
  const items = emailQueue.getAllItems()
  const item = items.find(i => i.id === queueItemId)

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
      result = await sendCartRecoveryEmail(item.data as CartRecoveryEmailData & { to: string })
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
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

/**
 * Send cart recovery email
 */
export async function sendCartRecoveryEmail(data: CartRecoveryEmailData & { to: string }): Promise<EmailDeliveryResult> {
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
  
  const result = await sendEmail(data.to, subject, htmlContent, options, metadata)
  
  // Queue for retry if failed
  if (!result.success && result.error !== 'Email service not configured') {
    emailQueue.add('cartRecovery', data, metadata, result.error)
  }
  
  return result
}

/**
 * Get email queue statistics
 */
export function getEmailQueueStats() {
  return emailQueue.getStats()
}