import type { ReportReadyData } from '../types'

/**
 * Report ready notification email template
 * This is a minimal stub implementation
 */
export function reportReadyTemplate(data: ReportReadyData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Report is Ready</title>
      </head>
      <body>
        <h1>Your Report is Ready!</h1>
        <p>Your competitive intelligence report for ${data.businessDomain} is now ready.</p>
        <p>Order ID: ${data.orderId}</p>
        <p><a href="${data.reportUrl}">View Your Report</a></p>
        <p>This is a minimal stub implementation.</p>
      </body>
    </html>
  `
}