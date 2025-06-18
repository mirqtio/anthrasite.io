import {
  sendOrderConfirmationEmail,
  sendCartRecoveryEmail,
  sendReportReadyEmail,
  sendWelcomeEmail,
  getEmailService,
  validateEmailConfig
} from '../index'
import { EmailService } from '../email-service'

// Mock EmailService
jest.mock('../email-service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendOrderConfirmation: jest.fn().mockResolvedValue(true),
    sendCartRecovery: jest.fn().mockResolvedValue(true),
    sendReportReady: jest.fn().mockResolvedValue(true),
    sendWelcome: jest.fn().mockResolvedValue(true)
  }))
}))

// Mock config validation
jest.mock('../config', () => ({
  validateEmailConfig: jest.fn()
}))

describe('Email Module Exports', () => {
  let mockEmailService: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockEmailService = new (EmailService as any)()
  })

  describe('sendOrderConfirmationEmail', () => {
    it('should send order confirmation email', async () => {
      const emailData = {
        to: 'test@example.com',
        businessName: 'Test Business',
        domain: 'testbusiness.com',
        reportUrl: 'https://example.com/report.pdf',
        amount: '$99.00'
      }

      const result = await sendOrderConfirmationEmail(emailData)

      expect(result).toBe(true)
      expect(mockEmailService.sendOrderConfirmation).toHaveBeenCalledWith(emailData)
    })

    it('should handle errors gracefully', async () => {
      mockEmailService.sendOrderConfirmation.mockRejectedValue(new Error('Send failed'))

      const result = await sendOrderConfirmationEmail({
        to: 'test@example.com',
        businessName: 'Test',
        domain: 'test.com',
        reportUrl: 'https://example.com/report.pdf',
        amount: '$99'
      })

      expect(result).toBe(false)
    })
  })

  describe('sendCartRecoveryEmail', () => {
    it('should send cart recovery email', async () => {
      const emailData = {
        to: 'test@example.com',
        businessName: 'Test Business',
        domain: 'testbusiness.com',
        cartValue: '$99.00',
        recoveryUrl: 'https://example.com/recover',
        attemptNumber: 1
      }

      const result = await sendCartRecoveryEmail(emailData)

      expect(result).toBe(true)
      expect(mockEmailService.sendCartRecovery).toHaveBeenCalledWith(emailData)
    })
  })

  describe('sendReportReadyEmail', () => {
    it('should send report ready email', async () => {
      const emailData = {
        to: 'test@example.com',
        businessName: 'Test Business',
        domain: 'testbusiness.com',
        reportUrl: 'https://example.com/report.pdf'
      }

      const result = await sendReportReadyEmail(emailData)

      expect(result).toBe(true)
      expect(mockEmailService.sendReportReady).toHaveBeenCalledWith(emailData)
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const emailData = {
        to: 'test@example.com',
        name: 'Test User'
      }

      const result = await sendWelcomeEmail(emailData)

      expect(result).toBe(true)
      expect(mockEmailService.sendWelcome).toHaveBeenCalledWith(emailData)
    })
  })

  describe('getEmailService', () => {
    it('should return email service instance', () => {
      const service = getEmailService()
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(EmailService)
    })

    it('should return same instance on multiple calls', () => {
      const service1 = getEmailService()
      const service2 = getEmailService()
      expect(service1).toBe(service2)
    })
  })

  describe('validateEmailConfig', () => {
    it('should be exported from config', () => {
      expect(validateEmailConfig).toBeDefined()
      expect(typeof validateEmailConfig).toBe('function')
    })
  })
})