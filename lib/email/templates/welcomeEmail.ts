import type { WelcomeEmailData } from '../types'

/**
 * Welcome email template
 * This is a minimal stub implementation
 */
export function welcomeEmailTemplate(data: WelcomeEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Anthrasite</title>
      </head>
      <body>
        <h1>Welcome!</h1>
        <p>Thank you for joining us.</p>
        <p>Business: ${data.businessDomain}</p>
        <p>This is a minimal stub implementation.</p>
      </body>
    </html>
  `
}