import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import getSql from '@/lib/db'

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDbUrl = !!process.env.DATABASE_URL
    const useFallback = process.env.USE_FALLBACK_STORAGE
    const hasPoolUrl = !!(
      process.env.POOL_DATABASE_URL || process.env.DATABASE_URL
    )

    // Try to connect to database
    let dbConnection = false
    let tableExists = false
    let error: { message: string; code?: unknown } | null = null
    let poolConnection = false
    let poolTableExists = false
    let poolError: { message: string; code?: unknown } | null = null

    try {
      // Test connection
      await prisma.$queryRaw`SELECT 1`
      dbConnection = true

      // Check if waitlist table exists
      const tables = await prisma.$queryRaw<{ table_name: string }[]>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'waitlist'
      `

      tableExists = tables.length > 0
    } catch (e) {
      const err = e as unknown
      let code: unknown = undefined
      if (typeof err === 'object' && err !== null && 'code' in err) {
        code = (err as Record<string, unknown>).code
      }
      error = {
        message: (e as Error).message,
        code,
      }
    }

    try {
      const sql = getSql()
      await sql`select 1`
      poolConnection = true
      const [row] = await sql<{ tbl: string | null }[]>`
        select to_regclass('public.survey_responses') as tbl
      `
      poolTableExists = !!row?.tbl
    } catch (e) {
      const err = e as unknown
      let code: unknown = undefined
      if (typeof err === 'object' && err !== null && 'code' in err) {
        code = (err as Record<string, unknown>).code
      }
      poolError = {
        message: (e as Error).message,
        code,
      }
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      hasDbUrl,
      useFallback,
      dbConnection,
      tableExists,
      error,
      databaseUrl: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
      hasPoolUrl,
      poolConnection,
      poolTableExists,
      poolError,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
