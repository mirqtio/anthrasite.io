/**
 * Report Ready Email Template
 *
 * This email is the customer's FIRST interaction with their purchased report.
 * It's onboarding, not just a notification. The email must:
 * 1. Orient them to what they're about to see
 * 2. Explain how to read the report (it's not obvious)
 * 3. Set expectations about the dollar estimates
 * 4. Reduce anxiety and make them feel supported
 *
 * Design matches Anthrasite landing/purchase pages:
 * - Background: #232323
 * - Text primary: #FFFFFF
 * - Text secondary: rgba(255,255,255,0.6)
 * - CTA button: #0066FF
 * - Section backgrounds: rgba(255,255,255,0.05)
 * - Borders: rgba(255,255,255,0.1)
 */

export interface ReportReadyContext {
  firstName: string
  businessName: string
  reportLink: string // The tracked click URL (via /api/email/click)
}

export interface ReportReadyEmail {
  subject: string
  html: string
  text: string
}

/**
 * Build the report ready email
 */
export function buildReportReadyEmail(
  ctx: ReportReadyContext
): ReportReadyEmail {
  return {
    subject: `Your Anthrasite report for ${ctx.businessName}`,
    html: buildHtmlEmail(ctx),
    text: buildPlainTextEmail(ctx),
  }
}

/**
 * HTML email with inline styles
 */
function buildHtmlEmail(ctx: ReportReadyContext): string {
  const { firstName, businessName, reportLink } = ctx

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Anthrasite report for ${escapeHtml(businessName)}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button { padding: 16px 32px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #232323; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Wrapper table for email clients -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #232323;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Content container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

          <!-- Greeting + Intro -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0 0 16px 0; font-size: 18px; color: #FFFFFF; line-height: 1.6;">
                Hi ${escapeHtml(firstName)},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 18px; color: #FFFFFF; line-height: 1.6;">
                Your website audit for ${escapeHtml(businessName)} is ready.
              </p>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #0066FF; border-radius: 6px;">
                    <a href="${escapeHtml(reportLink)}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 6px;">
                      Download Your Report
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Intro paragraph -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                This report shows where ${escapeHtml(businessName)}'s site is helping&mdash;or holding back&mdash;people who are trying to find you, trust you, and take action. It's designed to be practical, not theoretical.
              </p>
            </td>
          </tr>

          <!-- How to Use the Report -->
          <tr>
            <td style="padding: 24px; background-color: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="margin: 0; font-size: 14px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">
                      How to Use the Report
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0 0;">
                    <ul style="margin: 0; padding: 0 0 0 20px; color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.8;">
                      <li style="margin: 0 0 8px 0;">Start with Page 1 for the overall score, impact range, and top priorities.</li>
                      <li style="margin: 0 0 8px 0;">The Priority Details pages explain what matters most and why, in order of business impact.</li>
                      <li style="margin: 0;">The Detailed Results sections show the exact measurements behind each finding.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 24px;"></td></tr>

          <!-- What's in the Report -->
          <tr>
            <td style="padding: 24px; background-color: rgba(255,255,255,0.05); border-radius: 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="margin: 0; font-size: 14px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">
                      What's in the Report
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0 0;">
                    <ul style="margin: 0; padding: 0 0 0 20px; color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.8;">
                      <li style="margin: 0 0 8px 0;">Your overall performance score</li>
                      <li style="margin: 0 0 8px 0;">A ranked list of the most important issues</li>
                      <li style="margin: 0 0 8px 0;">Estimated monthly value ranges tied to fixing each issue</li>
                      <li style="margin: 0;">Detailed measurements organized by how visitors experience your site</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 24px;"></td></tr>

          <!-- How Issues and Dollar Estimates Work -->
          <tr>
            <td style="padding: 24px; background-color: rgba(255,255,255,0.05); border-radius: 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="margin: 0; font-size: 14px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">
                      How Issues and Dollar Estimates Work
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0 0;">
                    <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      Issues are identified by grouping related metrics that create real friction for visitors. Dollar ranges are directional estimates, based on your business size, issue severity, and where the problem appears in the customer journey. They're meant to help you prioritize&mdash;not to forecast outcomes.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 24px;"></td></tr>

          <!-- How the Sections are Organized -->
          <tr>
            <td style="padding: 24px; background-color: rgba(255,255,255,0.05); border-radius: 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="margin: 0; font-size: 14px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">
                      How the Sections are Organized
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0 0;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      Findings are grouped by four journey stages:
                    </p>
                    <ul style="margin: 0 0 16px 0; padding: 0 0 0 20px; color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.8;">
                      <li style="margin: 0 0 8px 0;"><strong style="color: #FFFFFF;">Find</strong> &mdash; how customers discover you</li>
                      <li style="margin: 0 0 8px 0;"><strong style="color: #FFFFFF;">Trust</strong> &mdash; whether you appear credible</li>
                      <li style="margin: 0 0 8px 0;"><strong style="color: #FFFFFF;">Understand</strong> &mdash; how clearly you explain what you offer</li>
                      <li style="margin: 0;"><strong style="color: #FFFFFF;">Contact</strong> &mdash; how easily customers can take the next step</li>
                    </ul>
                    <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      You don't need to read it all at once. Fixing even one or two high-impact items can make a meaningful difference.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 32px;"></td></tr>

          <!-- Secondary CTA Button -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #0066FF; border-radius: 6px;">
                    <a href="${escapeHtml(reportLink)}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 6px;">
                      Download Your Report
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reply invitation + Sign-off -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                If you have questions or want help interpreting anything, just reply to this email.
              </p>
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                &mdash;<br>
                Charlie<br>
                Founder, Anthrasite
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Plain text version (required for deliverability)
 */
function buildPlainTextEmail(ctx: ReportReadyContext): string {
  const { firstName, businessName, reportLink } = ctx

  return `Hi ${firstName},

Your website audit for ${businessName} is ready.

Download your report: ${reportLink}

This report shows where ${businessName}'s site is helping—or holding back—people who are trying to find you, trust you, and take action. It's designed to be practical, not theoretical.


HOW TO USE THE REPORT

- Start with Page 1 for the overall score, impact range, and top priorities.
- The Priority Details pages explain what matters most and why, in order of business impact.
- The Detailed Results sections show the exact measurements behind each finding.


WHAT'S IN THE REPORT

- Your overall performance score
- A ranked list of the most important issues
- Estimated monthly value ranges tied to fixing each issue
- Detailed measurements organized by how visitors experience your site


HOW ISSUES AND DOLLAR ESTIMATES WORK

Issues are identified by grouping related metrics that create real friction for visitors. Dollar ranges are directional estimates, based on your business size, issue severity, and where the problem appears in the customer journey. They're meant to help you prioritize—not to forecast outcomes.


HOW THE SECTIONS ARE ORGANIZED

Findings are grouped by four journey stages:

- Find — how customers discover you
- Trust — whether you appear credible
- Understand — how clearly you explain what you offer
- Contact — how easily customers can take the next step

You don't need to read it all at once. Fixing even one or two high-impact items can make a meaningful difference.

Download your report: ${reportLink}

If you have questions or want help interpreting anything, just reply to this email.

—
Charlie
Founder, Anthrasite
`
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Re-export for backwards compatibility with old interface
export function reportReadyTemplate(data: {
  businessDomain: string
  orderId: string
  reportUrl: string
}): string {
  // Legacy wrapper - use buildReportReadyEmail for new code
  const email = buildReportReadyEmail({
    firstName: 'Customer',
    businessName: data.businessDomain,
    reportLink: data.reportUrl,
  })
  return email.html
}
