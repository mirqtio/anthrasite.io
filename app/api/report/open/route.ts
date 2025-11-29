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
    console.log('[Report Open] Starting request')
    const { searchParams } = new URL(request.url)
    const sid = searchParams.get('sid')

    if (!sid) {
      console.error('[Report Open] Missing sid parameter')
      return NextResponse.json(
        { error: 'missing_session', message: 'Session ID required' },
        { status: 400 }
      )
    }

    console.log('[Report Open] Validating S3 config')
    // Validate S3 configuration
    if (!validateS3Config()) {
      console.error('[Report Open] S3 configuration missing', {
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

    console.log('[Report Open] Validating JWT token')
    // Validate JWT token
    const payload = await validateSurveyToken(sid)
    if (!payload) {
      console.error('[Report Open] Token validation failed')
      return NextResponse.json(
        { error: 'invalid_session', message: 'Session not found or expired' },
        { status: 401 }
      )
    }

    console.log('[Report Open] Token valid, payload:', {
      leadId: payload.leadId,
      runId: payload.runId,
      jti: payload.jti,
    })

    // Verify required fields
    // For public surveys, leadId is optional
    if (!payload.jti) {
      console.error('[Report Open] Token missing required fields', payload)
      return NextResponse.json(
        { error: 'invalid_token', message: 'Token missing required fields' },
        { status: 400 }
      )
    }

    let reportS3Key: string | null = null

    if (payload.leadId) {
      console.log(
        '[Report Open] Looking up report S3 key for leadId:',
        payload.leadId,
        'runId:',
        payload.runId
      )
      // Look up report S3 key from Supabase database
      reportS3Key = await lookupReportS3Key(payload.leadId, payload.runId)
    } else {
      console.log('[Report Open] Public token detected, using demo report')
      // Use configured demo report or fallback
      reportS3Key = process.env.DEMO_REPORT_S3_KEY || 'demo/report.pdf'
    }

    if (!reportS3Key) {
      console.error(
        '[Report Open] Report S3 key not found for leadId:',
        payload.leadId,
        'runId:',
        payload.runId
      )
      return NextResponse.json(
        {
          error: 'report_not_found',
          message: 'Report not found for this lead',
        },
        { status: 404 }
      )
    }

    console.log('[Report Open] Found report S3 key:', reportS3Key)
    console.log('[Report Open] Generating pre-signed URL')
    // Generate pre-signed URL (15 minutes)
    const presignedUrl = await generateReportPresignedUrl(reportS3Key, 900)

    console.log('[Report Open] Pre-signed URL generated, logging access')
    // Log report access (idempotent, but don't fail if this fails)
    try {
      await logReportAccess(
        payload.jti,
        payload.leadId,
        payload.version,
        payload.batchId
      )
      console.log('[Report Open] Report access logged successfully')
    } catch (logError) {
      console.error(
        '[Report Open] Failed to log access (non-fatal):',
        logError instanceof Error ? logError.message : String(logError)
      )
      // Continue anyway - report access is more important than logging
    }

    console.log('[Report Open] Redirecting to pre-signed URL')
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
