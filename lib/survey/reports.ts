import { Pool } from 'pg'

let supabasePool: Pool | null = null

// Create connection pool for Supabase (LeadShop database) - lazy initialization
function getSupabasePool(): Pool {
  if (!supabasePool) {
    if (!process.env.SUPABASE_DATABASE_URL) {
      throw new Error('SUPABASE_DATABASE_URL environment variable is required')
    }

    supabasePool = new Pool({
      connectionString: process.env.SUPABASE_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return supabasePool
}

/**
 * Look up report S3 key from Supabase database
 * Queries the reports table by lead_id to find the PDF S3 key
 */
export async function lookupReportS3Key(
  leadId: string,
  runId?: string
): Promise<string | null> {
  try {
    let query: string
    let params: any[]

    if (runId) {
      // Query by both lead_id and run_id for exact match
      query = `
        SELECT pdf_s3_key
        FROM reports
        WHERE lead_id = $1 AND run_id = $2
        AND pdf_s3_key IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
      `
      params = [parseInt(leadId), runId]
    } else {
      // Query by lead_id only, get most recent
      query = `
        SELECT pdf_s3_key
        FROM reports
        WHERE lead_id = $1
        AND pdf_s3_key IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
      `
      params = [parseInt(leadId)]
    }

    const result = await getSupabasePool().query(query, params)

    if (result.rows.length === 0) {
      console.error(`No report found for leadId=${leadId}, runId=${runId}`)
      return null
    }

    return result.rows[0].pdf_s3_key
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
