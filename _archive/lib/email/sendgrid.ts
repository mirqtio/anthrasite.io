// Barrel export for sendgrid-compatible email sending
// Maps to existing email service implementation

import { sendOrderConfirmation } from './email-service'

export interface SendEmailOptions {
  to: string
  templateId: string
  dynamicTemplateData: Record<string, any>
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  // Map to existing email service
  // For now, use sendOrderConfirmation as it's the closest match
  // TODO: Create proper template mapping based on templateId
  if (options.templateId === 'purchase_confirmation') {
    await sendOrderConfirmation({
      to: options.to,
      customerName: options.dynamicTemplateData.businessName,
      orderId: options.dynamicTemplateData.purchaseId || 'unknown',
      businessDomain: options.dynamicTemplateData.domain,
      amount: options.dynamicTemplateData.amount || 0,
      currency: 'usd',
      purchaseDate: new Date(),
    })
  }
}
