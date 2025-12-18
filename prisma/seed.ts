import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean / Reset Waitlist (Optional, but good for local dev)
  // await prisma.waitlistEntry.deleteMany()

  // Create mock waitlist entries
  const waitlistEntries = [
    {
      domain: 'test-startup.com',
      email: 'founder@test-startup.com',
      ipLocation: { city: 'San Francisco', country: 'US' },
      variantData: { source: 'hero_cta' },
    },
    {
      domain: 'another-demo.io',
      email: 'hello@another-demo.io',
      ipLocation: { city: 'London', country: 'UK' },
      variantData: { source: 'footer' },
    },
  ]

  console.log(`📝 Creating ${waitlistEntries.length} waitlist entries...`)
  for (const entry of waitlistEntries) {
    await prisma.waitlistEntry.create({
      data: entry,
    })
  }

  console.log('✅ Database seeded with Waitlist data!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
