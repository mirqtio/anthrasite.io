/**
 * Gmail SMTP Email Service
 *
 * Primary email provider for Anthrasite.io
 * Uses nodemailer with Gmail SMTP transport
 *
 * @see https://nodemailer.com/smtp/
 * @see ADR-P08 for email provider decisions
 */

import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

/**
 * Send email via Gmail SMTP
 *
 * Requires environment variables:
 * - GMAIL_USER: Gmail address to send from
 * - GMAIL_APP_PASSWORD: Gmail app-specific password (not regular password)
 *
 * @see https://support.google.com/accounts/answer/185833
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: EmailOptions): Promise<void> {
  // Validate required environment variables
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      'Gmail SMTP not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.'
    )
  }

  // Create Gmail SMTP transport
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  // Send email
  await transport.sendMail({
    from: `"Anthrasite" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  })
}

/**
 * Send purchase confirmation email
 *
 * Called by Stripe webhook after successful payment
 */
export async function sendPurchaseConfirmation({
  to,
  businessName,
  domain,
  purchaseId,
  amount,
}: {
  to: string
  businessName: string
  domain: string
  purchaseId: string
  amount: number
}): Promise<void> {
  const subject = 'Your Anthrasite Website Audit - Order Confirmation'

  const text = `
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

  const html = `
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

  await sendEmail({ to, subject, text, html })
}
