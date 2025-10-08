import type { CartRecoveryEmailData } from '../types'

/**
 * Cart recovery email template
 * This is a minimal stub implementation
 */
export function cartRecoveryEmail(data: CartRecoveryEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Complete Your Purchase</title>
      </head>
      <body>
        <h1>Complete Your Purchase</h1>
        <p>You left something in your cart!</p>
        <p>Business: ${data.businessName}</p>
        <p>Amount: $${data.amount}</p>
        <p><a href="${data.recoveryUrl}">Complete Purchase</a></p>
        <p>This is a minimal stub implementation.</p>
      </body>
    </html>
  `
}