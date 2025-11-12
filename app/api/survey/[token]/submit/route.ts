import { NextRequest, NextResponse } from 'next/server'
import { validateSurveyToken } from '@/lib/survey/validation'
import {
  saveSurveyResponse,
  completeSurveyResponse,
} from '@/lib/survey/storage'
import { beforeAnswersSchema, type AfterAnswers } from '@/lib/survey/types'
import { z } from 'zod'

const submitSchema = z.object({
  step: z.enum(['before', 'after', 'after-partial', 'complete']),
  beforeAnswers: beforeAnswersSchema.optional(),
  afterAnswers: z.record(z.any()).optional(), // Allow partial answers for auto-save
  reportAccessed: z.boolean().optional(),
  metrics: z
    .object({
      time_before_ms: z.number().optional(),
      time_after_ms: z.number().optional(),
      time_to_report_click: z.number().optional(),
      screen_width: z.number().optional(),
      screen_height: z.number().optional(),
      user_agent: z.string().optional(),
    })
    .optional(),
})

/**
 * POST /api/survey/[token]/submit
 *
 * Submit survey responses (partial or complete)
 * Idempotent via UPSERT on jtiHash
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Validate JWT token
    const payload = await validateSurveyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'invalid_token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validatedData = submitSchema.parse(body)

    // Handle complete submission
    if (
      validatedData.step === 'complete' &&
      validatedData.beforeAnswers &&
      validatedData.afterAnswers
    ) {
      const response = await completeSurveyResponse(
        payload.jti,
        validatedData.beforeAnswers,
        validatedData.afterAnswers as AfterAnswers,
        validatedData.metrics
      )

      // Update leadId from token if not set
      if (!response.leadId || response.leadId === '') {
        const { prisma } = await import('@/lib/db')
        await prisma.surveyResponse.update({
          where: { id: response.id },
          data: {
            leadId: payload.leadId,
            runId: payload.runId,
            version: payload.version || 'v1',
            batchId: payload.batchId,
          },
        })
      }

      return NextResponse.json({
        success: true,
        submissionId: response.id,
        completed: true,
        message: 'Thank you for your feedback!',
      })
    }

    // Handle partial submission
    const response = await saveSurveyResponse({
      jti: payload.jti,
      leadId: payload.leadId,
      runId: payload.runId,
      version: payload.version,
      batchId: payload.batchId,
      beforeAnswers: validatedData.beforeAnswers,
      afterAnswers: validatedData.afterAnswers as AfterAnswers | undefined,
      metrics: validatedData.metrics,
      reportAccessed: validatedData.reportAccessed,
    })

    return NextResponse.json({
      success: true,
      submissionId: response.id,
      completed: false,
      message: 'Progress saved',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          fields: error.errors.reduce(
            (acc, err) => ({
              ...acc,
              [err.path.join('.')]: err.message,
            }),
            {}
          ),
        },
        { status: 400 }
      )
    }

    console.error('Survey POST error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}
