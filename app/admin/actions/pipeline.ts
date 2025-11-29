'use server'

import { getSql } from '@/lib/db'
import { getTemporalClient } from '@/lib/temporal/client'
import { revalidatePath } from 'next/cache'
import { BatchOperationResult, LeadAction } from '@/types/admin'
import { randomUUID } from 'crypto'

// ----------------------------------------------------------------------
// Pipeline Control Actions
// ----------------------------------------------------------------------

// Safety Latch: Require confirmation token for batches > 100
const BATCH_SAFETY_LIMIT = 100
const CONFIRMATION_TOKEN = 'CONFIRM' // In real app, this might be dynamic or user-input

/**
 * Triggers Phase D (Premium Report Generation) for a batch of leads.
 * Enforces safety latch for large batches.
 */
export async function triggerBatchPhaseD(
  leadIds: number[],
  confirmationToken?: string
): Promise<BatchOperationResult[]> {
  // 1. Safety Latch
  if (
    leadIds.length > BATCH_SAFETY_LIMIT &&
    confirmationToken !== CONFIRMATION_TOKEN
  ) {
    throw new Error(
      `Batch size > ${BATCH_SAFETY_LIMIT} requires confirmation token '${CONFIRMATION_TOKEN}'.`
    )
  }

  const sql = getSql()
  const client = await getTemporalClient()
  const results: BatchOperationResult[] = []
  const batchId = randomUUID() // Generate a unique batch ID for this operation

  // 2. Resolve Eligible Runs (Most recent run with a memo)
  // We do this in a loop for simplicity, but could be bulk query if performance needed.
  for (const leadId of leadIds) {
    try {
      const [row] = await sql`
        SELECT r.id_str AS run_id,
               r.reasoning_memo_s3_key,
               COALESCE(l.company, '') AS business_name,
               COALESCE(r.started_at, r.created_at) AS t
        FROM runs r
        JOIN leads l ON l.id = r.lead_id
        WHERE r.lead_id = ${leadId} 
          AND r.reasoning_memo_s3_key IS NOT NULL
        ORDER BY t DESC
        LIMIT 1
      `

      if (!row) {
        results.push({
          leadId,
          status: 'skipped',
          reason: 'No run with memo found',
        })
        continue
      }

      // 3. Idempotent Workflow Start
      const workflowId = `premium-report-${row.run_id}`

      await client.workflow.start('PremiumReportGenerationWorkflow', {
        workflowId,
        taskQueue: 'assessment-pipeline',
        workflowIdReusePolicy: 'REJECT_DUPLICATE', // Critical: Prevent double-start
        args: [
          {
            run_id: row.run_id,
            lead_id: leadId,
            batch_id: batchId,
            business_name: row.business_name,
            memo_s3_key: row.reasoning_memo_s3_key,
            skip_synthesis: false, // Full run
          },
        ],
      })

      results.push({ leadId, status: 'triggered', runId: row.run_id })
    } catch (err: any) {
      // Handle "Already Started" gracefully
      if (err.name === 'WorkflowExecutionAlreadyStartedError') {
        results.push({ leadId, status: 'skipped', reason: 'Already running' })
      } else {
        console.error(
          `[Admin] Failed to trigger Phase D for lead ${leadId}:`,
          err
        )
        results.push({ leadId, status: 'error', reason: err.message })
      }
    }
  }

  revalidatePath('/admin/leads')
  return results
}

/**
 * Repair Action: Regenerate PDF (Skip Synthesis)
 */
export async function repairLead(
  leadId: number,
  action: LeadAction
): Promise<{ success: boolean; message?: string; workflowId?: string }> {
  if (action !== 'REGENERATE_PDF') {
    return {
      success: false,
      message: 'Only REGENERATE_PDF is currently supported for repair.',
    }
  }

  const sql = getSql()
  const client = await getTemporalClient()

  // Fetch latest run with memo
  const [row] = await sql`
    SELECT r.id_str AS run_id,
           r.reasoning_memo_s3_key,
           COALESCE(l.company, '') AS business_name
    FROM runs r
    JOIN leads l ON l.id = r.lead_id
    WHERE r.lead_id = ${leadId} AND r.reasoning_memo_s3_key IS NOT NULL
    ORDER BY COALESCE(r.started_at, r.created_at) DESC
    LIMIT 1
  `

  if (!row) throw new Error('No eligible run found for repair.')

  const workflowId = `premium-report-${row.run_id}-repair-${Date.now()}` // Unique ID for repair to allow re-run

  await client.workflow.start('PremiumReportGenerationWorkflow', {
    workflowId,
    taskQueue: 'assessment-pipeline',
    args: [
      {
        run_id: row.run_id,
        lead_id: leadId,
        batch_id: 'repair-op',
        business_name: row.business_name,
        memo_s3_key: row.reasoning_memo_s3_key,
        skip_synthesis: true, // <--- The Repair Magic
      },
    ],
  })

  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true, workflowId }
}

/**
 * Triggers Phase A-C (Assessment) for a single lead.
 * Uses BatchAssessmentWorkflow_v2 with a single lead ID.
 */
export async function triggerAssessment(
  leadId: number
): Promise<{ success: boolean; message?: string; batchId?: string }> {
  const client = await getTemporalClient()
  const batchId = `manual-assessment-${leadId}-${Date.now()}`

  await client.workflow.start('BatchAssessmentWorkflow_v2', {
    workflowId: `batch-assessment-${batchId}`,
    taskQueue: 'assessment-pipeline',
    args: [
      {
        batch_id: batchId,
        lead_ids: [leadId],
        mode: 'standard',
        enable_phase_b: true,
      },
    ],
  })

  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true, batchId }
}

/**
 * Triggers Phase A-C (Assessment) for a batch of leads.
 */
export async function triggerBatchAssessment(
  leadIds: number[],
  confirmationToken?: string
): Promise<BatchOperationResult[]> {
  if (
    leadIds.length > BATCH_SAFETY_LIMIT &&
    confirmationToken !== CONFIRMATION_TOKEN
  ) {
    throw new Error(
      `Batch size > ${BATCH_SAFETY_LIMIT} requires confirmation token '${CONFIRMATION_TOKEN}'.`
    )
  }

  const client = await getTemporalClient()
  const batchId = `batch-assessment-${Date.now()}`
  const results: BatchOperationResult[] = []

  try {
    const sql = getSql()

    // 1. Create batch record in DB (Required for FK constraints in workflow)
    await sql`
            INSERT INTO batches (
                id_str, status, target_count, 
                created_by, mode, phase_b_enabled, config
            ) VALUES (
                ${batchId}, 'pending', ${leadIds.length}, 
                'admin-ui', 'standard', true, '{}'::jsonb
            )
        `

    console.log(
      `[Admin] Triggering batch assessment for ${leadIds.length} leads. BatchID: ${batchId}`
    )

    const handle = await client.workflow.start('BatchAssessmentWorkflow_v2', {
      workflowId: `batch-assessment-${batchId}`,
      taskQueue: 'assessment-pipeline',
      args: [
        {
          batch_id: batchId,
          lead_ids: leadIds,
          mode: 'standard',
          enable_phase_b: true,
        },
      ],
    })

    // 2. Update batch with workflow ID
    await sql`
            UPDATE batches 
            SET workflow_id = ${handle.workflowId},
                workflow_run_id = ${handle.firstExecutionRunId},
                phase_a_status = 'running',
                phase_a_started_at = NOW()
            WHERE id_str = ${batchId}
        `

    // Since it's a single batch workflow for all leads, we mark all as triggered
    for (const leadId of leadIds) {
      results.push({ leadId, status: 'triggered', runId: batchId })
    }
  } catch (err: any) {
    console.error(`[Admin] Failed to trigger batch assessment:`, err)
    for (const leadId of leadIds) {
      results.push({ leadId, status: 'error', reason: err.message })
    }
  }

  revalidatePath('/admin/leads')
  return results
}

/**
 * Batch version of repairLead (Regenerate PDF).
 */
export async function regenerateReport(
  leadIds: number[],
  confirmationToken?: string
): Promise<BatchOperationResult[]> {
  if (
    leadIds.length > BATCH_SAFETY_LIMIT &&
    confirmationToken !== CONFIRMATION_TOKEN
  ) {
    throw new Error(
      `Batch size > ${BATCH_SAFETY_LIMIT} requires confirmation token '${CONFIRMATION_TOKEN}'.`
    )
  }

  const results: BatchOperationResult[] = []

  for (const leadId of leadIds) {
    try {
      const res = await repairLead(leadId, 'REGENERATE_PDF')
      if (res.success) {
        results.push({ leadId, status: 'triggered', runId: res.workflowId })
      } else {
        results.push({ leadId, status: 'skipped', reason: res.message })
      }
    } catch (err: any) {
      results.push({ leadId, status: 'error', reason: err.message })
    }
  }

  revalidatePath('/admin/leads')
  return results
}

/**
 * Resend report email (Placeholder).
 */
export async function resendReportEmail(
  leadIds: number[]
): Promise<BatchOperationResult[]> {
  const results: BatchOperationResult[] = []

  try {
    // Call Python Backend API
    const response = await fetch('http://127.0.0.1:8000/api/email/send-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lead_ids: leadIds,
        rate_limit_per_min: 60, // Fast for manual triggers
        max_retries: 3,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Email service error: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // The Python API returns aggregate stats, but for the UI we want per-lead status.
    // Since it's a batch success, we mark all as triggered.
    for (const leadId of leadIds) {
      results.push({
        leadId,
        status: 'triggered',
        runId: 'email-batch',
        reason: `Batch sent: ${data.sent} sent, ${data.failed} failed`,
      })
    }
  } catch (err: any) {
    console.error('[Admin] Failed to resend emails:', err)
    for (const leadId of leadIds) {
      results.push({ leadId, status: 'error', reason: err.message })
    }
  }

  return results
}
