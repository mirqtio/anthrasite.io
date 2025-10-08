import type { OrderConfirmationData } from '../types'

/**
 * Order confirmation email template
 * This is a minimal stub implementation
 */
export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body>
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <p>Order ID: ${data.orderId}</p>
        <p>Business: ${data.businessDomain}</p>
        <p>Amount: $${data.amount.toFixed(2)}</p>
        <p>This is a minimal stub implementation.</p>
      </body>
    </html>
  `
}