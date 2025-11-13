import { NextRequest, NextResponse } from 'next/server'
import { validateSurveyToken } from '@/lib/survey/validation'
import { generateReportPresignedUrl, validateS3Config } from '@/lib/survey/s3'
import { lookupReportS3Key } from '@/lib/survey/reports'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to test report opening flow
 * GET /api/debug-report?sid=<JWT>
 */
export async function GET(request: NextRequest) {
  const steps: string[] = []
  const details: Record<string, unknown> = {}

  try {
    steps.push('Starting request')
    const { searchParams } = new URL(request.url)
    const sid = searchParams.get('sid')

    if (!sid) {
      return NextResponse.json({
        error: 'Missing sid parameter',
        steps,
      })
    }

    steps.push('Checking S3 config')
    const s3Valid = validateS3Config()
    details.s3Config = {
      valid: s3Valid,
      hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasRegion: !!process.env.AWS_REGION,
      hasBucket: !!(process.env.REPORTS_BUCKET || process.env.S3_BUCKET),
    }

    if (!s3Valid) {
      return NextResponse.json({
        error: 'S3 config invalid',
        steps,
        details,
      })
    }

    steps.push('Validating JWT token')
    const payload = await validateSurveyToken(sid)

    if (!payload) {
      return NextResponse.json({
        error: 'Token validation returned null',
        steps,
        details,
      })
    }

    details.tokenPayload = {
      leadId: payload.leadId,
      runId: payload.runId,
      jti: payload.jti,
      version: payload.version,
      batchId: payload.batchId,
    }

    steps.push('Token validated successfully')

    if (!payload.leadId || !payload.jti) {
      return NextResponse.json({
        error: 'Token missing required fields',
        steps,
        details,
      })
    }

    steps.push('Looking up report S3 key')
    const reportS3Key = await lookupReportS3Key(payload.leadId, payload.runId)

    if (!reportS3Key) {
      return NextResponse.json({
        error: 'Report S3 key not found',
        steps,
        details,
      })
    }

    details.reportS3Key = reportS3Key
    steps.push('Found report S3 key')

    steps.push('Generating pre-signed URL')
    const presignedUrl = await generateReportPresignedUrl(reportS3Key, 900)

    details.presignedUrlGenerated = true
    details.presignedUrlLength = presignedUrl.length
    steps.push('Pre-signed URL generated')

    return NextResponse.json({
      success: true,
      steps,
      details,
      presignedUrl: presignedUrl.substring(0, 100) + '...', // Don't expose full URL
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Exception thrown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      steps,
      details,
    })
  }
}
