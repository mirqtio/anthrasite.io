import { emailConfig } from '../config'

// Mock the email functions directly
jest.mock('../email-service', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue({
    success: true,
    status: 'sent',
    messageId: 'test-message-id',
  }),
  sendCartRecoveryEmail: jest.fn().mockResolvedValue({
    success: true,
    status: 'sent',
    messageId: 'test-message-id',
  }),
  sendReportReady: jest.fn().mockResolvedValue({
    success: true,
    status: 'sent',
    messageId: 'test-message-id',
  }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({
    success: true,
    status: 'sent',
    messageId: 'test-message-id',
  }),
  getEmailQueueStats: jest.fn().mockReturnValue({ pending: 0, failed: 0 }),
}))

// Import after mocking
import {
  sendOrderConfirmation,
  sendCartRecoveryEmail,
  sendReportReady,
  sendWelcomeEmail,
} from '../index'

describe('Email Module Exports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email', async () => {
      const emailData = {
        to: 'test@example.com',
        businessName: 'Test Business',
        businessDomain: 'testbusiness.com',
        reportUrl: 'https://example.com/report.pdf',
        amount: '$99.00',
        orderId: 'test-order-123',
      }

      const result = await sendOrderConfirmation(emailData)

      expect(result.success).toBe(true)
      expect(result.status).toBe('sent')
    })

    it('should handle errors gracefully', async () => {
      // Mock the email service to return failure
      const emailService = require('../email-service')
      emailService.sendOrderConfirmation.mockResolvedValueOnce({
        success: false,
        status: 'failed',
        error: 'Send failed',
      })

      const result = await sendOrderConfirmation({
        to: 'test@example.com',
        businessName: 'Test',
        businessDomain: 'test.com',
        reportUrl: 'https://example.com/report.pdf',
        amount: '$99',
        orderId: 'test-order',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Send failed')
    })
  })

  describe('sendCartRecoveryEmail', () => {
    it('should send cart recovery email', async () => {
      const emailData = {
        to: 'test@example.com',
        businessName: 'Test Business',
        amount: '$99.00',
        recoveryUrl: 'https://example.com/recover',
        itemName: 'Website Audit',
      }

      const result = await sendCartRecoveryEmail(emailData)

      expect(result.success).toBe(true)
    })
  })

  describe('sendReportReady', () => {
    it('should send report ready email', async () => {
      const emailData = {
        to: 'test@example.com',
        businessName: 'Test Business',
        businessDomain: 'testbusiness.com',
        reportUrl: 'https://example.com/report.pdf',
        orderId: 'test-order-456',
      }

      const result = await sendReportReady(emailData)

      expect(result.success).toBe(true)
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const emailData = {
        to: 'test@example.com',
        name: 'Test User',
        businessDomain: 'testbusiness.com',
      }

      const result = await sendWelcomeEmail(emailData)

      expect(result.success).toBe(true)
    })
  })

  describe('emailConfig', () => {
    it('should be exported from config', () => {
      expect(emailConfig).toBeDefined()
      expect(typeof emailConfig).toBe('object')
    })
  })
})
