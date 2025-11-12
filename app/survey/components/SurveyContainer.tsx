'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Question,
  SurveyStep,
  BeforeAnswers,
  AfterAnswers,
} from '@/lib/survey/types'
import BeforeQuestions from './BeforeQuestions'
import ReportAccess from './ReportAccess'
import AfterQuestions from './AfterQuestions'
import ThankYou from './ThankYou'
import ProgressBar from './ProgressBar'

interface SurveyData {
  leadId: string
  runId?: string
  version: string
  batchId?: string
}

interface SurveyState {
  step: SurveyStep
  token: string
  surveyData: SurveyData | null
  beforeQuestions: Question[]
  afterQuestions: Question[]
  beforeAnswers: Partial<BeforeAnswers>
  afterAnswers: Partial<AfterAnswers>
  reportAccessed: boolean
  startTime: number
  beforeStartTime?: number
  afterStartTime?: number
}

export default function SurveyContainer({ token }: { token: string }) {
  const [state, setState] = useState<SurveyState>({
    step: 'loading',
    token,
    surveyData: null,
    beforeQuestions: [],
    afterQuestions: [],
    beforeAnswers: {},
    afterAnswers: {},
    reportAccessed: false,
    startTime: Date.now(),
  })

  const loadSurvey = useCallback(async () => {
    try {
      const response = await fetch(`/api/survey/${encodeURIComponent(token)}`)
      const data = await response.json()

      if (!data.valid) {
        setState((prev) => ({
          ...prev,
          step: 'error',
          surveyData: null,
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        step: 'before',
        surveyData: data.survey,
        beforeQuestions: data.questions.before,
        afterQuestions: data.questions.after,
        beforeStartTime: Date.now(),
      }))
    } catch (error) {
      console.error('Failed to load survey:', error)
      setState((prev) => ({
        ...prev,
        step: 'error',
      }))
    }
  }, [token])

  // Load survey on mount
  useEffect(() => {
    loadSurvey()
  }, [loadSurvey])

  async function handleBeforeComplete(answers: BeforeAnswers) {
    setState((prev) => ({
      ...prev,
      beforeAnswers: answers,
      step: 'report',
    }))

    // Save partial progress
    try {
      const timeBefore = state.beforeStartTime
        ? Date.now() - state.beforeStartTime
        : undefined

      await fetch(`/api/survey/${encodeURIComponent(token)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'before',
          beforeAnswers: answers,
          metrics: {
            time_before_ms: timeBefore,
          },
        }),
      })
    } catch (error) {
      console.error('Failed to save before answers:', error)
    }
  }

  function handleReportAccess() {
    setState((prev) => ({
      ...prev,
      reportAccessed: true,
    }))
  }

  function handleReportContinue() {
    setState((prev) => ({
      ...prev,
      step: 'after',
      afterStartTime: Date.now(),
    }))
  }

  async function handleAfterComplete(answers: AfterAnswers) {
    setState((prev) => ({
      ...prev,
      afterAnswers: answers,
      step: 'thank-you',
    }))

    // Submit complete survey
    try {
      const timeBefore = state.beforeStartTime
        ? Date.now() - state.beforeStartTime
        : undefined
      const timeAfter = state.afterStartTime
        ? Date.now() - state.afterStartTime
        : undefined

      await fetch(`/api/survey/${encodeURIComponent(token)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'complete',
          beforeAnswers: state.beforeAnswers,
          afterAnswers: answers,
          reportAccessed: state.reportAccessed,
          metrics: {
            time_before_ms: timeBefore,
            time_after_ms: timeAfter,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            user_agent: navigator.userAgent,
          },
        }),
      })
    } catch (error) {
      console.error('Failed to submit survey:', error)
    }
  }

  if (state.step === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <div className="text-white">Loading survey...</div>
      </div>
    )
  }

  if (state.step === 'error') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <div
          className="w-full bg-white rounded-lg shadow-lg p-8 text-center"
          style={{ maxWidth: '28rem' }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Survey Unavailable
          </h1>
          <p className="text-gray-600">
            This survey link has expired or has already been completed. If you
            believe this is an error, please contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen py-8 sm:py-12 px-4"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="mx-auto" style={{ maxWidth: '768px' }}>
        {(state.step === 'before' ||
          state.step === 'report' ||
          state.step === 'after') && <ProgressBar currentStep={state.step} />}

        {state.step === 'before' && (
          <BeforeQuestions
            questions={state.beforeQuestions}
            initialAnswers={state.beforeAnswers}
            onComplete={handleBeforeComplete}
          />
        )}

        {state.step === 'report' && (
          <ReportAccess
            token={token}
            reportAccessed={state.reportAccessed}
            onReportClick={handleReportAccess}
            onContinue={handleReportContinue}
          />
        )}

        {state.step === 'after' && (
          <AfterQuestions
            questions={state.afterQuestions}
            initialAnswers={state.afterAnswers}
            onComplete={handleAfterComplete}
            token={token}
            beforeAnswers={state.beforeAnswers}
          />
        )}

        {state.step === 'thank-you' && <ThankYou />}
      </div>
    </div>
  )
}
