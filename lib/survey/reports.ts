import getSql from '@/lib/db'

/**
 * Look up report S3 key from Supabase database
 * Queries the reports table by lead_id to find the PDF S3 key
 */
export async function lookupReportS3Key(
  leadId: string,
  runId?: string
): Promise<string | null> {
  try {
    const sql = getSql()
    const leadIdInt = parseInt(leadId)

    let result

    if (runId) {
      // Query by both lead_id and run_id for exact match
      result = await sql`
        SELECT pdf_s3_key
        FROM reports
        WHERE lead_id = ${leadIdInt} AND run_id = ${runId}
        AND pdf_s3_key IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
      `
    } else {
      // Query by lead_id only, get most recent
      result = await sql`
        SELECT pdf_s3_key
        FROM reports
        WHERE lead_id = ${leadIdInt}
        AND pdf_s3_key IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
      `
    }

    if (result.length === 0) {
      console.error(`No report found for leadId=${leadId}, runId=${runId}`)
      return null
    }

    return result[0].pdf_s3_key
  } catch (error) {
    console.error('Failed to lookup report S3 key:', error)
    return null
  }
}

/**
 * Validate that report exists for given lead
 */
export async function reportExists(
  leadId: string,
  runId?: string
): Promise<boolean> {
  const s3Key = await lookupReportS3Key(leadId, runId)
  return s3Key !== null
}
