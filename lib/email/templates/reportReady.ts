import { baseTemplate, emailButton, emailDivider } from './base-template'
import type { ReportReadyData } from '../types'

export const reportReadyTemplate = (data: ReportReadyData): string => {
  const {
    customerName,
    orderId,
    businessDomain,
    reportUrl,
    expiresAt,
  } = data

  // Format expiration date
  const formattedExpiration = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(expiresAt)

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 600;">
      Your Report is Ready! 🎉
    </h2>

    <p style="margin: 0 0 20px 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      ${customerName ? `Hi ${customerName},` : 'Hello,'}
    </p>

    <p style="margin: 0 0 30px 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      Great news! Your comprehensive business intelligence report for <strong>${businessDomain}</strong> is ready for download.
    </p>

    <div style="text-align: center; margin: 0 0 30px 0;">
      ${emailButton('Download Your Report', reportUrl)}
    </div>

    ${emailDivider()}

    <h3 style="margin: 0 0 15px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600;">
      What's Included in Your Report
    </h3>

    <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
      <li style="margin-bottom: 8px;">Company overview and key metrics</li>
      <li style="margin-bottom: 8px;">Market position and competitive analysis</li>
      <li style="margin-bottom: 8px;">Financial indicators and growth trends</li>
      <li style="margin-bottom: 8px;">Technology stack analysis</li>
      <li style="margin-bottom: 8px;">Team composition and hiring patterns</li>
      <li style="margin-bottom: 8px;">Customer sentiment and reviews</li>
      <li>Strategic recommendations and opportunities</li>
    </ul>

    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 15px; margin: 0 0 30px 0;">
      <p style="margin: 0; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
        <strong>Important:</strong> This download link will expire on ${formattedExpiration}. Please download your report before this date.
      </p>
    </div>

    ${emailDivider()}

    <h3 style="margin: 0 0 15px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600;">
      How to Use Your Report
    </h3>

    <ol style="margin: 0 0 30px 0; padding-left: 20px; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
      <li style="margin-bottom: 10px;">Review the executive summary for key insights</li>
      <li style="margin-bottom: 10px;">Explore detailed sections relevant to your needs</li>
      <li style="margin-bottom: 10px;">Use the data to inform strategic decisions</li>
      <li>Share insights with your team (watermark-free)</li>
    </ol>

    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
      <p style="margin: 0 0 10px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600;">
        Order Details
      </p>
      <p style="margin: 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
        Order ID: ${orderId}<br>
        Business: ${businessDomain}
      </p>
    </div>

    <p style="margin: 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
      If you have any questions about your report or need assistance, please don't hesitate to reach out to our support team.
    </p>
  `

  return baseTemplate(content)
}