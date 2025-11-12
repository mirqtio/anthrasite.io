'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Question, AfterAnswers } from '@/lib/survey/types'
import RatingQuestion from './questions/RatingQuestion'
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion'
import TextQuestion from './questions/TextQuestion'
import CheckboxQuestion from './questions/CheckboxQuestion'

interface Props {
  questions: Question[]
  initialAnswers: Partial<AfterAnswers>
  onComplete: (answers: AfterAnswers) => void
  token: string
  beforeAnswers: Record<string, any>
}

export default function AfterQuestions({
  questions,
  initialAnswers,
  onComplete,
  token,
  beforeAnswers,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showErrorSummary, setShowErrorSummary] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const autoSavePartialAnswers = useCallback(async () => {
    try {
      await fetch(`/api/survey/${encodeURIComponent(token)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'after-partial',
          beforeAnswers: beforeAnswers,
          afterAnswers: answers,
        }),
      })
    } catch (error) {
      console.error('Failed to auto-save partial after answers:', error)
    }
  }, [token, beforeAnswers, answers])

  // Auto-save partial answers after 2 seconds of inactivity
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Don't auto-save if no answers yet
    if (Object.keys(answers).length === 0) {
      return
    }

    // Set new timer to save after 2 seconds
    autoSaveTimerRef.current = setTimeout(() => {
      autoSavePartialAnswers()
    }, 2000)

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [answers, autoSavePartialAnswers])

  function handleChange(questionId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setErrors((prev) => ({ ...prev, [questionId]: '' }))
    setShowErrorSummary(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate required fields
    const newErrors: Record<string, string> = {}
    questions.forEach((q) => {
      if (q.required && (!answers[q.id] || answers[q.id] === '')) {
        newErrors[q.id] = 'This question is required'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setShowErrorSummary(true)
      return
    }

    onComplete(answers as AfterAnswers)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Your Feedback
      </h1>
      <p className="text-gray-600 mb-8">
        Now that you've seen your report, we'd love to hear what you think.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((question, index) => (
          <div key={question.id}>
            <div className="text-sm font-medium text-blue-600 mb-1">
              Question {index + 1} of {questions.length}
            </div>
            {question.type === 'rating' && (
              <RatingQuestion
                question={question}
                value={answers[question.id]}
                onChange={(value) => handleChange(question.id, value)}
                error={errors[question.id]}
              />
            )}
            {question.type === 'multiple_choice' && (
              <MultipleChoiceQuestion
                question={question}
                value={answers[question.id]}
                onChange={(value) => handleChange(question.id, value)}
                error={errors[question.id]}
              />
            )}
            {question.type === 'text' && (
              <TextQuestion
                question={question}
                value={answers[question.id] || ''}
                onChange={(value) => handleChange(question.id, value)}
                error={errors[question.id]}
              />
            )}
            {question.type === 'checkbox' && (
              <CheckboxQuestion
                question={question}
                value={
                  answers[question.id] !== undefined
                    ? answers[question.id]
                    : true
                }
                onChange={(value) => handleChange(question.id, value)}
                error={errors[question.id]}
              />
            )}
          </div>
        ))}

        {showErrorSummary && Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">
              Please complete all required questions
            </p>
            <p className="text-sm text-red-600">
              {Object.keys(errors).length} required{' '}
              {Object.keys(errors).length === 1 ? 'question' : 'questions'} need
              {Object.keys(errors).length === 1 ? 's' : ''} your attention
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          style={{ backgroundColor: '#0066ff' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#0052cc')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#0066ff')
          }
        >
          Submit Survey
        </button>
      </form>
    </div>
  )
}
