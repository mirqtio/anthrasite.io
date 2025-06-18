import { baseTemplate, emailButton, emailDivider } from './base-template'
import type { OrderConfirmationData } from '../types'

export const orderConfirmationTemplate = (data: OrderConfirmationData): string => {
  const {
    customerName,
    orderId,
    businessDomain,
    amount,
    currency,
    purchaseDate,
  } = data

  // Format amount
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)

  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  }).format(purchaseDate)

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 600;">
      Order Confirmation
    </h2>

    <p style="margin: 0 0 20px 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      ${customerName ? `Hi ${customerName},` : 'Hello,'}
    </p>

    <p style="margin: 0 0 30px 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      Thank you for your purchase! We've received your order and our team is preparing your comprehensive business intelligence report for <strong>${businessDomain}</strong>.
    </p>

    ${emailDivider()}

    <h3 style="margin: 0 0 15px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600;">
      Order Details
    </h3>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px;">
            Order ID
          </p>
        </td>
        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600;">
            ${orderId}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px;">
            Business Domain
          </p>
        </td>
        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600;">
            ${businessDomain}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px;">
            Purchase Date
          </p>
        </td>
        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px;">
            ${formattedDate}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px 0 10px 0;">
          <p style="margin: 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 600;">
            Total
          </p>
        </td>
        <td align="right" style="padding: 15px 0 10px 0;">
          <p style="margin: 0; color: #3b82f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 700;">
            ${formattedAmount}
          </p>
        </td>
      </tr>
    </table>

    ${emailDivider()}

    <h3 style="margin: 0 0 15px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600;">
      What Happens Next?
    </h3>

    <ol style="margin: 0 0 30px 0; padding-left: 20px; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
      <li style="margin-bottom: 10px;">Our AI-powered analysis engine is scanning public data about ${businessDomain}</li>
      <li style="margin-bottom: 10px;">We're compiling insights across multiple data sources</li>
      <li style="margin-bottom: 10px;">Your report will be ready within 24 hours</li>
      <li>You'll receive an email with a secure download link once it's ready</li>
    </ol>

    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
      <p style="margin: 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
        <strong style="color: #1e293b;">Need help?</strong><br>
        Our support team is here to assist you. Reply to this email or contact us at support@anthrasite.io
      </p>
    </div>
  `

  return baseTemplate(content)
}