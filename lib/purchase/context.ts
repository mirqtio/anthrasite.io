import getSql from '@/lib/db'
import type { PurchaseContext, HeroIssue } from './types'

/**
 * Parse currency string to number
 * Handles formats like "19,800" or "$19,800" -> 19800
 */
function parseCurrency(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  // Remove $ and commas, parse as int
  return parseInt(value.replace(/[$,]/g, ''), 10) || 0
}

/**
 * Look up purchase context from database
 * Mirrors pattern from lib/survey/reports.ts
 *
 * Strategy: Try exact run_id match first, fall back to most recent report
 */
export async function lookupPurchaseContext(
  leadId: string,
  runId?: string
): Promise<PurchaseContext | null> {
  try {
    const sql = getSql()
    const leadIdInt = parseInt(leadId)

    console.log('[lookupPurchaseContext] Input parameters:', {
      leadId,
      leadIdInt,
      runId,
    })

    let result

    // Try exact run_id match first if provided
    if (runId) {
      console.log('[lookupPurchaseContext] Trying exact run_id match:', {
        leadIdInt,
        runId,
      })
      result = await sql`
        SELECT
          l.company as business_name,
          l.domain as domain_url,
          r.report_data->>'impact_range_low' as impact_monthly_low,
          r.report_data->>'impact_range_high' as impact_monthly_high,
          r.report_data->'hero_issues' as issues,
          r.run_id
        FROM reports r
        JOIN leads l ON l.id = r.lead_id
        WHERE r.lead_id = ${leadIdInt}
          AND r.run_id = ${runId}
          AND r.report_data IS NOT NULL
        ORDER BY r.created_at DESC
        LIMIT 1
      `
      console.log('[lookupPurchaseContext] Exact match result:', {
        rowCount: result.length,
      })
    }

    // Fall back to most recent report for this lead if no exact match
    if (!result || result.length === 0) {
      console.log(
        '[lookupPurchaseContext] No exact match, falling back to most recent for lead:',
        leadIdInt
      )
      result = await sql`
        SELECT
          l.company as business_name,
          l.domain as domain_url,
          r.report_data->>'impact_range_low' as impact_monthly_low,
          r.report_data->>'impact_range_high' as impact_monthly_high,
          r.report_data->'hero_issues' as issues,
          r.run_id
        FROM reports r
        JOIN leads l ON l.id = r.lead_id
        WHERE r.lead_id = ${leadIdInt}
          AND r.report_data IS NOT NULL
        ORDER BY r.created_at DESC
        LIMIT 1
      `
      console.log('[lookupPurchaseContext] Fallback result:', {
        rowCount: result.length,
      })
    }

    if (result.length === 0) {
      console.error(
        `[lookupPurchaseContext] No report found for leadId=${leadId}, runId=${runId}`
      )
      return null
    }

    const row = result[0]

    // Parse issues - handle both string and object
    let issues: HeroIssue[] = []
    if (row.issues) {
      const rawIssues =
        typeof row.issues === 'string' ? JSON.parse(row.issues) : row.issues
      // Take first 3 issues for display
      issues = (rawIssues || []).slice(0, 3).map((issue: any) => ({
        title: issue.title || '',
        description: issue.description || issue.why_it_matters || '',
        impact_low: issue.impact_low || '0',
        impact_high: issue.impact_high || '0',
      }))
    }

    const context: PurchaseContext = {
      businessName: row.business_name || '',
      domainUrl: row.domain_url || '',
      impactMonthlyLow: parseCurrency(row.impact_monthly_low),
      impactMonthlyHigh: parseCurrency(row.impact_monthly_high),
      issues,
      leadId: leadIdInt,
      runId: row.run_id,
    }

    console.log('[lookupPurchaseContext] Returning context:', {
      businessName: context.businessName,
      domainUrl: context.domainUrl,
      impactRange: `$${context.impactMonthlyLow}-$${context.impactMonthlyHigh}`,
      issueCount: context.issues.length,
    })

    return context
  } catch (error) {
    console.error('[lookupPurchaseContext] Failed:', error)
    return null
  }
}

/**
 * Check if purchase context exists for a lead
 */
export async function purchaseContextExists(
  leadId: string,
  runId?: string
): Promise<boolean> {
  const context = await lookupPurchaseContext(leadId, runId)
  return context !== null
}
