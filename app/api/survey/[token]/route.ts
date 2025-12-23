import { NextRequest, NextResponse } from 'next/server'
import { validateSurveyToken } from '@/lib/survey/validation'
import { getSurveyQuestions } from '@/lib/survey/questions'
import { isSurveyCompleted } from '@/lib/survey/storage'

/**
 * GET /api/survey/[token]
 *
 * Validate token and return survey configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Next.js 15: params is now a Promise
    const { token } = await params

    // Validate JWT token
    const payload = await validateSurveyToken(token)
    if (!payload) {
      return NextResponse.json(
        {
          valid: false,
          error: 'invalid_token',
          message: 'Token is invalid or expired',
        },
        { status: 401 }
      )
    }

    // Check if survey already completed
    const completed = await isSurveyCompleted(payload.jti)
    if (completed) {
      return NextResponse.json(
        {
          valid: false,
          error: 'already_completed',
          message: 'This survey has already been completed',
        },
        { status: 410 }
      )
    }

    // Get survey questions
    const questions = getSurveyQuestions()

    // Return survey configuration
    return NextResponse.json({
      valid: true,
      survey: {
        leadId: payload.leadId,
        runId: payload.runId,
        version: payload.version || 'v1',
        batchId: payload.batchId,
      },
      questions,
    })
  } catch (error) {
    console.error('Survey GET error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    return NextResponse.json(
      {
        valid: false,
        error: 'server_error',
        message: 'An error occurred',
        debug:
          process.env.NODE_ENV === 'development'
            ? {
                error: error instanceof Error ? error.message : String(error),
              }
            : undefined,
      },
      { status: 500 }
    )
  }
}
