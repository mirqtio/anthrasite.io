import { POST } from '../route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import type { SendGridWebhookEvent } from '@/lib/email/types'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    purchase: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('SendGrid Webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (events: SendGridWebhookEvent[]) => {
    return new NextRequest('http://localhost/api/sendgrid/webhook', {
      method: 'POST',
      headers: {
        'x-twilio-email-event-webhook-signature': 'test-signature',
        'x-twilio-email-event-webhook-timestamp': Date.now().toString(),
      },
      body: JSON.stringify(events),
    })
  }

  describe('Event Processing', () => {
    it('should process delivered events', async () => {
      const events: SendGridWebhookEvent[] = [{
        email: 'customer@example.com',
        event: 'delivered',
        sg_message_id: 'msg-123',
        timestamp: Date.now() / 1000,
      }]

      const mockPurchase = {
        id: 'purchase-123',
        metadata: {},
      }

      ;(prisma.purchase.findUnique as jest.Mock).mockResolvedValue(mockPurchase)
      ;(prisma.purchase.update as jest.Mock).mockResolvedValue({})

      const request = createRequest(events)
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ received: true })
    })

    it('should process bounce events', async () => {
      const events: SendGridWebhookEvent[] = [{
        email: 'bounced@example.com',
        event: 'bounce',
        sg_message_id: 'msg-456',
        timestamp: Date.now() / 1000,
        reason: 'Invalid email address',
        type: 'hard',
      }]

      const request = createRequest(events)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should process complaint events', async () => {
      const events: SendGridWebhookEvent[] = [{
        email: 'complainer@example.com',
        event: 'complaint',
        sg_message_id: 'msg-789',
        timestamp: Date.now() / 1000,
      }]

      const request = createRequest(events)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should process multiple events', async () => {
      const events: SendGridWebhookEvent[] = [
        {
          email: 'customer1@example.com',
          event: 'delivered',
          sg_message_id: 'msg-1',
          timestamp: Date.now() / 1000,
        },
        {
          email: 'customer2@example.com',
          event: 'open',
          sg_message_id: 'msg-2',
          timestamp: Date.now() / 1000,
        },
        {
          email: 'customer3@example.com',
          event: 'click',
          sg_message_id: 'msg-3',
          timestamp: Date.now() / 1000,
          url: 'https://example.com/report',
        },
      ]

      const request = createRequest(events)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Purchase Metadata Updates', () => {
    it('should update purchase metadata for delivered event', async () => {
      const events: SendGridWebhookEvent[] = [{
        email: 'customer@example.com',
        event: 'delivered',
        sg_message_id: 'msg-123',
        timestamp: Date.now() / 1000,
        custom_args: {
          purchaseId: 'purchase-123',
          businessId: 'business-123',
          template: 'orderConfirmation',
        },
      } as any]

      const mockPurchase = {
        id: 'purchase-123',
        metadata: { existing: 'data' },
      }

      ;(prisma.purchase.findUnique as jest.Mock).mockResolvedValue(mockPurchase)
      ;(prisma.purchase.update as jest.Mock).mockResolvedValue({})

      const request = createRequest(events)
      await POST(request)

      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: {
          metadata: {
            existing: 'data',
            emailDelivered: true,
            emailDeliveredAt: expect.any(String),
          },
        },
      })
    })

    it('should track email opens', async () => {
      const events: SendGridWebhookEvent[] = [{
        email: 'customer@example.com',
        event: 'open',
        sg_message_id: 'msg-123',
        timestamp: Date.now() / 1000,
        custom_args: {
          purchaseId: 'purchase-123',
        },
      } as any]

      const mockPurchase = {
        id: 'purchase-123',
        metadata: { emailOpenCount: 2 },
      }

      ;(prisma.purchase.findUnique as jest.Mock).mockResolvedValue(mockPurchase)
      ;(prisma.purchase.update as jest.Mock).mockResolvedValue({})

      const request = createRequest(events)
      await POST(request)

      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: {
          metadata: expect.objectContaining({
            emailOpened: true,
            emailOpenCount: 3,
            emailLastOpenedAt: expect.any(String),
          }),
        },
      })
    })

    it('should track email clicks', async () => {
      const events: SendGridWebhookEvent[] = [{
        email: 'customer@example.com',
        event: 'click',
        sg_message_id: 'msg-123',
        timestamp: Date.now() / 1000,
        url: 'https://example.com/report/123',
        custom_args: {
          purchaseId: 'purchase-123',
        },
      } as any]

      const mockPurchase = {
        id: 'purchase-123',
        metadata: { emailClicks: [] },
      }

      ;(prisma.purchase.findUnique as jest.Mock).mockResolvedValue(mockPurchase)
      ;(prisma.purchase.update as jest.Mock).mockResolvedValue({})

      const request = createRequest(events)
      await POST(request)

      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: {
          metadata: expect.objectContaining({
            emailClicked: true,
            emailClicks: [
              {
                url: 'https://example.com/report/123',
                timestamp: expect.any(String),
              },
            ],
            emailLastClickedAt: expect.any(String),
          }),
        },
      })
    })

    it('should handle bounce with metadata', async () => {
      const events: SendGridWebhookEvent[] = [{
        email: 'bounced@example.com',
        event: 'bounce',
        sg_message_id: 'msg-456',
        timestamp: Date.now() / 1000,
        reason: 'Email address does not exist',
        type: 'hard',
        custom_args: {
          purchaseId: 'purchase-456',
        },
      } as any]

      const mockPurchase = {
        id: 'purchase-456',
        metadata: {},
      }

      ;(prisma.purchase.findUnique as jest.Mock).mockResolvedValue(mockPurchase)
      ;(prisma.purchase.update as jest.Mock).mockResolvedValue({})

      const request = createRequest(events)
      await POST(request)

      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-456' },
        data: {
          metadata: {
            emailBounced: true,
            emailBouncedAt: expect.any(String),
            emailBounceReason: 'Email address does not exist',
            emailBounceType: 'hard',
          },
        },
      })
    })
  })

  describe('Error Handling', () => {
    it('should continue processing after individual event errors', async () => {
      const events: SendGridWebhookEvent[] = [
        {
          email: 'customer1@example.com',
          event: 'delivered',
          sg_message_id: 'msg-1',
          timestamp: Date.now() / 1000,
          custom_args: { purchaseId: 'purchase-1' },
        } as any,
        {
          email: 'customer2@example.com',
          event: 'delivered',
          sg_message_id: 'msg-2',
          timestamp: Date.now() / 1000,
          custom_args: { purchaseId: 'purchase-2' },
        } as any,
      ]

      // First purchase throws error, second succeeds
      ;(prisma.purchase.findUnique as jest.Mock)
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({ id: 'purchase-2', metadata: {} })

      ;(prisma.purchase.update as jest.Mock).mockResolvedValue({})

      const request = createRequest(events)
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(prisma.purchase.update).toHaveBeenCalledTimes(1)
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/sendgrid/webhook', {
        method: 'POST',
        headers: {
          'x-twilio-email-event-webhook-signature': 'test-signature',
          'x-twilio-email-event-webhook-timestamp': Date.now().toString(),
        },
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Webhook processing failed' })
    })
  })
})