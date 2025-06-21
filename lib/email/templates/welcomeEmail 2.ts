import { baseTemplate, emailButton, emailDivider } from './base-template'
import type { WelcomeEmailData } from '../types'

export const welcomeEmailTemplate = (data: WelcomeEmailData): string => {
  const { customerName, businessDomain } = data

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 600;">
      Welcome to Anthrasite! 👋
    </h2>

    <p style="margin: 0 0 20px 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      ${customerName ? `Hi ${customerName},` : 'Hello,'}
    </p>

    <p style="margin: 0 0 30px 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
      Thank you for choosing Anthrasite for your business intelligence needs. We're excited to help you uncover valuable insights about <strong>${businessDomain}</strong>.
    </p>

    ${emailDivider()}

    <h3 style="margin: 0 0 15px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600;">
      What is Anthrasite?
    </h3>

    <p style="margin: 0 0 30px 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
      Anthrasite is an AI-powered business intelligence platform that analyzes public data to provide comprehensive reports about any business. Our reports help you:
    </p>

    <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
      <li style="margin-bottom: 8px;">Understand market positioning and competitive landscape</li>
      <li style="margin-bottom: 8px;">Analyze financial health and growth trajectories</li>
      <li style="margin-bottom: 8px;">Identify technology stacks and innovation patterns</li>
      <li style="margin-bottom: 8px;">Track team growth and hiring trends</li>
      <li>Discover strategic opportunities and potential risks</li>
    </ul>

    ${emailDivider()}

    <h3 style="margin: 0 0 15px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600;">
      Why Choose Anthrasite?
    </h3>

    <div style="margin: 0 0 30px 0;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
        <div style="flex-shrink: 0; width: 40px; height: 40px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 20px;">🎯</span>
        </div>
        <div>
          <h4 style="margin: 0 0 5px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 600;">
            Accurate & Comprehensive
          </h4>
          <p style="margin: 0; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
            Our AI analyzes thousands of data points from verified sources
          </p>
        </div>
      </div>

      <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
        <div style="flex-shrink: 0; width: 40px; height: 40px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 20px;">⚡</span>
        </div>
        <div>
          <h4 style="margin: 0 0 5px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 600;">
            Fast Delivery
          </h4>
          <p style="margin: 0; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
            Get your report within 24 hours of purchase
          </p>
        </div>
      </div>

      <div style="display: flex; align-items: flex-start;">
        <div style="flex-shrink: 0; width: 40px; height: 40px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="font-size: 20px;">🔒</span>
        </div>
        <div>
          <h4 style="margin: 0 0 5px 0; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 600;">
            Secure & Private
          </h4>
          <p style="margin: 0; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
            Your data and reports are protected with enterprise-grade security
          </p>
        </div>
      </div>
    </div>

    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
      <p style="margin: 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
        <strong style="color: #1e293b;">Need assistance?</strong><br>
        Our team is here to help. Reply to this email or visit our help center for FAQs, guides, and support resources.
      </p>
    </div>

    <p style="margin: 0; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px;">
      Thank you for trusting Anthrasite with your business intelligence needs. We look forward to delivering valuable insights for your success.
    </p>
  `

  return baseTemplate(content)
}
