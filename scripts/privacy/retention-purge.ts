// scripts/privacy/retention-purge.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting data retention check...')

  const now = new Date()

  // Define retention periods (in months)
  const retentionPeriods = {
    payment: 7 * 12, // 7 years
    lead: 90 / 30, // 90 days
    analytics: 18,
    waitlist: 12,
    dsar: 24,
  }

  // --- Example: Purge old waitlist entries ---
  const waitlistCutoff = new Date(now)
  waitlistCutoff.setMonth(now.getMonth() - retentionPeriods.waitlist)

  console.log(
    `Searching for Waitlist entries older than ${waitlistCutoff.toISOString()}`
  )
  const expiredWaitlistEntries = await prisma.waitlistEntry.findMany({
    where: {
      createdAt: { lt: waitlistCutoff },
    },
  })

  if (expiredWaitlistEntries.length > 0) {
    console.log(
      `Found ${expiredWaitlistEntries.length} expired waitlist entries to purge.`
    )
    // In a real scenario, you might anonymize instead of delete
    const deleteResult = await prisma.waitlistEntry.deleteMany({
      where: {
        id: { in: expiredWaitlistEntries.map((e) => e.id) },
      },
    })
    console.log(`Purged ${deleteResult.count} entries.`)
  } else {
    console.log('No expired waitlist entries found.')
  }

  // TODO: Implement similar logic for other data categories
  // - AnalyticsEvent
  // - PrivacyRequest (for resolved requests)
  // - etc.

  console.log('Data retention check complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
