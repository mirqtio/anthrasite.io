'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useExitIntent } from '@/lib/hooks/useExitIntent'
import { useScrollUpAfterDwell } from '@/lib/hooks/useScrollUpAfterDwell'
import { trackEvent } from '@/lib/analytics/analytics-client'

const STORAGE_KEY_SEEN = 'voc_survey_seen'
const STORAGE_KEY_CTA_CLICKED = 'voc_survey_cta_clicked'

const ANSWER_OPTIONS = [
  'Price is too high',
  "My website isn't a priority",
  "This doesn't seem accurate",
  "I'm not sure how to use this information",
  'Other',
] as const

type AnswerOption = (typeof ANSWER_OPTIONS)[number]

interface VocSurveyModalProps {
  leadId?: string
  landingTokenId?: string
}

type ModalState =
  | 'idle'
  | 'triggered'
  | 'answering_other'
  | 'answered'
  | 'dismissed'

export function VocSurveyModal({
  leadId,
  landingTokenId,
}: VocSurveyModalProps) {
  const [state, setState] = useState<ModalState>('idle')
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(
    null
  )
  const [otherText, setOtherText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageLoadTime] = useState(() => Date.now())

  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Detect exit intent (desktop) and scroll-up after dwell (mobile)
  const exitIntentTriggered = useExitIntent(50)
  const scrollUpTriggered = useScrollUpAfterDwell(10000, 100)

  // Determine trigger type
  const triggerType = exitIntentTriggered
    ? 'exit_intent_desktop'
    : scrollUpTriggered
      ? 'scroll_up_mobile'
      : null

  // Check if modal should show
  useEffect(() => {
    if (state !== 'idle') return
    if (!triggerType) return

    // Check sessionStorage gates
    if (typeof window === 'undefined') return

    const alreadySeen = sessionStorage.getItem(STORAGE_KEY_SEEN) === 'true'
    const ctaClicked =
      sessionStorage.getItem(STORAGE_KEY_CTA_CLICKED) === 'true'

    if (alreadySeen || ctaClicked) return

    // Mark as seen and show modal
    sessionStorage.setItem(STORAGE_KEY_SEEN, 'true')
    setState('triggered')

    const secondsOnPage = Math.floor((Date.now() - pageLoadTime) / 1000)

    trackEvent('voc_abandoner_survey_shown', {
      lead_id: leadId,
      trigger_type: triggerType,
      seconds_on_page: secondsOnPage,
      page_path: window.location.pathname,
    })
  }, [state, triggerType, leadId, pageLoadTime])

  // Focus trap and a11y
  useEffect(() => {
    if (state !== 'triggered' && state !== 'answering_other') return

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the modal
    modalRef.current?.focus()

    // Trap focus within modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss()
        return
      }

      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus when modal closes
      previousActiveElement.current?.focus()
    }
  }, [state])

  const getSecondsOnPage = useCallback(() => {
    return Math.floor((Date.now() - pageLoadTime) / 1000)
  }, [pageLoadTime])

  const submitSurvey = useCallback(
    async (answer: string | null, otherText?: string, dismissed = false) => {
      const secondsOnPage = getSecondsOnPage()

      try {
        await fetch('/api/voc-survey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            landingTokenId,
            leadId,
            answer,
            otherText,
            triggerType: triggerType ?? 'exit_intent_desktop',
            secondsOnPage,
            dismissed,
          }),
        })
      } catch (err) {
        console.error('VoC survey submission error:', err)
      }
    },
    [landingTokenId, leadId, triggerType, getSecondsOnPage]
  )

  const handleAnswerClick = useCallback(
    async (answer: AnswerOption) => {
      if (answer === 'Other') {
        setSelectedAnswer(answer)
        setState('answering_other')
        return
      }

      setIsSubmitting(true)
      await submitSurvey(answer)

      trackEvent('voc_abandoner_survey_answered', {
        lead_id: leadId,
        answer,
        trigger_type: triggerType,
        seconds_on_page: getSecondsOnPage(),
        page_path: window.location.pathname,
      })

      setState('answered')
      setIsSubmitting(false)
    },
    [leadId, triggerType, getSecondsOnPage, submitSurvey]
  )

  const handleOtherSubmit = useCallback(async () => {
    if (!otherText.trim()) return

    setIsSubmitting(true)
    await submitSurvey('Other', otherText.trim())

    trackEvent('voc_abandoner_survey_answered', {
      lead_id: leadId,
      answer: 'Other',
      other_text: otherText.trim(),
      trigger_type: triggerType,
      seconds_on_page: getSecondsOnPage(),
      page_path: window.location.pathname,
    })

    setState('answered')
    setIsSubmitting(false)
  }, [leadId, triggerType, otherText, getSecondsOnPage, submitSurvey])

  const handleDismiss = useCallback(async () => {
    await submitSurvey(null, undefined, true)

    trackEvent('voc_abandoner_survey_dismissed', {
      lead_id: leadId,
      trigger_type: triggerType,
      seconds_on_page: getSecondsOnPage(),
      page_path: window.location.pathname,
    })

    setState('dismissed')
  }, [leadId, triggerType, getSecondsOnPage, submitSurvey])

  // Don't render if not triggered or already completed
  if (state === 'idle' || state === 'answered' || state === 'dismissed') {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleDismiss}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voc-survey-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close survey"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Title */}
        <h2
          id="voc-survey-title"
          className="text-xl font-semibold text-slate-900 text-center mb-2"
        >
          Quick question?
        </h2>

        {/* Question */}
        <p className="text-slate-600 text-center mb-6">
          What stopped you from getting your report today?
        </p>

        {/* Answer options */}
        {state === 'triggered' && (
          <div className="flex flex-col gap-3">
            {ANSWER_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerClick(option)}
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {option}
              </button>
            ))}

            {/* Dismiss link */}
            <button
              onClick={handleDismiss}
              className="w-full px-6 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Not now
            </button>
          </div>
        )}

        {/* Other text input */}
        {state === 'answering_other' && (
          <div className="flex flex-col gap-4">
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Tell us what's on your mind..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              rows={3}
              maxLength={1000}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setState('triggered')}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleOtherSubmit}
                disabled={!otherText.trim() || isSubmitting}
                className="flex-1 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Utility to mark CTA as clicked (call this from parent when user clicks CTA).
 * This suppresses the survey from showing.
 */
export function markCtaClicked() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY_CTA_CLICKED, 'true')
  }
}
