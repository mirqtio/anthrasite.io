import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.analyticsEvent.deleteMany()
  await prisma.abandonedCart.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.utmToken.deleteMany()
  await prisma.business.deleteMany()
  await prisma.waitlistEntry.deleteMany()

  // Create sample businesses
  const businesses = await Promise.all([
    prisma.business.create({
      data: {
        domain: 'acme-corp.com',
        name: 'Acme Corporation',
        reportData: {
          score: 72,
          issues: 23,
          estimatedValue: 15000,
        },
      },
    }),
    prisma.business.create({
      data: {
        domain: 'tech-startup.io',
        name: 'Tech Startup Inc',
        reportData: {
          score: 85,
          issues: 12,
          estimatedValue: 8500,
        },
      },
    }),
  ])

  // Create waitlist entries
  await Promise.all([
    prisma.waitlistEntry.create({
      data: {
        domain: 'example.com',
        email: 'john@example.com',
        ipLocation: { country: 'US', city: 'New York' },
        variantData: { test: 'homepage_v2', variant: 'A' },
      },
    }),
    prisma.waitlistEntry.create({
      data: {
        domain: 'sample.org',
        email: 'jane@sample.org',
        ipLocation: { country: 'UK', city: 'London' },
        variantData: { test: 'homepage_v2', variant: 'B' },
      },
    }),
  ])

  // Create sample UTM tokens (one expired, one valid)
  await Promise.all([
    prisma.utmToken.create({
      data: {
        nonce: 'expired-token-123',
        token: 'utm_expired_test_123',
        businessId: businesses[0].id,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired
        used: false,
      },
    }),
    prisma.utmToken.create({
      data: {
        nonce: 'valid-token-456',
        token: 'utm_valid_test_456',
        businessId: businesses[1].id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24h
        used: false,
      },
    }),
  ])

  // Create sample purchase
  await prisma.purchase.create({
    data: {
      businessId: businesses[0].id,
      stripeSessionId: 'cs_test_sample_123',
      amount: 19900,
      status: 'completed',
      metadata: {
        campaignId: 'launch-2024',
        variant: 'pricing_a',
      },
    },
  })

  // Create sample abandoned carts
  await Promise.all([
    prisma.abandonedCart.create({
      data: {
        stripeSessionId: 'cs_test_abandoned_123',
        businessId: businesses[1].id,
        customerEmail: 'abandoned@example.com',
        amount: 9900,
        currency: 'usd',
        recoveryToken: 'recovery_token_123',
        sessionExpiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
    }),
    prisma.abandonedCart.create({
      data: {
        stripeSessionId: 'cs_test_recovered_456',
        businessId: businesses[0].id,
        customerEmail: 'recovered@example.com',
        amount: 9900,
        currency: 'usd',
        recoveryToken: 'recovery_token_456',
        recoveryEmailSent: true,
        emailSentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        recovered: true,
        recoveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        sessionExpiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    }),
  ])

  // Create sample analytics events
  const events = [
    { eventName: 'page_view', page: '/', referrer: 'google.com' },
    { eventName: 'waitlist_signup', domain: 'example.com', variant: 'A' },
    { eventName: 'utm_validated', businessId: businesses[0].id },
    { eventName: 'checkout_started', value: 199.0 },
    {
      eventName: 'purchase_completed',
      value: 199.0,
      businessId: businesses[0].id,
    },
  ]

  await Promise.all(
    events.map((event) =>
      prisma.analyticsEvent.create({
        data: {
          eventName: event.eventName,
          properties: event,
          sessionId: 'seed-session-123',
        },
      })
    )
  )

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
