import { prisma } from '@/lib/db'
import type { BeforeAnswers, AfterAnswers, SurveyMetrics } from './types'
import { hashJti } from './validation'

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
  const jtiHash = hashJti(options.jti)
  const now = new Date()

  const data: any = {
    leadId: options.leadId,
    runId: options.runId,
    version: options.version || 'v1',
    batchId: options.batchId,
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

  const response = await prisma.surveyResponse.upsert({
    where: { jtiHash },
    update: data,
    create: {
      jtiHash,
      ...data,
    },
  })

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
  const jtiHash = hashJti(jti)
  const now = new Date()

  const response = await prisma.surveyResponse.upsert({
    where: { jtiHash },
    update: {
      beforeAnswers,
      afterAnswers,
      metrics: metrics as any,
      beforeCompletedAt: now,
      afterCompletedAt: now,
      completedAt: now,
      updatedAt: now,
    },
    create: {
      jtiHash,
      leadId: '', // Will be populated from token
      beforeAnswers,
      afterAnswers,
      metrics: metrics as any,
      beforeCompletedAt: now,
      afterCompletedAt: now,
      completedAt: now,
    },
  })

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
  const jtiHash = hashJti(jti)
  const now = new Date()

  const response = await prisma.surveyResponse.upsert({
    where: { jtiHash },
    update: {
      reportAccessedAt: now,
      updatedAt: now,
    },
    create: {
      jtiHash,
      leadId,
      version: version || 'v1',
      batchId: batchId || undefined,
      reportAccessedAt: now,
    },
  })

  return response
}

/**
 * Get survey response by JTI
 */
export async function getSurveyResponse(jti: string) {
  const jtiHash = hashJti(jti)

  return await prisma.surveyResponse.findUnique({
    where: { jtiHash },
  })
}

/**
 * Check if survey is completed
 */
export async function isSurveyCompleted(jti: string): Promise<boolean> {
  const response = await getSurveyResponse(jti)
  return response?.completedAt != null
}
