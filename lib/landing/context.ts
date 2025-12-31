/**
 * Landing Page Context Functions
 * Handles token validation and context lookup for /landing/[token]
 */

import { validatePurchaseToken } from '@/lib/purchase'
import getSql from '@/lib/db'
import type { LandingContext, EffortLevel } from './types'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { CATALOG_HOOKS } from './catalog-hooks'

export { validatePurchaseToken }

const s3Client = new S3Client({
  region: 'us-east-1',
})

/**
 * Generate a presigned URL for an S3 object from its public URL
 */
async function getPresignedScreenshotUrl(
  s3Url: string | null
): Promise<string | null> {
  if (!s3Url) return null

  try {
    // Parse the S3 URL to extract bucket and key
    // Format: https://leadshop-raw.s3.us-east-1.amazonaws.com/screenshot/desktop/123.png
    const url = new URL(s3Url)
    const bucket = url.hostname.split('.')[0] // leadshop-raw
    const key = url.pathname.slice(1) // Remove leading /

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    })
    return presignedUrl
  } catch (error) {
    console.error('Failed to generate presigned URL:', error)
    return null
  }
}

/**
 * Format a value as a dollar amount with $ prefix
 */
function formatDollarAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '$0'

  // If already a string with $, return as-is
  if (typeof value === 'string' && value.startsWith('$')) {
    return value
  }

  // Parse number from string if needed (handles "1,500" format)
  const num =
    typeof value === 'string' ? parseFloat(value.replace(/[,$]/g, '')) : value

  if (isNaN(num)) return '$0'

  return `$${num.toLocaleString()}`
}

/**
 * Looks up landing page context from validated token payload.
 * Fetches lead, report, and opportunity data to construct the landing context.
 *
 * @param leadId - Lead identifier from validated token
 * @param runId - Optional run identifier for specific report version
 * @returns LandingContext or null if not found
 */
export async function lookupLandingContext(
  leadId: string,
  runId?: string
): Promise<LandingContext | null> {
  const leadIdInt = parseInt(leadId, 10)
  if (isNaN(leadIdInt)) {
    console.error('Invalid leadId:', leadId)
    return null
  }

  try {
    const sql = getSql()

    // CRITICAL: Determine the run_id to use for ALL queries
    // If not provided, get the most recent run from lead_scores
    let targetRunId = runId
    if (!targetRunId) {
      const latestRun = await sql`
        SELECT run_id_str
        FROM lead_scores
        WHERE lead_id = ${leadIdInt}
        ORDER BY created_at DESC
        LIMIT 1
      `
      targetRunId = latestRun[0]?.run_id_str
      if (!targetRunId) {
        console.error('No run found for lead:', leadIdInt)
        return null
      }
    }
    console.log(`Using run_id: ${targetRunId} for lead ${leadIdInt}`)

    // Query lead basic info
    const leadRows = await sql`
      SELECT id as lead_id, company, domain
      FROM leads
      WHERE id = ${leadIdInt}
    `
    if (leadRows.length === 0) {
      console.error('No lead found for id:', leadIdInt)
      return null
    }
    const lead = leadRows[0]

    // Get score from lead_scores for THIS run
    const scoreResult = await sql`
      SELECT overall_score
      FROM lead_scores
      WHERE lead_id = ${leadIdInt}
      AND run_id_str = ${targetRunId}
    `
    const overallScore = scoreResult[0]?.overall_score
      ? Math.round(parseFloat(scoreResult[0].overall_score))
      : 0

    // Get Phase B context for THIS run (friction points, impact ranges, issue count)
    const phaseBResult = await sql`
      SELECT (context #>> '{}')::jsonb as ctx
      FROM phaseb_journey_context
      WHERE lead_id = ${leadIdInt}
      AND run_id = ${targetRunId}
    `
    const phaseBCtx = phaseBResult[0]?.ctx || {}

    // Get impact range from bucket_scores TOTAL row for THIS run
    // Budget is stored in cents; convert to dollars and round to nearest $100
    const budgetResult = await sql`
      SELECT budget_low_cents, budget_high_cents
      FROM bucket_scores
      WHERE lead_id = ${leadIdInt}
      AND run_id = ${targetRunId}
      AND bucket = 'TOTAL'
      LIMIT 1
    `
    const budgetRow = budgetResult[0]
    const impactLowCents = budgetRow?.budget_low_cents || 0
    const impactHighCents = budgetRow?.budget_high_cents || 0
    // Convert cents to dollars and round to nearest $100
    const impactRangeLow = Math.round(impactLowCents / 100 / 100) * 100
    const impactRangeHigh = Math.round(impactHighCents / 100 / 100) * 100

    // Count total friction points across all buckets
    const allFrictionPoints = [
      ...(phaseBCtx.find?.friction_points || []),
      ...(phaseBCtx.trust?.friction_points || []),
      ...(phaseBCtx.contact?.friction_points || []),
      ...(phaseBCtx.understand?.friction_points || []),
    ]
    const issueCount = allFrictionPoints.length

    // Find top friction point by weighted_impact for catalog hook
    let topFrictionPointId: string | null = null
    let maxWeight = -1
    for (const fp of allFrictionPoints) {
      const weight = fp.weighted_impact || 0
      if (weight > maxWeight) {
        maxWeight = weight
        topFrictionPointId = fp.id
      }
    }
    const catalogHookText = topFrictionPointId
      ? CATALOG_HOOKS[topFrictionPointId] || null
      : null

    // Fetch screenshot URLs for THIS run
    const desktopScreenshot = await sql`
      SELECT value_text
      FROM assessment_results
      WHERE lead_id = ${leadIdInt}
      AND run_id = ${targetRunId}
      AND metric_key = 's3_image_url'
      AND value_text LIKE '%/desktop/%'
      LIMIT 1
    `
    const desktopScreenshotRaw = desktopScreenshot[0]?.value_text || null

    const mobileScreenshot = await sql`
      SELECT value_text
      FROM assessment_results
      WHERE lead_id = ${leadIdInt}
      AND run_id = ${targetRunId}
      AND metric_key = 's3_image_url'
      AND value_text LIKE '%/mobile/%'
      LIMIT 1
    `
    const mobileScreenshotRaw = mobileScreenshot[0]?.value_text || null

    // Generate presigned URLs for the screenshots
    const [desktopScreenshotUrl, mobileScreenshotUrl] = await Promise.all([
      getPresignedScreenshotUrl(desktopScreenshotRaw),
      getPresignedScreenshotUrl(mobileScreenshotRaw),
    ])

    // Find the top friction point for hook opportunity
    const topFrictionPoint = allFrictionPoints.find(
      (fp) => fp.id === topFrictionPointId
    )

    // Build the landing context
    const context: LandingContext = {
      // Company info
      company: lead.company || 'Unknown Company',
      domainUrl: lead.domain || '',

      // Score & impact
      score: overallScore,
      issueCount: issueCount || 0,
      impactLow: formatDollarAmount(impactRangeLow),
      impactHigh: formatDollarAmount(impactRangeHigh),

      // Hook opportunity - built from top friction point
      hookOpportunity: topFrictionPoint
        ? {
            title: topFrictionPoint.title || 'Website Issue Identified',
            effort: (topFrictionPoint.effort || 'MODERATE') as EffortLevel,
            description:
              catalogHookText ||
              topFrictionPoint.description ||
              topFrictionPoint.why_it_matters ||
              '',
            painStatement:
              topFrictionPoint.pain_statement ||
              topFrictionPoint.title ||
              'We found issues affecting your business.',
            anchorMetric: {
              label:
                topFrictionPoint.metric_label ||
                topFrictionPoint.evidence_template?.label ||
                'Score',
              value: String(
                topFrictionPoint.metric_value ||
                  topFrictionPoint.evidence_template?.value ||
                  '—'
              ),
              target: String(
                topFrictionPoint.metric_target ||
                  topFrictionPoint.evidence_template?.target ||
                  '—'
              ),
            },
          }
        : {
            title: 'Website Issues Identified',
            effort: 'MODERATE' as EffortLevel,
            description:
              "We found several issues that may be affecting your website's performance.",
            painStatement:
              'Your website has issues that could be costing you customers.',
            anchorMetric: {
              label: 'Overall Score',
              value: String(overallScore),
              target: '90',
            },
          },

      // Screenshots
      desktopScreenshotUrl:
        desktopScreenshotUrl || 'https://picsum.photos/1440/900',
      mobileScreenshotUrl:
        mobileScreenshotUrl || 'https://picsum.photos/375/812',

      // Purchase info
      price: 199,
      leadId: leadId,
      businessId: `business-${leadId}`,
    }

    return context
  } catch (error) {
    console.error('Error looking up landing context:', error)
    return null
  }
}
