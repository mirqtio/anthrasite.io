import { getSql } from '@/lib/db'
import { LeadRow } from '@/types/admin'
import { LeadsToolbar } from '@/components/admin/LeadsToolbar'
import { MasterList } from '@/components/admin/MasterList'
import { WorkerBeacon } from '@/components/admin/WorkerBeacon'

export const dynamic = 'force-dynamic' // Always fresh data

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    sort?: string
    order?: string
    limit?: string
    status?: string
    city?: string
    state?: string
    zip?: string
    naics?: string
  }>
}) {
  // Next.js 15: searchParams is now a Promise
  const params = await searchParams
  const sql = getSql()
  const query = params.q || ''
  const sort = params.sort || 'created_at'
  const order = params.order === 'asc' ? 'ASC' : 'DESC'
  const limit = parseInt(params.limit || '50')

  const statusFilter = params.status ?? null
  const cityFilter = params.city ?? null
  const stateFilter = params.state ?? null
  const zipFilter = params.zip ?? null
  const naicsFilter = params.naics ?? null

  // Whitelist sort columns to prevent SQL injection
  const validSorts: Record<string, any> = {
    id: sql`l.id`,
    created_at: sql`l.created_at`,
    company: sql`l.company`,
    baseline_monthly_revenue: sql`l.baseline_monthly_revenue`,
    status: sql`status`, // This refers to the derived column alias
    city: sql`l.city`,
    state: sql`l.state`,
    zip: sql`l.zip_code`,
    naics_code: sql`l.naics_code`,
  }

  const orderBy = validSorts[sort] || validSorts.created_at

  // Fetch leads
  // Note: Using the manual read model mapping
  const leads = await sql<LeadRow[]>`
    SELECT 
      l.id, l.url, l.domain, l.company,
      l.baseline_monthly_revenue, l.naics_code, l.city, l.state, l.zip_code,
      l.created_at, l.updated_at,
      COALESCE(r.phase_d_status, 'NEW') as status
    FROM leads l
    LEFT JOIN LATERAL (
      SELECT 
        CASE 
          WHEN phase_d_status = 'completed' THEN 'COMPLETED'
          WHEN phase_d_status = 'running' THEN 'RUNNING'
          WHEN phase_d_status = 'failed' THEN 'FAILED'
          ELSE UPPER(phase_d_status)
        END as phase_d_status
      FROM runs
      WHERE lead_id = l.id
      ORDER BY 
        CASE 
          WHEN phase_d_status = 'completed' THEN 1 
          WHEN phase_d_status = 'running' THEN 2 
          ELSE 3 
        END,
        created_at DESC
      LIMIT 1
    ) r ON true
    WHERE 
      (${query} = '' OR 
       l.company ILIKE ${'%' + query + '%'} OR 
       l.domain ILIKE ${'%' + query + '%'} OR
       l.url ILIKE ${'%' + query + '%'})
      AND (
        ${statusFilter}::text IS NULL OR 
        (${statusFilter} = 'NEW' AND r.phase_d_status IS NULL) OR
        r.phase_d_status = ${statusFilter}
      )
      AND (${cityFilter}::text IS NULL OR l.city ILIKE ${'%' + cityFilter + '%'})
      AND (${stateFilter}::text IS NULL OR l.state ILIKE ${'%' + stateFilter + '%'})
      AND (${zipFilter}::text IS NULL OR l.zip_code ILIKE ${zipFilter + '%'})
      AND (${naicsFilter}::text IS NULL OR l.naics_code ILIKE ${naicsFilter + '%'})
    ORDER BY ${orderBy} ${sql.unsafe(order)}
    LIMIT ${limit}
  `

  return (
    <div>
      <LeadsToolbar />
      <MasterList
        leads={leads}
        currentSort={sort}
        currentOrder={params.order === 'asc' ? 'asc' : 'desc'}
        currentLimit={limit}
      />
    </div>
  )
}
