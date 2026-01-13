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
 * - Element spacing: 48px
 */

export interface ReportReadyContext {
  firstName: string
  businessName: string
  reportLink: string // The tracked click URL (via /api/email/click)
  // Optional referral info (if customer has a referral code)
  referral?: {
    code: string
    shareUrl: string // e.g., https://www.anthrasite.io/?promo=CODE
    discountDisplay: string // e.g., "$100 off"
    rewardDisplay: string // e.g., "$100"
  }
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
  <!-- Prevent Gmail/email clients from auto-darkening or lightening -->
  <meta name="color-scheme" content="only">
  <meta name="supported-color-schemes" content="only">
  <title>Your Anthrasite report for ${escapeHtml(businessName)}</title>
  <style>
    /* Prevent Gmail dark mode color inversion */
    :root {
      color-scheme: only;
      supported-color-schemes: only;
    }
    /* Gmail dark mode prevention - force our colors */
    u + .body, /* Gmail */
    #MessageViewBody, /* Gmail */
    div[style*="margin: 16px 0"] /* Gmail iOS */ {
      background-color: #232323 !important;
    }
    /* Override Gmail's data attributes for color manipulation */
    [data-ogsc] .dark-bg,
    [data-ogsb] .dark-bg { background-color: #232323 !important; }
    [data-ogsc] .white-text,
    [data-ogsb] .white-text { color: #FFFFFF !important; }
    [data-ogsc] .muted-text,
    [data-ogsb] .muted-text { color: rgba(255,255,255,0.6) !important; }
    /* Standard class overrides */
    .dark-bg { background-color: #232323 !important; }
    .white-text { color: #FFFFFF !important; }
    .muted-text { color: rgba(255,255,255,0.6) !important; }
    /* Gmail app-specific overrides */
    .dark-bg[style] { background-color: #232323 !important; }
    td.dark-bg { background-color: #232323 !important; }
    table.dark-bg { background-color: #232323 !important; }
  </style>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button { padding: 16px 32px !important; }
  </style>
  <![endif]-->
</head>
<body class="body dark-bg" style="margin: 0; padding: 0; background-color: #232323; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Wrapper table for email clients -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="dark-bg" style="background-color: #232323;">
    <tr>
      <td align="center" class="dark-bg" style="padding: 40px 20px; background-color: #232323;">
        <!-- Content container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

          <!-- Logo + Tagline -->
          <tr>
            <td style="padding: 0 0 48px 0;">
              <a href="https://anthrasite.io" target="_blank" style="text-decoration: none;">
                <img src="https://assets.anthrasite.io/logo_tagline_final.png" alt="Anthrasite - Value, Crystallized" width="220" height="35" style="display: block; width: 220px; height: auto; border: 0;" />
              </a>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <p class="white-text" style="margin: 0; font-size: 18px; color: #FFFFFF; line-height: 1.6;">
                Hi ${escapeHtml(firstName)},
              </p>
            </td>
          </tr>

          <!-- Intro paragraph -->
          <tr>
            <td style="padding: 0 0 48px 0;">
              <p class="muted-text" style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                This report shows how well ${escapeHtml(businessName)}'s site helps people find you, trust you, and take action. It's designed to be practical, not theoretical.
              </p>
            </td>
          </tr>

          <!-- CTA Button (first) -->
          <tr>
            <td align="center" style="padding: 0 0 48px 0;">
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

          <!-- How to Use the Report -->
          <tr>
            <td style="padding: 24px; background-color: rgba(255,255,255,0.05); border-radius: 8px;">
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
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      You can tackle these findings yourself or hand this report to the person who helps with your website.
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      <strong style="color: #FFFFFF;">Page 1</strong> shows your total score, the expected financial impact, and top priorities. This gives you a clear overview of where you stand.
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      <strong style="color: #FFFFFF;">The Priority Details page</strong> shows each issue we found, ranked by business impact. It is a list of opportunities to improve your website and business.
                    </p>
                    <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      <strong style="color: #FFFFFF;">The Detailed Results sections</strong> show the exact measurements behind each finding. We give you the details behind the conclusions, with clear explanations of what they mean.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 48px;"></td></tr>

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
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      <strong style="color: #FFFFFF;">Your overall performance score.</strong> The weighted total of how your site performed across all the metrics we measure.
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      <strong style="color: #FFFFFF;">Estimated monthly value across all issues.</strong> Dollar ranges are rough estimates. They depend on your business size, the severity of the issue, and where it happens in the customer journey. They're meant to help you prioritize&mdash;not to forecast outcomes.
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      <strong style="color: #FFFFFF;">A ranked list of the most important issues.</strong> We identify issues by grouping related metrics that create real friction for visitors.
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      <strong style="color: #FFFFFF;">Detailed measurements organized by how visitors experience your site.</strong> We group findings into four customer journey stages:
                    </p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.8;">
                      <li style="margin: 0 0 8px 0;"><strong style="color: #FFFFFF;">Find</strong> &mdash; how customers discover you.</li>
                      <li style="margin: 0 0 8px 0;"><strong style="color: #FFFFFF;">Trust</strong> &mdash; whether you appear credible.</li>
                      <li style="margin: 0 0 8px 0;"><strong style="color: #FFFFFF;">Understand</strong> &mdash; how clearly you explain what you offer.</li>
                      <li style="margin: 0;"><strong style="color: #FFFFFF;">Contact</strong> &mdash; how easily customers can take the next step.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 48px;"></td></tr>

          <!-- Encouragement text (moved out of card) -->
          <tr>
            <td style="padding: 0 0 48px 0;">
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                You don't need to read it all at once. Fixing even one or two high-impact items can make a meaningful difference.
              </p>
            </td>
          </tr>

          ${
            ctx.referral
              ? `
          <!-- Referral Share Section -->
          <tr>
            <td style="padding: 24px; background-color: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(0,102,255,0.2);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 16px 0;">
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #FFFFFF;">
                      Know someone who'd find this useful?
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 16px 0;">
                    <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.8); line-height: 1.6;">
                      Share your code &mdash; they'll get ${escapeHtml(ctx.referral.discountDisplay)}, and you'll get ${escapeHtml(ctx.referral.rewardDisplay)} back when they buy.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.6);">
                      Just share this link:
                    </p>
                    <p style="margin: 0; padding: 12px 16px; background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-family: monospace; font-size: 14px; color: rgba(255,255,255,0.8);">
                      ${escapeHtml(ctx.referral.shareUrl)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 48px;"></td></tr>

          <!-- Second CTA Button -->
          <tr>
            <td align="center" style="padding: 0 0 48px 0;">
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
          `
              : ''
          }

          <!-- Agency help + Sign-off -->
          <tr>
            <td style="padding: 0;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                If you need help finding an agency to work with, reply to this email.
              </p>
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                &mdash; Charlie<br>
                <span style="font-size: 14px;">Founder, Anthrasite</span>
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

  return `ANTHRASITE
VALUE, CRYSTALLIZED

Hi ${firstName},

This report shows how well ${businessName}'s site helps people find you, trust you, and take action. It's designed to be practical, not theoretical.


HOW TO USE THE REPORT

You can tackle these findings yourself or hand this report to the person who helps with your website.

Page 1 shows your total score, the expected financial impact, and top priorities. This gives you a clear overview of where you stand.

The Priority Details page shows each issue we found, ranked by business impact. It is a list of opportunities to improve your website and business.

The Detailed Results sections show the exact measurements behind each finding. We give you the details behind the conclusions, with clear explanations of what they mean.


WHAT'S IN THE REPORT

Your overall performance score. The weighted total of how your site performed across all the metrics we measure.

Estimated monthly value across all issues. Dollar ranges are rough estimates. They depend on your business size, the severity of the issue, and where it happens in the customer journey. They're meant to help you prioritize—not to forecast outcomes.

A ranked list of the most important issues. We identify issues by grouping related metrics that create real friction for visitors.

Detailed measurements organized by how visitors experience your site. We group findings into four customer journey stages:

- Find — how customers discover you.
- Trust — whether you appear credible.
- Understand — how clearly you explain what you offer.
- Contact — how easily customers can take the next step.


You don't need to read it all at once. Fixing even one or two high-impact items can make a meaningful difference.


Download Your Report: ${reportLink}

${
  ctx.referral
    ? `
KNOW SOMEONE WHO'D FIND THIS USEFUL?

Share your code — they'll get ${ctx.referral.discountDisplay}, and you'll get ${ctx.referral.rewardDisplay} back when they buy.

Just share this link:
${ctx.referral.shareUrl}


Download Your Report: ${reportLink}

`
    : ''
}
If you need help finding an agency to work with, reply to this email.

— Charlie
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
