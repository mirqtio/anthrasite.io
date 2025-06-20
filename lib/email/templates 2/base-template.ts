// Base email template with consistent header and footer
export const baseTemplate = (content: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anthrasite</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* Remove default styling */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .mobile-hide { display: none !important; }
      .mobile-center { text-align: center !important; }
      .container { padding: 0 10px !important; width: 100% !important; }
      .content { padding: 20px !important; }
    }

    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      .dark-mode-bg { background-color: #1a1a1a !important; }
      .dark-mode-text { color: #ffffff !important; }
      .dark-mode-link { color: #4a9eff !important; }
    }
  </style>
</head>
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">

  <!-- Hidden preheader text -->
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <!-- Header -->
    <tr>
      <td bgcolor="#0f172a" align="center" style="padding: 40px 0 30px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="container">
          <tr>
            <td align="center" valign="top" style="padding: 0 20px;">
              <h1 style="margin: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Anthrasite
              </h1>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px;">
                Business Intelligence Reports
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td bgcolor="#f4f4f4" align="center" style="padding: 0 0 40px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="container">
          <tr>
            <td bgcolor="#ffffff" align="left" style="padding: 40px 30px 40px 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" class="content">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td bgcolor="#f4f4f4" align="center" style="padding: 0 0 40px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="container">
          <tr>
            <td align="center" style="padding: 0 20px;">
              <p style="margin: 0 0 10px 0; color: #666666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 18px;">
                © ${new Date().getFullYear()} Anthrasite. All rights reserved.
              </p>
              <p style="margin: 0 0 10px 0; color: #666666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 18px;">
                Questions? Contact us at <a href="mailto:support@anthrasite.io" style="color: #3b82f6; text-decoration: none;">support@anthrasite.io</a>
              </p>
              <p style="margin: 0; color: #999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; line-height: 16px;">
                You received this email because you made a purchase at Anthrasite.io
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

// Helper to create a button
export const emailButton = (text: string, href: string) => {
  return `
    <table border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="border-radius: 6px;" bgcolor="#3b82f6">
          <a href="${href}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `.trim()
}

// Helper to create a divider
export const emailDivider = () => {
  return '<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">'
}
