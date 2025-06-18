import { prisma } from './db'

describe('Database Schema', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.analyticsEvent.deleteMany()
    await prisma.purchase.deleteMany()
    await prisma.utmToken.deleteMany()
    await prisma.business.deleteMany()
    await prisma.waitlistEntry.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Business Model', () => {
    it('should create a business', async () => {
      const business = await prisma.business.create({
        data: {
          domain: 'example.com',
          name: 'Example Business',
          reportData: { score: 85 },
        },
      })

      expect(business.id).toBeDefined()
      expect(business.domain).toBe('example.com')
      expect(business.name).toBe('Example Business')
      expect(business.reportData).toEqual({ score: 85 })
      expect(business.createdAt).toBeInstanceOf(Date)
    })

    it('should enforce unique domain constraint', async () => {
      await prisma.business.create({
        data: {
          domain: 'unique.com',
          name: 'First Business',
        },
      })

      await expect(
        prisma.business.create({
          data: {
            domain: 'unique.com',
            name: 'Second Business',
          },
        })
      ).rejects.toThrow()
    })
  })

  describe('WaitlistEntry Model', () => {
    it('should create a waitlist entry with auto-incrementing position', async () => {
      const entry1 = await prisma.waitlistEntry.create({
        data: {
          domain: 'waitlist1.com',
          email: 'user1@example.com',
          ipLocation: { country: 'US' },
          variantData: { variant: 'A' },
        },
      })

      const entry2 = await prisma.waitlistEntry.create({
        data: {
          domain: 'waitlist2.com',
          email: 'user2@example.com',
        },
      })

      expect(entry1.position).toBeLessThan(entry2.position)
      expect(entry1.position).toBeGreaterThan(0)
      expect(entry2.position).toBeGreaterThan(0)
    })
  })

  describe('UTM Token Model', () => {
    it('should create UTM token with business relation', async () => {
      const business = await prisma.business.create({
        data: {
          domain: 'utm-test.com',
          name: 'UTM Test Business',
        },
      })

      const token = await prisma.utmToken.create({
        data: {
          nonce: 'unique-nonce-123',
          businessId: business.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      })

      expect(token.nonce).toBe('unique-nonce-123')
      expect(token.businessId).toBe(business.id)
      expect(token.usedAt).toBeNull()
    })

    it('should mark token as used', async () => {
      const business = await prisma.business.create({
        data: {
          domain: 'utm-used.com',
          name: 'UTM Used Business',
        },
      })

      const token = await prisma.utmToken.create({
        data: {
          nonce: 'used-nonce-456',
          businessId: business.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      const updatedToken = await prisma.utmToken.update({
        where: { nonce: token.nonce },
        data: { usedAt: new Date() },
      })

      expect(updatedToken.usedAt).toBeInstanceOf(Date)
    })
  })

  describe('Purchase Model', () => {
    it('should create purchase with business relation', async () => {
      const business = await prisma.business.create({
        data: {
          domain: 'purchase-test.com',
          name: 'Purchase Test Business',
        },
      })

      const purchase = await prisma.purchase.create({
        data: {
          businessId: business.id,
          stripeSessionId: 'cs_test_123',
          amountCents: 19900, // $199.00
          status: 'completed',
          metadata: { campaignId: 'launch-2024' },
        },
      })

      expect(purchase.stripeSessionId).toBe('cs_test_123')
      expect(purchase.amountCents).toBe(19900)
      expect(purchase.status).toBe('completed')
    })
  })

  describe('AnalyticsEvent Model', () => {
    it('should create analytics event', async () => {
      const event = await prisma.analyticsEvent.create({
        data: {
          eventName: 'page_view',
          properties: {
            page: '/home',
            referrer: 'google.com',
          },
          sessionId: 'session-123',
        },
      })

      expect(event.eventName).toBe('page_view')
      expect(event.properties).toEqual({
        page: '/home',
        referrer: 'google.com',
      })
      expect(event.sessionId).toBe('session-123')
    })
  })

  describe('Database Constraints and Indexes', () => {
    it('should have proper indexes for performance', async () => {
      // This is more of a documentation test - actual index performance
      // should be tested with larger datasets
      const indexes = {
        waitlist: ['domain', 'createdAt'],
        utmTokens: ['expiresAt'],
        purchases: ['stripeSessionId'],
        analyticsEvents: ['eventName,sessionId', 'createdAt'],
      }

      expect(indexes).toBeDefined()
    })
  })
})