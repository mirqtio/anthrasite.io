import getSql from '@/lib/db'
import type { BeforeAnswers, AfterAnswers, SurveyMetrics } from './types'
import { hashJti } from './validation'
import { randomUUID } from 'crypto'

export interface SaveSurveyOptions {
  jti: string
  leadId: string
  runId?: string
  version?: string
  batchId?: string
  beforeAnswers?: BeforeAnswers
  afterAnswers?: AfterAnswers
  metrics?: SurveyMetrics
  reportAccessed?: boolean
}

/**
 * Save or update survey response (idempotent)
 * Uses UPSERT pattern on jtiHash for idempotency
 */
export async function saveSurveyResponse(options: SaveSurveyOptions) {
  const sql = getSql() as any
  const jtiHash = hashJti(options.jti)
  const now = new Date()

  const data: Record<string, any> = {
    leadId: options.leadId,
    runId: options.runId || null,
    version: options.version || 'v1',
    batchId: options.batchId || null,
    updatedAt: now,
  }

  // Handle before answers
  if (options.beforeAnswers) {
    data.beforeAnswers = options.beforeAnswers
    data.beforeCompletedAt = now
  }

  // Handle after answers
  if (options.afterAnswers) {
    data.afterAnswers = options.afterAnswers
    data.afterCompletedAt = now
  }

  // Handle metrics
  if (options.metrics) {
    data.metrics = options.metrics
  }

  // Handle report access
  if (options.reportAccessed) {
    data.reportAccessedAt = now
  }

  // UPSERT using postgres.js
  const [response] = await sql`
    INSERT INTO survey_responses (
      id,
      "jtiHash",
      "leadId",
      "runId",
      version,
      "batchId",
      "beforeAnswers",
      "afterAnswers",
      metrics,
      "reportAccessedAt",
      "beforeCompletedAt",
      "afterCompletedAt",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${randomUUID()},
      ${jtiHash},
      ${data.leadId},
      ${data.runId},
      ${data.version},
      ${data.batchId},
      ${data.beforeAnswers || null},
      ${data.afterAnswers || null},
      ${data.metrics || null},
      ${data.reportAccessedAt || null},
      ${data.beforeCompletedAt || null},
      ${data.afterCompletedAt || null},
      ${now},
      ${now}
    )
    ON CONFLICT ("jtiHash") DO UPDATE SET
      "leadId" = EXCLUDED."leadId",
      "runId" = COALESCE(EXCLUDED."runId", survey_responses."runId"),
      version = COALESCE(EXCLUDED.version, survey_responses.version),
      "batchId" = COALESCE(EXCLUDED."batchId", survey_responses."batchId"),
      "beforeAnswers" = COALESCE(EXCLUDED."beforeAnswers", survey_responses."beforeAnswers"),
      "afterAnswers" = COALESCE(EXCLUDED."afterAnswers", survey_responses."afterAnswers"),
      metrics = COALESCE(EXCLUDED.metrics, survey_responses.metrics),
      "reportAccessedAt" = COALESCE(EXCLUDED."reportAccessedAt", survey_responses."reportAccessedAt"),
      "beforeCompletedAt" = COALESCE(EXCLUDED."beforeCompletedAt", survey_responses."beforeCompletedAt"),
      "afterCompletedAt" = COALESCE(EXCLUDED."afterCompletedAt", survey_responses."afterCompletedAt"),
      "updatedAt" = EXCLUDED."updatedAt"
    RETURNING *
  `

  return response
}

/**
 * Mark survey as completed (final submission)
 * Only marks as complete if both before and after sections are done
 */
export async function completeSurveyResponse(
  jti: string,
  beforeAnswers: BeforeAnswers,
  afterAnswers: AfterAnswers,
  metrics?: SurveyMetrics
) {
  const sql = getSql() as any
  const jtiHash = hashJti(jti)
  const now = new Date()

  const [response] = await sql`
    INSERT INTO survey_responses (
      id,
      "jtiHash",
      "leadId",
      "beforeAnswers",
      "afterAnswers",
      metrics,
      "beforeCompletedAt",
      "afterCompletedAt",
      "completedAt",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${randomUUID()},
      ${jtiHash},
      '',
      ${beforeAnswers},
      ${afterAnswers},
      ${metrics || null},
      ${now},
      ${now},
      ${now},
      ${now},
      ${now}
    )
    ON CONFLICT ("jtiHash") DO UPDATE SET
      "beforeAnswers" = EXCLUDED."beforeAnswers",
      "afterAnswers" = EXCLUDED."afterAnswers",
      metrics = COALESCE(EXCLUDED.metrics, survey_responses.metrics),
      "beforeCompletedAt" = EXCLUDED."beforeCompletedAt",
      "afterCompletedAt" = EXCLUDED."afterCompletedAt",
      "completedAt" = EXCLUDED."completedAt",
      "updatedAt" = EXCLUDED."updatedAt"
    RETURNING *
  `

  return response
}

/**
 * Log report access (for redirect shim)
 */
export async function logReportAccess(
  jti: string,
  leadId: string,
  version?: string,
  batchId?: string
) {
  console.log('[logReportAccess] Starting', { jti, leadId, version, batchId })
  const sql = getSql()
  const jtiHash = hashJti(jti)
  const now = new Date()

  console.log('[logReportAccess] Executing UPSERT', { jtiHash })
  const [response] = await sql`
    INSERT INTO survey_responses (
      id,
      "jtiHash",
      "leadId",
      version,
      "batchId",
      "reportAccessedAt",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${randomUUID()},
      ${jtiHash},
      ${leadId},
      ${version || 'v1'},
      ${batchId || null},
      ${now},
      ${now},
      ${now}
    )
    ON CONFLICT ("jtiHash") DO UPDATE SET
      "reportAccessedAt" = EXCLUDED."reportAccessedAt",
      "updatedAt" = EXCLUDED."updatedAt"
    RETURNING *
  `

  return response
}

/**
 * Get survey response by JTI
 */
export async function getSurveyResponse(jti: string) {
  try {
    const sql = getSql()
    console.log(
      '[getSurveyResponse] Starting with jti:',
      jti?.substring(0, 8) + '...'
    )
    const jtiHash = hashJti(jti)
    console.log(
      '[getSurveyResponse] jtiHash:',
      jtiHash?.substring(0, 16) + '...'
    )

    console.log('[getSurveyResponse] Executing query...')
    const [response] = await sql`
      SELECT * FROM survey_responses
      WHERE "jtiHash" = ${jtiHash}
    `
    console.log(
      '[getSurveyResponse] Query successful, found:',
      response ? 'record' : 'null'
    )

    return response || null
  } catch (error) {
    console.error('[getSurveyResponse] Error:', error)
    throw error
  }
}

/**
 * Check if survey is completed
 */
export async function isSurveyCompleted(jti: string): Promise<boolean> {
  const response = await getSurveyResponse(jti)
  return response?.completedAt != null
}

/**
 * Log email open event (idempotent via sendId)
 * Used by tracking pixel endpoint
 */
export async function logEmailOpen(options: {
  jti: string
  leadId: string
  runId?: string
  version?: string
  batchId?: string
  emailType?: string
  campaign?: string
  sendId?: string
  userAgent?: string
  ipHash?: string
}) {
  const sql = getSql() as any
  const jtiHash = hashJti(options.jti)
  const now = new Date()

  // UPSERT using sendId as conflict target
  // On first open: create record with openCount = 1
  // On subsequent opens: increment openCount and update metadata
  const [record] = await sql`
    INSERT INTO survey_email_opens (
      id,
      "jtiHash",
      "leadId",
      "runId",
      version,
      "batchId",
      "emailType",
      campaign,
      "sendId",
      "firstOpenedAt",
      "lastOpenedAt",
      "openCount",
      "userAgentLast",
      "ipHashLast"
    ) VALUES (
      gen_random_uuid(),
      ${jtiHash},
      ${options.leadId},
      ${options.runId || null},
      ${options.version || 'v1'},
      ${options.batchId || null},
      ${options.emailType || null},
      ${options.campaign || null},
      ${options.sendId || null},
      ${now},
      ${now},
      1,
      ${options.userAgent || null},
      ${options.ipHash || null}
    )
    ON CONFLICT ("sendId") DO UPDATE SET
      "lastOpenedAt" = ${now},
      "openCount" = survey_email_opens."openCount" + 1,
      "userAgentLast" = ${options.userAgent || null},
      "ipHashLast" = ${options.ipHash || null}
    RETURNING *
  `

  return record
}
