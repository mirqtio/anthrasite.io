'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, Loader2, Circle, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo'

const PROGRESS_STEPS = [
  {
    label: 'Find',
    title: 'Can customers discover your business?',
    description:
      "If people can't find you in search results or on maps, nothing else matters. We look at local search presence, page speed, and the technical signals Google uses to decide what to show.",
  },
  {
    label: 'Trust',
    title: 'Does your website inspire confidence?',
    description:
      'Visitors decide in seconds whether your business feels legitimate. We look at security indicators, reviews, professional presentation—the signals that make people stay or leave.',
  },
  {
    label: 'Understand',
    title: 'Is it clear what you offer?',
    description:
      'Once visitors stay, they need to quickly grasp your value. We assess your layout, messaging, and how easily someone can understand what makes you different.',
  },
  {
    label: 'Contact',
    title: 'Can interested visitors take action?',
    description:
      'This is where browsers become buyers. We check whether your calls-to-action are visible, contact info is findable, and everything works on mobile.',
  },
  {
    label: 'Impact',
    title: 'Calculating what matters for you',
    description:
      "Every website has issues. The question is which ones matter for yours. We're combining what we found with your industry, location, and size to calculate what these problems are actually costing you—and which fixes will move the needle most.",
  },
]

// NOTE: Previously we mapped backend phases to steps, but this caused
// jarring jumps in the UI. Now we use timing-based progress only,
// with backend polling just checking for completion status.

interface ProgressViewProps {
  requestId: string
  domain: string
  onClose: () => void
}

type ViewState = 'running' | 'ready' | 'error'

export function ProgressView({
  requestId,
  domain,
  onClose,
}: ProgressViewProps) {
  const [viewState, setViewState] = useState<ViewState>('running')
  const [currentStep, setCurrentStep] = useState(0)
  const [landingUrl, setLandingUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Poll status endpoint
  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/self-serve/status/${requestId}`)
      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.detail || 'Something went wrong.')
        setViewState('error')
        return false // Stop polling
      }

      // NOTE: We intentionally do NOT update step based on phase.
      // The visual progress uses timing-based auto-advance for smoother UX.
      // Backend polling only checks for terminal states (completion/error).

      // Check for terminal states
      if (data.status === 'ready_for_lp') {
        setLandingUrl(data.landing_url)
        setViewState('ready')
        return false // Stop polling
      }

      if (data.status === 'failed') {
        setErrorMessage(
          data.error_message || "We couldn't complete the analysis."
        )
        setViewState('error')
        return false // Stop polling
      }

      if (data.status === 'expired') {
        setErrorMessage(
          'This request has expired. Please start a new analysis.'
        )
        setViewState('error')
        return false // Stop polling
      }

      return true // Continue polling
    } catch (err) {
      console.error('Poll error:', err)
      // Don't stop polling on network errors, just retry
      return true
    }
  }, [requestId])

  // Start polling
  useEffect(() => {
    let isActive = true
    let pollInterval: NodeJS.Timeout

    const startPolling = async () => {
      // Initial poll
      const shouldContinue = await pollStatus()

      if (shouldContinue && isActive) {
        // Poll every 3 seconds
        pollInterval = setInterval(async () => {
          if (!isActive) return
          const cont = await pollStatus()
          if (!cont && pollInterval) {
            clearInterval(pollInterval)
          }
        }, 3000)
      }
    }

    startPolling()

    return () => {
      isActive = false
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [pollStatus])

  // Auto-advance steps for visual feedback while waiting
  useEffect(() => {
    if (viewState !== 'running') return

    // Advance through steps every 15 seconds for visual feedback
    // (actual progress is driven by backend polling)
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        // Don't go past step 4 (Impact)
        if (prev >= 4) return prev
        return prev + 1
      })
    }, 20000)

    return () => clearInterval(timer)
  }, [viewState])

  // Handle redirect when ready
  useEffect(() => {
    if (viewState !== 'ready' || !landingUrl) return

    // Show "ready" state briefly, then redirect
    // Note: We do NOT change viewState to avoid effect re-run which would clear the timer
    const redirectTimer = setTimeout(() => {
      window.location.href = landingUrl
    }, 1500)

    return () => {
      clearTimeout(redirectTimer)
    }
  }, [viewState, landingUrl])

  // Running state
  if (viewState === 'running') {
    return (
      <div className="fixed inset-0 z-[2000] bg-[#232323] flex flex-col">
        <div className="p-8">
          <Logo size="medium" darkMode />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full px-8">
          <h1 className="text-white text-[32px] md:text-[48px] font-thin mb-12 text-center">
            Analyzing {domain}...
          </h1>

          <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-0">
            {/* Left: Progress checklist */}
            <div className="flex flex-col gap-4 md:mr-12">
              {PROGRESS_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  {i < currentStep ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : i === currentStep ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/40" />
                  )}
                  <span
                    className={
                      i < currentStep
                        ? 'text-white/60'
                        : i === currentStep
                          ? 'text-white'
                          : 'text-white/40'
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Right: Step explanation */}
            <div className="bg-white/5 rounded-xl p-6 max-w-md">
              <h3 className="text-white text-[20px] font-medium mb-2">
                {PROGRESS_STEPS[currentStep].title}
              </h3>
              <p className="text-white/70 text-[15px] leading-relaxed">
                {PROGRESS_STEPS[currentStep].description}
              </p>
            </div>
          </div>

          <p className="text-white/60 text-[16px] mt-12 text-center">
            This usually takes about 90 seconds.
          </p>
          <p className="text-white/40 text-[14px] mt-4 text-center">
            We&apos;ll email you when it&apos;s ready.
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-white/40 hover:text-white/60 text-sm"
        >
          Close (analysis will continue)
        </button>
      </div>
    )
  }

  // Ready state - show success and redirect
  if (viewState === 'ready') {
    return (
      <div className="fixed inset-0 z-[2000] bg-[#232323] flex flex-col">
        <div className="p-8">
          <Logo size="medium" darkMode />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center px-8">
          {/* Animated checkmark */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
              <div className="w-16 h-16 rounded-full bg-green-500/40 flex items-center justify-center animate-[scale-in_0.5s_ease-out_0.1s_both]">
                <Check
                  className="w-10 h-10 text-green-500 animate-[scale-in_0.3s_ease-out_0.3s_both]"
                  strokeWidth={3}
                />
              </div>
            </div>
          </div>

          <h1 className="text-white text-[32px] md:text-[48px] font-thin mb-4 animate-[fade-in_0.5s_ease-out_0.4s_both]">
            Analysis complete
          </h1>

          <p className="text-white/60 text-[18px] animate-[fade-in_0.5s_ease-out_0.6s_both]">
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to your results...
            </span>
          </p>
        </div>

        <style jsx>{`
          @keyframes scale-in {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    )
  }

  // Error state
  return (
    <div className="fixed inset-0 z-[2000] bg-[#232323] flex flex-col">
      <div className="p-8">
        <Logo size="medium" darkMode />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center px-8">
        <h1 className="text-white text-[32px] md:text-[48px] font-thin mb-6">
          Something went wrong
        </h1>

        <p className="text-white/60 text-[18px] mb-8">
          {errorMessage || "We couldn't complete the analysis."}
          <br />
          <span className="text-[16px]">
            Please try again or contact{' '}
            <a
              href="mailto:support@anthrasite.io"
              className="text-[#0066FF] hover:underline"
            >
              support@anthrasite.io
            </a>
          </span>
        </p>

        <button
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] text-white text-[18px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] transition-all duration-200"
        >
          <span>Try Again</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
