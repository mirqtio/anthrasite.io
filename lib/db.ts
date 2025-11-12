import { PrismaClient } from '@prisma/client'
import postgres from 'postgres'

// Prisma Client - use ONLY for migrations, not runtime queries
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// postgres.js - use for ALL runtime queries
// Works with PgBouncer (transaction mode) on port 6543
const sql = postgres(process.env.POOL_DATABASE_URL!, {
  max: 5, // Keep pool small on Vercel
  prepare: false, // Required for PgBouncer - no prepared statements
  ssl: 'require', // Required for Supabase
})

export default sql
