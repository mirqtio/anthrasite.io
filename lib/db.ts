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
    datasourceUrl: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL,
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
// Lazy initialization to avoid import-time errors
declare global {
  // eslint-disable-next-line no-var
  var pgSql: ReturnType<typeof postgres> | undefined
}

export function getSql() {
  if (global.pgSql) {
    return global.pgSql
  }

  const connectionString =
    process.env.POOL_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'Missing database URL: set POOL_DATABASE_URL or DATABASE_URL in environment variables'
    )
  }

  // Sanitize connection string for logging (mask password)
  const sanitized = connectionString.replace(/:([^:@]+)@/, ':****@')
  console.log('[db] Initializing postgres.js client')
  console.log(
    '[db] Using:',
    process.env.POOL_DATABASE_URL ? 'POOL_DATABASE_URL' : 'DATABASE_URL'
  )
  console.log('[db] Connection string (sanitized):', sanitized)

  // Determine if we need SSL (production/Supabase) or not (local development)
  const isLocalDB =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1')

  console.log('[db] Local DB:', isLocalDB)

  // Auto-append sslmode=require for remote connections if missing
  let effectiveConnStr = connectionString
  if (!isLocalDB) {
    const hasSSLMode = /[?&]sslmode=/i.test(connectionString)
    if (!hasSSLMode) {
      effectiveConnStr += connectionString.includes('?')
        ? '&sslmode=require'
        : '?sslmode=require'
      console.log('[db] Added sslmode=require to connection string')
    }
  }

  console.log('[db] Creating postgres.js client with:', {
    max: 5,
    prepare: false,
    ssl: isLocalDB ? false : { rejectUnauthorized: false },
  })

  try {
    const sql = postgres(effectiveConnStr, {
      max: 5, // Keep pool small on Vercel
      prepare: false, // Required for PgBouncer - no prepared statements
      ssl: isLocalDB ? false : { rejectUnauthorized: false }, // Allow self-signed chain in serverless
    })

    console.log('[db] postgres.js client created successfully')

    if (process.env.NODE_ENV !== 'production') {
      global.pgSql = sql
    }

    return sql
  } catch (error) {
    console.error('[db] Failed to create postgres.js client:', error)
    throw error
  }
}

// Export the function as default for lazy initialization
export default getSql
