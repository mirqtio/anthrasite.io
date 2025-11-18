import { NextRequest, NextResponse } from 'next/server'
import getSql from '@/lib/db'
import { randomUUID } from 'crypto'

/**
 * Diagnostic endpoint to test survey_email_opens table writes
 *
 * GET /api/test-pixel-db
 *
 * Tests:
 * 1. Database connection
 * 2. INSERT permission on survey_email_opens
 * 3. Returns diagnostic info about connection
 */
export async function GET(request: NextRequest) {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }

  try {
    // 1. Check environment variables
    diagnostics.hasPoolUrl = !!process.env.POOL_DATABASE_URL
    diagnostics.hasDatabaseUrl = !!process.env.DATABASE_URL
    diagnostics.usingUrl = process.env.POOL_DATABASE_URL
      ? 'POOL_DATABASE_URL'
      : 'DATABASE_URL'

    // 2. Get SQL connection
    console.log('[TestPixelDB] Getting SQL connection...')
    const sql = getSql()
    diagnostics.sqlConnectionObtained = true

    // 3. Try a simple SELECT to test connectivity
    console.log('[TestPixelDB] Testing SELECT query...')
    const [testRow] = await sql`SELECT 1 as test`
    diagnostics.selectTest = testRow?.test === 1 ? 'PASS' : 'FAIL'
    console.log('[TestPixelDB] SELECT test result:', diagnostics.selectTest)

    // 4. Try to INSERT a test record
    console.log('[TestPixelDB] Testing INSERT into survey_email_opens...')
    const testId = randomUUID()
    const testJtiHash = 'test-' + randomUUID()
    const now = new Date()

    const [insertedRecord] = await sql`
      INSERT INTO survey_email_opens (
        id,
        "jtiHash",
        "leadId",
        "sendId",
        "firstOpenedAt",
        "lastOpenedAt",
        "openCount"
      ) VALUES (
        ${testId},
        ${testJtiHash},
        'test-lead',
        'test-send-' + ${Date.now()},
        ${now},
        ${now},
        1
      )
      RETURNING *
    `

    diagnostics.insertTest = insertedRecord ? 'PASS' : 'FAIL'
    diagnostics.insertedRecordId = insertedRecord?.id
    console.log('[TestPixelDB] INSERT test result:', diagnostics.insertTest)

    // 5. Clean up test record
    console.log('[TestPixelDB] Cleaning up test record...')
    await sql`DELETE FROM survey_email_opens WHERE id = ${testId}`
    diagnostics.cleanupTest = 'PASS'

    diagnostics.overallStatus = 'SUCCESS'
    diagnostics.message = 'All database operations successful'

    return NextResponse.json(diagnostics, { status: 200 })
  } catch (error) {
    console.error('[TestPixelDB] Error:', error)
    diagnostics.overallStatus = 'FAILED'
    diagnostics.error = error instanceof Error ? error.message : String(error)
    diagnostics.errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(diagnostics, { status: 500 })
  }
}
