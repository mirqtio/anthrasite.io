import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test data...')

  // Create test business
  const business = await prisma.business.upsert({
    where: { domain: 'example.com' },
    update: {},
    create: {
      domain: 'example.com',
      name: 'Example LLC',
      email: 'test@example.com',
    },
  })

  // Create test UTM token
  await prisma.utmToken.upsert({
    where: { token: 'test-utm-token' },
    update: {},
    create: {
      nonce: 'test-nonce-123',
      token: 'test-utm-token',
      businessId: business.id,
      used: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  console.log('✅ Seed data created')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
