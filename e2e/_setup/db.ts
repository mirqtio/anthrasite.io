import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

/**
 * Get or create singleton Prisma client for tests
 */
export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://postgres:devpass@localhost:5432/anthrasite_test',
        },
      },
    })
  }
  return prisma
}

/**
 * Ensure test database exists and schema is current
 * Called once during global setup
 */
export async function ensureDb() {
  const client = getPrisma()
  try {
    // Simple connectivity check - if schema exists, we're good
    await client.$queryRaw`SELECT 1`
    console.log('✓ Test database connected')
  } catch (error) {
    console.error('✗ Test database connection failed:', error)
    throw error
  }
}

/**
 * Reset database to clean state
 * Called before each test file (optional, can be heavy)
 */
export async function resetDb() {
  const client = getPrisma()
  try {
    // Delete all data in reverse dependency order
    // Add your tables here in the correct order
    await client.$transaction([
      // Example: await client.purchase.deleteMany(),
      // Example: await client.business.deleteMany(),
      // Example: await client.user.deleteMany(),
    ])
    console.log('✓ Database reset complete')
  } catch (error) {
    console.error('✗ Database reset failed:', error)
    throw error
  }
}

/**
 * Close Prisma connection
 * Called once during global teardown
 */
export async function closeDb() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
    console.log('✓ Database connection closed')
  }
}
