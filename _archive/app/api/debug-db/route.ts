import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDbUrl = !!process.env.DATABASE_URL
    const useFallback = process.env.USE_FALLBACK_STORAGE

    // Try to connect to database
    let dbConnection = false
    let tableExists = false
    let error = null

    try {
      // Test connection
      await prisma.$queryRaw`SELECT 1`
      dbConnection = true

      // Check if waitlist table exists
      const tables = (await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'waitlist'
      `) as any[]

      tableExists = tables.length > 0
    } catch (e) {
      error = {
        message: (e as Error).message,
        code: (e as any).code,
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
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
