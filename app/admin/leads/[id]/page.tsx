import { getSql } from '@/lib/db'
import { LeadRow, RunRow } from '@/types/admin'
import { PipelineActionsToolbar } from '@/components/admin/PipelineActionsToolbar'
import { LeadDetailsView } from '@/components/admin/LeadDetailsView'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const sql = getSql()
  const leadId = parseInt(params.id)

  if (isNaN(leadId)) {
    return <div className="text-white p-8">Invalid Lead ID: {params.id}</div>
  }

  try {
    // Parallel Fetch: Lead, Runs, Contacts, Reports
    const [leads, runs, contacts, reports] = await Promise.all([
      sql<LeadRow[]>`SELECT * FROM leads WHERE id = ${leadId} LIMIT 1`,
      sql<RunRow[]>`
          SELECT 
            id_str, lead_id, phase_a_status, phase_b_status, phase_c_status, phase_d_status,
            reasoning_memo_s3_key, started_at, created_at
          FROM runs 
          WHERE lead_id = ${leadId} 
          ORDER BY created_at DESC
        `,
      sql<any[]>`SELECT * FROM contacts WHERE lead_id = ${leadId}`,
      sql<
        any[]
      >`SELECT * FROM reports WHERE lead_id = ${leadId} ORDER BY created_at DESC LIMIT 1`,
    ])

    const lead = leads[0]
    if (!lead) return <div className="text-white">Lead not found</div>

    // Determine "Best Run" for display (Completed > Running > Latest)
    const completedRun = runs.find((r) => r.phase_d_status === 'completed')
    const runningRun = runs.find(
      (r) => r.phase_d_status === 'running' || r.phase_d_status === 'pending'
    )
    const displayRun = completedRun || runningRun || runs[0]

    // Status Logic
    const displayStatus = completedRun
      ? 'COMPLETED'
      : displayRun?.phase_d_status || 'NEW'

    // Report Link
    const report = reports[0]
    const reportUrl = null
    /*
        if (report?.pdf_s3_key) {
            try {
                const { generateReportPresignedUrl } = await import('@/lib/survey/s3');
                reportUrl = await generateReportPresignedUrl(report.pdf_s3_key);
            } catch (e) {
                console.error("Failed to generate presigned URL", e);
            }
        }
        */

    return (
      <LeadDetailsView
        lead={lead}
        contacts={contacts}
        displayStatus={displayStatus}
        displayRun={displayRun}
        reportUrl={reportUrl}
        report={report}
        runs={runs}
      />
    )
  } catch (e: any) {
    return (
      <div className="text-red-500 p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Lead</h1>
        <pre className="bg-black/50 p-4 rounded overflow-auto">{e.message}</pre>
        <pre className="bg-black/50 p-4 rounded overflow-auto mt-4 text-xs text-white/50">
          {e.stack}
        </pre>
      </div>
    )
  }
}
