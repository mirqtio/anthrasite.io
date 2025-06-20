import {
  sendOrderConfirmation,
  sendReportReady,
  sendWelcomeEmail,
} from '../email-service'
import { sgMail } from '../config'
import { emailQueue } from '../queue'
import type {
  OrderConfirmationData,
  ReportReadyData,
  WelcomeEmailData,
} from '../types'

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}))

// Mock the config to ensure email is configured
jest.mock('../config', () => ({
  sgMail: {
    send: jest.fn(),
  },
  emailConfig: {
    from: { email: 'test@example.com', name: 'Test' },
    replyTo: { email: 'reply@example.com', name: 'Reply' },
    templates: {
      orderConfirmation: { subject: 'Order Confirmation' },
      reportReady: { subject: 'Report Ready' },
      welcomeEmail: { subject: 'Welcome' },
    },
    features: {
      trackOpens: true,
      trackClicks: true,
      sandboxMode: false,
    },
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 60000,
      backoffMultiplier: 2,
    },
  },
  isEmailConfigured: () => true,
}))

// Mock email queue
jest.mock('../queue', () => ({
  emailQueue: {
    add: jest.fn(),
    clear: jest.fn(),
  },
}))

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendOrderConfirmation', () => {
    const mockOrderData: OrderConfirmationData = {
      to: 'customer@example.com',
      customerName: 'John Doe',
      orderId: 'order-123',
      businessDomain: 'example.com',
      amount: 9900,
      currency: 'usd',
      purchaseDate: new Date('2024-01-01'),
    }

    it('should send order confirmation email successfully', async () => {
      const mockResponse = [{ headers: { 'x-message-id': 'msg-123' } }]
      ;(sgMail.send as jest.Mock).mockResolvedValue(mockResponse)

      const result = await sendOrderConfirmation(mockOrderData)

      expect(result).toEqual({
        success: true,
        messageId: 'msg-123',
        status: 'sent',
      })

      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          from: { email: 'test@example.com', name: 'Test' },
          subject: 'Order Confirmation',
          html: expect.stringContaining('Order Confirmation'),
          categories: ['orderConfirmation'],
          customArgs: expect.objectContaining({
            purchaseId: 'order-123',
            businessId: 'example.com',
            template: 'orderConfirmation',
          }),
        })
      )
    })

    it('should queue email for retry on failure', async () => {
      const error = new Error('SendGrid error')
      ;(sgMail.send as jest.Mock).mockRejectedValue(error)

      const result = await sendOrderConfirmation(mockOrderData)

      expect(result).toEqual({
        success: false,
        status: 'failed',
        error: 'SendGrid error',
      })

      expect(emailQueue.add).toHaveBeenCalledWith(
        'orderConfirmation',
        mockOrderData,
        expect.objectContaining({
          template: 'orderConfirmation',
          purchaseId: 'order-123',
          businessId: 'example.com',
        }),
        'SendGrid error'
      )
    })

    it('should handle SendGrid API errors', async () => {
      const apiError = {
        response: {
          body: {
            errors: [{ message: 'Invalid email address' }],
          },
        },
      }
      ;(sgMail.send as jest.Mock).mockRejectedValue(apiError)

      const result = await sendOrderConfirmation(mockOrderData)

      expect(result).toEqual({
        success: false,
        status: 'failed',
        error: 'Invalid email address',
      })
    })
  })

  describe('sendReportReady', () => {
    const mockReportData: ReportReadyData = {
      to: 'customer@example.com',
      customerName: 'Jane Smith',
      orderId: 'order-456',
      businessDomain: 'business.com',
      reportUrl: 'https://example.com/report/123',
      expiresAt: new Date('2024-01-15'),
    }

    it('should send report ready email successfully', async () => {
      const mockResponse = [{ headers: { 'x-message-id': 'msg-456' } }]
      ;(sgMail.send as jest.Mock).mockResolvedValue(mockResponse)

      const result = await sendReportReady(mockReportData)

      expect(result).toEqual({
        success: true,
        messageId: 'msg-456',
        status: 'sent',
      })

      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: 'Report Ready',
          html: expect.stringContaining('Your Report is Ready'),
          html: expect.stringContaining('https://example.com/report/123'),
        })
      )
    })
  })

  describe('sendWelcomeEmail', () => {
    const mockWelcomeData: WelcomeEmailData = {
      to: 'newuser@example.com',
      customerName: 'New User',
      businessDomain: 'newbusiness.com',
    }

    it('should send welcome email successfully', async () => {
      const mockResponse = [{ headers: { 'x-message-id': 'msg-789' } }]
      ;(sgMail.send as jest.Mock).mockResolvedValue(mockResponse)

      const result = await sendWelcomeEmail(mockWelcomeData)

      expect(result).toEqual({
        success: true,
        messageId: 'msg-789',
        status: 'sent',
      })

      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@example.com',
          subject: 'Welcome',
          html: expect.stringContaining('Welcome to Anthrasite'),
        })
      )
    })

    it('should include tracking settings', async () => {
      const mockResponse = [{ headers: { 'x-message-id': 'msg-999' } }]
      ;(sgMail.send as jest.Mock).mockResolvedValue(mockResponse)

      await sendWelcomeEmail(mockWelcomeData, {
        trackOpens: false,
        trackClicks: false,
      })

      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          trackingSettings: {
            clickTracking: { enable: false },
            openTracking: { enable: false },
          },
        })
      )
    })
  })
})
