import getSql from '@/lib/db'

/**
 * Look up report S3 key from Supabase database
 * Queries the reports table by lead_id to find the PDF S3 key
 *
 * Strategy: Try exact run_id match first, fall back to most recent report
 */
export async function lookupReportS3Key(
  leadId: string,
  runId?: string
): Promise<string | null> {
  try {
    const sql = getSql()
    const leadIdInt = parseInt(leadId)

    console.log('[lookupReportS3Key] Input parameters:', {
      leadId,
      leadIdInt,
      leadIdType: typeof leadId,
      leadIdIntType: typeof leadIdInt,
      runId,
      runIdType: typeof runId,
    })

    let result

    // Try exact run_id match first if provided
    if (runId) {
      console.log('[lookupReportS3Key] Trying exact run_id match:', {
        leadIdInt,
        runId,
      })
      result = await sql`
        SELECT pdf_s3_key
        FROM reports
        WHERE lead_id = ${leadIdInt}
          AND run_id = ${runId}
          AND pdf_s3_key IS NOT NULL
          AND pdf_s3_key != ''
        ORDER BY created_at DESC
        LIMIT 1
      `
      console.log('[lookupReportS3Key] Exact match result:', {
        rowCount: result.length,
        result: result.length > 0 ? result[0] : null,
      })
    }

    // Fall back to most recent report for this lead if no exact match
    if (!result || result.length === 0) {
      console.log(
        '[lookupReportS3Key] No exact match, falling back to most recent report for lead:',
        leadIdInt
      )
      result = await sql`
        SELECT pdf_s3_key
        FROM reports
        WHERE lead_id = ${leadIdInt}
          AND pdf_s3_key IS NOT NULL
          AND pdf_s3_key != ''
        ORDER BY created_at DESC
        LIMIT 1
      `
      console.log('[lookupReportS3Key] Fallback result:', {
        rowCount: result.length,
        result: result.length > 0 ? result[0] : null,
      })
    }

    if (result.length === 0) {
      console.error(
        `No report with valid pdf_s3_key found for leadId=${leadId}, runId=${runId}`
      )
      return null
    }

    const s3Key = result[0].pdf_s3_key
    console.log('[lookupReportS3Key] Found pdf_s3_key:', s3Key)
    return s3Key
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
