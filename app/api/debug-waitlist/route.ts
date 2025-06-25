import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const dbTest: { connected: boolean; error: string | null } = {
      connected: false,
      error: null,
    }
    try {
      await prisma.$queryRaw`SELECT 1`
      dbTest.connected = true
    } catch (e) {
      dbTest.error = (e as Error).message
    }

    // Check table structure
    let tableStructure = null
    try {
      const columns = (await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'waitlist'
        ORDER BY ordinal_position
      `) as any[]
      tableStructure = columns
    } catch (e) {
      tableStructure = { error: (e as Error).message }
    }

    // Try to count existing entries
    let entryCount = null
    try {
      entryCount = await prisma.waitlistEntry.count()
    } catch (e) {
      entryCount = { error: (e as Error).message }
    }

    // Try a test insert (with immediate rollback)
    const testInsert: { success: boolean; error: string | null } = {
      success: false,
      error: null,
    }
    try {
      await prisma.$transaction(async (tx) => {
        await tx.waitlistEntry.create({
          data: {
            domain: 'test-debug.com',
            email: 'debug@test.com',
          },
        })
        // Rollback by throwing an error
        throw new Error('ROLLBACK_TEST')
      })
    } catch (e) {
      if ((e as Error).message === 'ROLLBACK_TEST') {
        testInsert.success = true
      } else {
        testInsert.error = (e as Error).message
      }
    }

    return NextResponse.json({
      database: dbTest,
      tableStructure,
      entryCount,
      testInsert,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        USE_FALLBACK_STORAGE: process.env.USE_FALLBACK_STORAGE,
        hasDbUrl: !!process.env.DATABASE_URL,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
