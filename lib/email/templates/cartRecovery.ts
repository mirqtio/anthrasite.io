import { baseTemplate, emailButton, emailDivider } from './base-template'

export interface CartRecoveryEmailData {
  businessName: string
  amount: string
  currency: string
  recoveryUrl: string
  expiresAt: Date
}

export const cartRecoveryEmail = (data: CartRecoveryEmailData) => {
  const expiresIn = Math.ceil(
    (data.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
  )

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1a202c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 700;">
      Complete Your Purchase
    </h2>
    
    <p style="margin: 0 0 20px 0; color: #4a5568; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      Hi there,
    </p>
    
    <p style="margin: 0 0 20px 0; color: #4a5568; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      We noticed you were interested in purchasing an Anthrasite Business Intelligence Report for <strong>${data.businessName}</strong>, but didn't complete your order.
    </p>
    
    <p style="margin: 0 0 30px 0; color: #4a5568; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      Your comprehensive report is still available for <strong>${data.currency} ${data.amount}</strong>. Complete your purchase now to get instant insights into:
    </p>
    
    <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4a5568; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      <li style="margin-bottom: 8px;">Traffic patterns and user behavior analysis</li>
      <li style="margin-bottom: 8px;">Market positioning and competitive insights</li>
      <li style="margin-bottom: 8px;">Revenue potential and growth opportunities</li>
      <li style="margin-bottom: 8px;">Technical performance metrics</li>
      <li style="margin-bottom: 8px;">Actionable recommendations for improvement</li>
    </ul>
    
    <div style="text-align: center; margin: 0 0 30px 0;">
      ${emailButton('Complete Your Purchase', data.recoveryUrl)}
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 0 0 30px 0;">
      <p style="margin: 0; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
        <strong>Limited Time:</strong> This checkout session expires in ${expiresIn} hours. After that, you'll need to start a new purchase.
      </p>
    </div>
    
    ${emailDivider()}
    
    <h3 style="margin: 0 0 15px 0; color: #1a202c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600;">
      Why Complete Your Purchase?
    </h3>
    
    <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 0 0 30px 0;">
      <p style="margin: 0 0 15px 0; color: #2d3748; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px;">
        <strong>Immediate Access:</strong> Your report is generated instantly upon purchase
      </p>
      <p style="margin: 0 0 15px 0; color: #2d3748; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px;">
        <strong>Data-Driven Insights:</strong> Make informed decisions based on comprehensive analytics
      </p>
      <p style="margin: 0; color: #2d3748; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px;">
        <strong>One-Time Purchase:</strong> No subscriptions or recurring charges
      </p>
    </div>
    
    <p style="margin: 0 0 20px 0; color: #718096; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; text-align: center;">
      Need help? Reply to this email or contact us at <a href="mailto:support@anthrasite.io" style="color: #3b82f6; text-decoration: none;">support@anthrasite.io</a>
    </p>
    
    <p style="margin: 0; color: #a0aec0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 18px; text-align: center;">
      If you're no longer interested, you can safely ignore this email. We won't send another reminder.
    </p>
  `

  return baseTemplate(content)
}
