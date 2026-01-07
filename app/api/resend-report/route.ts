import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getTemporalClient } from '@/lib/temporal/client'

/**
 * POST /api/resend-report
 *
 * Resends the report delivery email for an existing sale.
 * Used from the soft-gate modal when a user wants to resend
 * instead of purchasing again.
 */
export async function POST(request: NextRequest) {
  try {
    const { saleId } = await request.json()

    if (!saleId) {
      return NextResponse.json({ error: 'Missing saleId' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Fetch sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('id, contact_id, customer_email, report_id')
      .eq('id', saleId)
      .single()

    if (saleError || !sale) {
      console.error('[resend-report] Sale not found:', saleError)
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    // Fetch report data
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('lead_id, run_id')
      .eq('id', sale.report_id)
      .single()

    if (reportError || !report) {
      console.error('[resend-report] Report not found:', reportError)
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    console.log('[resend-report] Triggering Phase E resend:', {
      saleId: sale.id,
      leadId: report.lead_id,
      runId: report.run_id,
      contactId: sale.contact_id,
    })

    // Trigger Phase E resend via Temporal
    const temporalClient = await getTemporalClient()
    const workflowId = `phase-e-resend-${saleId}-${Date.now()}`

    await temporalClient.workflow.start('PhaseEDeliveryWorkflow', {
      workflowId,
      taskQueue: 'premium-reports',
      args: [
        {
          lead_id: report.lead_id,
          run_id: report.run_id,
          report_s3_key: '', // Not needed for resend
          customer_email: sale.customer_email,
          sale_id: sale.id,
          contact_id: sale.contact_id,
          resend: true, // Flag to skip dedup check
        },
      ],
    })

    console.log('[resend-report] Started workflow:', workflowId)

    return NextResponse.json({ success: true, workflowId })
  } catch (error) {
    console.error('[resend-report] Error:', error)
    return NextResponse.json(
      { error: 'Failed to resend report' },
      { status: 500 }
    )
  }
}
