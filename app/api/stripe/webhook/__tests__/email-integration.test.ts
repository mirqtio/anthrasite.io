import { POST } from '../route'
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { prisma } from '@/lib/db'
import { sendOrderConfirmation, sendWelcomeEmail } from '@/lib/email/email-service'
import type { Stripe } from 'stripe'

// Mock dependencies
jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
  webhookSecret: 'test-secret',
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    purchase: {
      create: jest.fn(),
      count: jest.fn(),
    },
    business: {
      findUnique: jest.fn(),
    },
    utmToken: {
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/email/email-service', () => ({
  sendOrderConfirmation: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}))

describe('Stripe Webhook - Email Integration', () => {
  const mockHeaders = {
    get: jest.fn((name: string) => {
      if (name === 'stripe-signature') return 'test-signature'
      return null
    }),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkout.session.completed', () => {
    const mockCheckoutSession: Partial<Stripe.Checkout.Session> = {
      id: 'cs_test_123',
      payment_intent: 'pi_test_123',
      amount_total: 9900,
      currency: 'usd',
      metadata: {
        businessId: 'business-123',
        utmToken: 'utm-123',
      },
      customer_details: {
        email: 'customer@example.com',
        name: 'John Doe',
        phone: null,
        address: null,
        tax_exempt: 'none',
        tax_ids: [],
      },
      payment_method_types: ['card'],
    }

    const mockEvent: Stripe.Event = {
      id: 'evt_test_123',
      object: 'event',
      api_version: '2023-10-16',
      created: 1234567890,
      data: {
        object: mockCheckoutSession as Stripe.Checkout.Session,
        previous_attributes: null,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type: 'checkout.session.completed',
    }

    it('should send order confirmation email on successful checkout', async () => {
      // Mock Stripe webhook construction
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

      // Mock database responses
      ;(prisma.purchase.create as jest.Mock).mockResolvedValue({
        id: 'purchase-123',
        businessId: 'business-123',
        stripeSessionId: 'cs_test_123',
        stripePaymentIntentId: 'pi_test_123',
        amount: 9900,
        currency: 'usd',
        customerEmail: 'customer@example.com',
        status: 'completed',
      })

      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'business-123',
        domain: 'example.com',
        name: 'Example Business',
      })

      ;(prisma.utmToken.update as jest.Mock).mockResolvedValue({})

      // Mock email service
      ;(sendOrderConfirmation as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'msg-123',
        status: 'sent',
      })

      // Create request
      const request = new NextRequest('http://localhost/api/stripe/webhook', {
        method: 'POST',
        headers: mockHeaders as any,
        body: JSON.stringify(mockEvent),
      })

      // Call webhook
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })

      // Verify order confirmation email was sent
      expect(sendOrderConfirmation).toHaveBeenCalledWith({
        to: 'customer@example.com',
        customerName: 'John Doe',
        orderId: 'purchase-123',
        businessDomain: 'example.com',
        amount: 9900,
        currency: 'usd',
        purchaseDate: expect.any(Date),
      })
    })

    it('should send welcome email for first-time customers', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

      ;(prisma.purchase.create as jest.Mock).mockResolvedValue({
        id: 'purchase-123',
        businessId: 'business-123',
        customerEmail: 'customer@example.com',
      })

      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'business-123',
        domain: 'example.com',
      })

      ;(prisma.utmToken.update as jest.Mock).mockResolvedValue({})

      // Mock no previous purchases
      ;(prisma.purchase.count as jest.Mock).mockResolvedValue(0)

      ;(sendOrderConfirmation as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'msg-123',
        status: 'sent',
      })

      ;(sendWelcomeEmail as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'msg-456',
        status: 'sent',
      })

      const request = new NextRequest('http://localhost/api/stripe/webhook', {
        method: 'POST',
        headers: mockHeaders as any,
        body: JSON.stringify(mockEvent),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      // Verify welcome email was sent
      expect(sendWelcomeEmail).toHaveBeenCalledWith({
        to: 'customer@example.com',
        customerName: 'John Doe',
        businessDomain: 'example.com',
      })
    })

    it('should not send welcome email for returning customers', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

      ;(prisma.purchase.create as jest.Mock).mockResolvedValue({
        id: 'purchase-123',
        businessId: 'business-123',
        customerEmail: 'customer@example.com',
      })

      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'business-123',
        domain: 'example.com',
      })

      ;(prisma.utmToken.update as jest.Mock).mockResolvedValue({})

      // Mock existing purchases
      ;(prisma.purchase.count as jest.Mock).mockResolvedValue(2)

      ;(sendOrderConfirmation as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'msg-123',
        status: 'sent',
      })

      const request = new NextRequest('http://localhost/api/stripe/webhook', {
        method: 'POST',
        headers: mockHeaders as any,
        body: JSON.stringify(mockEvent),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      // Verify welcome email was NOT sent
      expect(sendWelcomeEmail).not.toHaveBeenCalled()
    })

    it('should handle email failures gracefully', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

      ;(prisma.purchase.create as jest.Mock).mockResolvedValue({
        id: 'purchase-123',
        businessId: 'business-123',
        customerEmail: 'customer@example.com',
      })

      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'business-123',
        domain: 'example.com',
      })

      ;(prisma.utmToken.update as jest.Mock).mockResolvedValue({})

      // Mock email failure
      ;(sendOrderConfirmation as jest.Mock).mockResolvedValue({
        success: false,
        status: 'failed',
        error: 'SendGrid API error',
      })

      const request = new NextRequest('http://localhost/api/stripe/webhook', {
        method: 'POST',
        headers: mockHeaders as any,
        body: JSON.stringify(mockEvent),
      })

      const response = await POST(request)

      // Webhook should still succeed even if email fails
      expect(response.status).toBe(200)
      expect(sendOrderConfirmation).toHaveBeenCalled()
    })

    it('should not send emails if customer email is missing', async () => {
      const sessionWithoutEmail = {
        ...mockCheckoutSession,
        customer_details: {
          ...mockCheckoutSession.customer_details,
          email: null,
        },
      }

      const eventWithoutEmail = {
        ...mockEvent,
        data: {
          object: sessionWithoutEmail as Stripe.Checkout.Session,
          previous_attributes: null,
        },
      }

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(eventWithoutEmail)

      ;(prisma.purchase.create as jest.Mock).mockResolvedValue({
        id: 'purchase-123',
        businessId: 'business-123',
        customerEmail: null,
      })

      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'business-123',
        domain: 'example.com',
      })

      ;(prisma.utmToken.update as jest.Mock).mockResolvedValue({})

      const request = new NextRequest('http://localhost/api/stripe/webhook', {
        method: 'POST',
        headers: mockHeaders as any,
        body: JSON.stringify(eventWithoutEmail),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      // Verify no emails were sent
      expect(sendOrderConfirmation).not.toHaveBeenCalled()
      expect(sendWelcomeEmail).not.toHaveBeenCalled()
    })
  })
})