/**
 * Email Service Facade
 *
 * Handles purchase confirmation emails with:
 * - Feature flag control
 * - Idempotency via database timestamp
 * - Dry-run mode for testing
 * - Safe logging (no PII)
 */

import { prisma } from '@/lib/db'
import { sendEmail } from './gmail'
import { writeFileSync, mkdirSync } from 'fs'
import { existsSync } from 'fs'

export interface Purchase {
  id: string
  businessId: string
  customerEmail: string | null
  amount: number
  currency: string
  confirmationEmailSentAt: Date | null
  business?: {
    name: string
    domain: string
  }
}

interface SendPurchaseConfirmationOptions {
  eventId: string
}

/**
 * Send purchase confirmation email with idempotency and dry-run support
 *
 * Idempotency: Uses Purchase.confirmationEmailSentAt timestamp
 * Feature flags: EMAIL_CONFIRMATION_ENABLED, EMAIL_DRY_RUN
 * Logging: Only logs purchaseUid and eventId (no PII)
 */
export async function sendPurchaseConfirmationEmail(
  purchase: Purchase,
  options: SendPurchaseConfirmationOptions
): Promise<void> {
  const { eventId } = options

  // Check if email is enabled
  const emailEnabled = process.env.EMAIL_CONFIRMATION_ENABLED === 'true'
  if (!emailEnabled) {
    console.log(
      JSON.stringify({
        event: 'email_skipped_flag_disabled',
        purchaseUid: purchase.id,
        eventId,
        reason: 'EMAIL_CONFIRMATION_ENABLED is not true',
      })
    )
    return
  }

  // Check if customer email exists
  if (!purchase.customerEmail) {
    console.warn(
      JSON.stringify({
        event: 'email_skipped_no_recipient',
        purchaseUid: purchase.id,
        eventId,
        reason: 'No customerEmail on Purchase record',
      })
    )
    return
  }

  // Idempotency check
  if (purchase.confirmationEmailSentAt) {
    console.log(
      JSON.stringify({
        event: 'email_already_sent',
        purchaseUid: purchase.id,
        eventId,
        sentAt: purchase.confirmationEmailSentAt.toISOString(),
      })
    )
    return
  }

  // Get business details
  let business = purchase.business
  if (!business) {
    const purchaseWithBusiness = await prisma.purchase.findUnique({
      where: { id: purchase.id },
      include: { business: true },
    })
    business = purchaseWithBusiness?.business
  }

  if (!business) {
    console.error(
      JSON.stringify({
        event: 'email_error_no_business',
        purchaseUid: purchase.id,
        eventId,
        reason: 'Business not found',
      })
    )
    return
  }

  // Prepare email content
  const subject = 'Your Anthrasite Website Audit - Order Confirmation'
  const text = generateTextEmail(
    business.name,
    business.domain,
    purchase.id,
    purchase.amount
  )
  const html = generateHtmlEmail(
    business.name,
    business.domain,
    purchase.id,
    purchase.amount
  )

  const dryRun = process.env.EMAIL_DRY_RUN === 'true'

  try {
    if (dryRun) {
      // Dry-run mode: write to filesystem
      const mailboxDir = '/tmp/mailbox'
      if (!existsSync(mailboxDir)) {
        mkdirSync(mailboxDir, { recursive: true })
      }

      const timestamp = Date.now()
      const basePath = `${mailboxDir}/${timestamp}_${purchase.id}`

      // Write metadata
      const meta = {
        to: purchase.customerEmail,
        from: `"Anthrasite" <${process.env.GMAIL_USER || 'noreply@anthrasite.io'}>`,
        subject,
        timestamp: new Date().toISOString(),
        purchaseUid: purchase.id,
        eventId,
      }
      writeFileSync(`${basePath}.meta.json`, JSON.stringify(meta, null, 2))

      // Write EML format
      const eml = [
        `From: ${meta.from}`,
        `To: ${purchase.customerEmail}`,
        `Subject: ${subject}`,
        `Date: ${new Date().toUTCString()}`,
        `Content-Type: multipart/alternative; boundary="boundary"`,
        '',
        '--boundary',
        'Content-Type: text/plain; charset=utf-8',
        '',
        text,
        '',
        '--boundary',
        'Content-Type: text/html; charset=utf-8',
        '',
        html,
        '',
        '--boundary--',
      ].join('\n')

      writeFileSync(`${basePath}.eml`, eml)

      console.log(
        JSON.stringify({
          event: 'email_dry_run_written',
          purchaseUid: purchase.id,
          eventId,
          files: [`${basePath}.meta.json`, `${basePath}.eml`],
        })
      )
    } else {
      // Real send via Gmail SMTP
      await sendEmail({
        to: purchase.customerEmail,
        subject,
        text,
        html,
      })

      console.log(
        JSON.stringify({
          event: 'purchase_confirmation_sent',
          purchaseUid: purchase.id,
          eventId,
        })
      )
    }

    // Update database to mark email as sent
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        confirmationEmailSentAt: new Date(),
      },
    })
  } catch (error) {
    // Log error but don't crash the process
    console.error(
      JSON.stringify({
        event: 'email_send_error',
        purchaseUid: purchase.id,
        eventId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    )
    // Don't re-throw - email failures shouldn't break the webhook
  }
}

/**
 * Generate plain text email
 */
function generateTextEmail(
  businessName: string,
  domain: string,
  purchaseId: string,
  amount: number
): string {
  return `
Hi ${businessName},

Thank you for your purchase! We've received your order for a comprehensive website audit of ${domain}.

Order Details:
- Order ID: ${purchaseId}
- Amount: $${(amount / 100).toFixed(2)}
- Website: ${domain}

What's Next:
1. Our systems are analyzing your website now
2. You'll receive your comprehensive PDF report within 24-48 hours
3. The report will be sent to this email address

Questions? Reply to this email or contact hello@anthrasite.io

Thanks,
The Anthrasite Team
`.trim()
}

/**
 * Generate HTML email
 */
function generateHtmlEmail(
  businessName: string,
  domain: string,
  purchaseId: string,
  amount: number
): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #000; color: #fff; padding: 20px; text-align: center; }
      .content { padding: 30px 20px; }
      .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Anthrasite</h1>
        <p>Value, Crystallized</p>
      </div>

      <div class="content">
        <h2>Thank You for Your Purchase!</h2>

        <p>Hi ${businessName},</p>

        <p>We've received your order for a comprehensive website audit of <strong>${domain}</strong>.</p>

        <div class="details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${purchaseId}</p>
          <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
          <p><strong>Website:</strong> ${domain}</p>
        </div>

        <h3>What's Next?</h3>
        <ol>
          <li>Our systems are analyzing your website now</li>
          <li>You'll receive your comprehensive PDF report within 24-48 hours</li>
          <li>The report will be sent to this email address</li>
        </ol>

        <p>Questions? Reply to this email or contact <a href="mailto:hello@anthrasite.io">hello@anthrasite.io</a></p>
      </div>

      <div class="footer">
        <p>© 2025 Anthrasite. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`.trim()
}
