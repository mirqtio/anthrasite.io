import { NextRequest, NextResponse } from 'next/server'
import { validateSurveyToken } from '@/lib/survey/validation'
import { generateReportPresignedUrl, validateS3Config } from '@/lib/survey/s3'
import { logReportAccess } from '@/lib/survey/storage'
import { lookupReportS3Key } from '@/lib/survey/reports'

/**
 * GET /api/report/open?sid=<JWT>
 *
 * Redirect shim for secure report access:
 * 1. Validates JWT token
 * 2. Looks up report S3 key from database (Supabase)
 * 3. Generates pre-signed S3 URL on-demand (15 min expiry)
 * 4. Logs report access to database
 * 5. Redirects to pre-signed URL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sid = searchParams.get('sid')

    if (!sid) {
      return NextResponse.json(
        { error: 'missing_session', message: 'Session ID required' },
        { status: 400 }
      )
    }

    // Validate S3 configuration
    if (!validateS3Config()) {
      console.error('S3 configuration missing', {
        hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        hasRegion: !!process.env.AWS_REGION,
        hasBucket: !!(process.env.REPORTS_BUCKET || process.env.S3_BUCKET),
      })
      return NextResponse.json(
        { error: 'server_error', message: 'Report system not configured' },
        { status: 500 }
      )
    }

    // Validate JWT token
    const payload = await validateSurveyToken(sid)
    if (!payload) {
      return NextResponse.json(
        { error: 'invalid_session', message: 'Session not found or expired' },
        { status: 401 }
      )
    }

    // Verify required fields
    if (!payload.leadId || !payload.jti) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Token missing required fields' },
        { status: 400 }
      )
    }

    // Look up report S3 key from Supabase database
    const reportS3Key = await lookupReportS3Key(payload.leadId, payload.runId)
    if (!reportS3Key) {
      return NextResponse.json(
        {
          error: 'report_not_found',
          message: 'Report not found for this lead',
        },
        { status: 404 }
      )
    }

    // Generate pre-signed URL (15 minutes)
    const presignedUrl = await generateReportPresignedUrl(reportS3Key, 900)

    // Log report access (idempotent)
    await logReportAccess(
      payload.jti,
      payload.leadId,
      payload.version,
      payload.batchId
    )

    // Redirect to pre-signed URL
    const response = NextResponse.redirect(presignedUrl, 302)
    response.headers.set('Referrer-Policy', 'no-referrer')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

    return response
  } catch (error) {
    console.error('Report open error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasRegion: !!process.env.AWS_REGION,
      hasBucket: !!(process.env.REPORTS_BUCKET || process.env.S3_BUCKET),
    })
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to open report' },
      { status: 500 }
    )
  }
}
