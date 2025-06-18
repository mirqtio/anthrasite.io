import { orderConfirmationTemplate } from '../templates/orderConfirmation'
import { reportReadyTemplate } from '../templates/reportReady'
import { welcomeEmailTemplate } from '../templates/welcomeEmail'
import {
  baseTemplate,
  emailButton,
  emailDivider,
} from '../templates/base-template'
import type {
  OrderConfirmationData,
  ReportReadyData,
  WelcomeEmailData,
} from '../types'

describe('Email Templates', () => {
  describe('baseTemplate', () => {
    it('should wrap content in HTML template', () => {
      const content = '<p>Test content</p>'
      const result = baseTemplate(content)

      expect(result).toContain('<!DOCTYPE html>')
      expect(result).toContain('<p>Test content</p>')
      expect(result).toContain('Anthrasite')
      expect(result).toContain('support@anthrasite.io')
    })

    it('should include responsive styles', () => {
      const result = baseTemplate('test')

      expect(result).toContain('@media screen and (max-width: 600px)')
      expect(result).toContain('mobile-hide')
      expect(result).toContain('mobile-center')
    })

    it('should include dark mode styles', () => {
      const result = baseTemplate('test')

      expect(result).toContain('@media (prefers-color-scheme: dark)')
      expect(result).toContain('dark-mode-bg')
      expect(result).toContain('dark-mode-text')
    })
  })

  describe('emailButton', () => {
    it('should create a button with link', () => {
      const result = emailButton('Click Me', 'https://example.com')

      expect(result).toContain('Click Me')
      expect(result).toContain('href="https://example.com"')
      expect(result).toContain('bgcolor="#3b82f6"')
    })
  })

  describe('emailDivider', () => {
    it('should create a horizontal divider', () => {
      const result = emailDivider()

      expect(result).toContain('<hr')
      expect(result).toContain('border-top: 1px solid #e5e7eb')
    })
  })

  describe('orderConfirmationTemplate', () => {
    const mockData: OrderConfirmationData = {
      to: 'customer@example.com',
      customerName: 'John Doe',
      orderId: 'order-123',
      businessDomain: 'example.com',
      amount: 9900,
      currency: 'usd',
      purchaseDate: new Date('2024-01-01T10:00:00Z'),
    }

    it('should generate order confirmation email', () => {
      const result = orderConfirmationTemplate(mockData)

      expect(result).toContain('Order Confirmation')
      expect(result).toContain('Hi John Doe,')
      expect(result).toContain('order-123')
      expect(result).toContain('example.com')
      expect(result).toContain('$99')
    })

    it('should handle missing customer name', () => {
      const dataWithoutName = { ...mockData, customerName: undefined }
      const result = orderConfirmationTemplate(dataWithoutName)

      expect(result).toContain('Hello,')
      expect(result).not.toContain('Hi undefined')
    })

    it('should format currency correctly', () => {
      const euroData = { ...mockData, amount: 8900, currency: 'eur' }
      const result = orderConfirmationTemplate(euroData)

      // Should contain currency symbol (might be € or EUR depending on locale)
      expect(result).toMatch(/€89|EUR\s*89/)
    })

    it('should include order details table', () => {
      const result = orderConfirmationTemplate(mockData)

      expect(result).toContain('Order Details')
      expect(result).toContain('Order ID')
      expect(result).toContain('Business Domain')
      expect(result).toContain('Purchase Date')
      expect(result).toContain('Total')
    })

    it('should include next steps', () => {
      const result = orderConfirmationTemplate(mockData)

      expect(result).toContain('What Happens Next?')
      expect(result).toContain('AI-powered analysis engine')
      expect(result).toContain('within 24 hours')
    })
  })

  describe('reportReadyTemplate', () => {
    const mockData: ReportReadyData = {
      to: 'customer@example.com',
      customerName: 'Jane Smith',
      orderId: 'order-456',
      businessDomain: 'business.com',
      reportUrl: 'https://example.com/report/123',
      expiresAt: new Date('2024-01-15'),
    }

    it('should generate report ready email', () => {
      const result = reportReadyTemplate(mockData)

      expect(result).toContain('Your Report is Ready! 🎉')
      expect(result).toContain('Hi Jane Smith,')
      expect(result).toContain('business.com')
      expect(result).toContain('Download Your Report')
      expect(result).toContain('https://example.com/report/123')
    })

    it('should include expiration warning', () => {
      const result = reportReadyTemplate(mockData)

      expect(result).toContain('Important:')
      expect(result).toContain('This download link will expire')
      expect(result).toContain('January 15, 2024')
    })

    it('should list report contents', () => {
      const result = reportReadyTemplate(mockData)

      expect(result).toContain("What's Included in Your Report")
      expect(result).toContain('Company overview')
      expect(result).toContain('Market position')
      expect(result).toContain('Financial indicators')
      expect(result).toContain('Technology stack')
    })

    it('should include usage instructions', () => {
      const result = reportReadyTemplate(mockData)

      expect(result).toContain('How to Use Your Report')
      expect(result).toContain('Review the executive summary')
      expect(result).toContain('Share insights with your team')
    })
  })

  describe('welcomeEmailTemplate', () => {
    const mockData: WelcomeEmailData = {
      to: 'newuser@example.com',
      customerName: 'New User',
      businessDomain: 'newbusiness.com',
    }

    it('should generate welcome email', () => {
      const result = welcomeEmailTemplate(mockData)

      expect(result).toContain('Welcome to Anthrasite! 👋')
      expect(result).toContain('Hi New User,')
      expect(result).toContain('newbusiness.com')
    })

    it('should explain Anthrasite features', () => {
      const result = welcomeEmailTemplate(mockData)

      expect(result).toContain('What is Anthrasite?')
      expect(result).toContain('AI-powered business intelligence')
      expect(result).toContain('market positioning')
      expect(result).toContain('financial health')
    })

    it('should highlight key benefits', () => {
      const result = welcomeEmailTemplate(mockData)

      expect(result).toContain('Why Choose Anthrasite?')
      expect(result).toContain('Accurate & Comprehensive')
      expect(result).toContain('Fast Delivery')
      expect(result).toContain('Secure & Private')
    })

    it('should include visual benefit icons', () => {
      const result = welcomeEmailTemplate(mockData)

      expect(result).toContain('🎯')
      expect(result).toContain('⚡')
      expect(result).toContain('🔒')
    })
  })
})
