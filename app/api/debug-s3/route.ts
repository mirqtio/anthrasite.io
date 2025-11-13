import { NextResponse } from 'next/server'
import { validateS3Config } from '@/lib/survey/s3'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = {
      hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasRegion: !!process.env.AWS_REGION,
      hasReportsBucket: !!process.env.REPORTS_BUCKET,
      hasS3Bucket: !!process.env.S3_BUCKET,
      isValid: validateS3Config(),
      accessKeyIdLength: process.env.AWS_ACCESS_KEY_ID?.length || 0,
      regionValue: process.env.AWS_REGION || 'NOT_SET',
      bucketValue:
        process.env.REPORTS_BUCKET || process.env.S3_BUCKET || 'NOT_SET',
    }

    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
