/**
 * Landing Page Context Functions
 * Handles token validation and context lookup for /landing/[token]
 */

import { validatePurchaseToken } from '@/lib/purchase'
import getSql from '@/lib/db'
import type { LandingContext, EffortLevel } from './types'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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

    // Query lead and latest report data
    const rows = await sql`
      SELECT
        l.id as lead_id,
        l.company,
        l.domain,
        r.id as report_id,
        r.report_data
      FROM leads l
      LEFT JOIN reports r ON r.lead_id = l.id
      WHERE l.id = ${leadIdInt}
      ORDER BY r.created_at DESC
      LIMIT 1
    `

    if (rows.length === 0) {
      console.error('No lead found for id:', leadIdInt)
      return null
    }

    const row = rows[0]
    const reportData = row.report_data || {}

    // Extract data from report_data JSON
    const impactRangeLow = reportData.impact_range_low || '$0'
    const impactRangeHigh = reportData.impact_range_high || '$0'
    const overallScore = reportData.overall_score || 0
    const heroIssues = reportData.hero_issues || []
    const opportunityDetails = reportData.opportunity_details || []

    // Get the hook opportunity (first hero issue or first opportunity)
    const hookIssue = heroIssues[0] || opportunityDetails[0] || null

    // Fetch screenshot URLs from assessment_results table
    const desktopScreenshot = await sql`
      SELECT value_text
      FROM assessment_results
      WHERE lead_id = ${leadIdInt}
      AND metric_key = 's3_image_url'
      AND value_text LIKE '%/desktop/%'
      ORDER BY measured_at DESC
      LIMIT 1
    `
    const desktopScreenshotRaw = desktopScreenshot[0]?.value_text || null

    const mobileScreenshot = await sql`
      SELECT value_text
      FROM assessment_results
      WHERE lead_id = ${leadIdInt}
      AND metric_key = 's3_image_url'
      AND value_text LIKE '%/mobile/%'
      ORDER BY measured_at DESC
      LIMIT 1
    `
    const mobileScreenshotRaw = mobileScreenshot[0]?.value_text || null

    // Generate presigned URLs for the screenshots
    const [desktopScreenshotUrl, mobileScreenshotUrl] = await Promise.all([
      getPresignedScreenshotUrl(desktopScreenshotRaw),
      getPresignedScreenshotUrl(mobileScreenshotRaw),
    ])

    // Build the landing context
    const context: LandingContext = {
      // Company info
      company: row.company || 'Unknown Company',
      domainUrl: row.domain || '',

      // Score & impact
      score: overallScore,
      issueCount: opportunityDetails.length || heroIssues.length || 0,
      impactLow: formatDollarAmount(impactRangeLow),
      impactHigh: formatDollarAmount(impactRangeHigh),

      // Hook opportunity
      hookOpportunity: hookIssue
        ? {
            title: hookIssue.title || 'Website Issue Identified',
            effort: (hookIssue.effort || 'MODERATE') as EffortLevel,
            description:
              hookIssue.description || hookIssue.why_it_matters || '',
            painStatement:
              hookIssue.pain_statement ||
              hookIssue.title ||
              'We found issues affecting your business.',
            anchorMetric: {
              label:
                hookIssue.metric_label ||
                hookIssue.evidence_template?.label ||
                'Score',
              value: String(
                hookIssue.metric_value ||
                  hookIssue.evidence_template?.value ||
                  '—'
              ),
              target: String(
                hookIssue.metric_target ||
                  hookIssue.evidence_template?.target ||
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
