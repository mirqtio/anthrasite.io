import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

/**
 * Generate a pre-signed URL for downloading a report from S3
 * @param reportKey - S3 key for the report (e.g., "reports/3093/report.pdf")
 * @param expiresIn - Expiration time in seconds (default: 15 minutes)
 * @returns Pre-signed URL
 */
export async function generateReportPresignedUrl(
  reportKey: string,
  expiresIn: number = 900 // 15 minutes
): Promise<string> {
  const bucket =
    process.env.REPORTS_BUCKET || process.env.S3_BUCKET || 'leadshop-raw'

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: reportKey,
  })

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn,
  })

  return presignedUrl
}

/**
 * Validate that S3 credentials are configured
 */
export function validateS3Config(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION
  )
}
