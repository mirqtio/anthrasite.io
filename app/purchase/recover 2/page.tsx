'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/analytics-client'

type RecoveryState =
  | { status: 'loading' }
  | { status: 'success'; sessionUrl: string }
  | { status: 'error'; message: string }
  | { status: 'invalid' }

export default function RecoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const utm = searchParams.get('utm')
  const sessionId = searchParams.get('session')

  const [state, setState] = useState<RecoveryState>({ status: 'loading' })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!utm) {
      setState({ status: 'invalid' })
      return
    }

    recoverSession()
  }, [utm, sessionId])

  const recoverSession = async () => {
    if (!utm) return

    try {
      setState({ status: 'loading' })

      // Track recovery attempt
      trackEvent('checkout_recovery_page_view', {
        utm_token: utm,
        has_session_id: !!sessionId,
        retry_count: retryCount,
      })

      const response = await fetch('/api/stripe/recover-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utm,
          sessionId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to recover session')
      }

      const data = await response.json()

      if (data.success && data.sessionUrl) {
        setState({ status: 'success', sessionUrl: data.sessionUrl })

        // Track successful recovery
        trackEvent('checkout_recovery_success', {
          utm_token: utm,
          session_id: data.sessionId,
        })

        // Redirect after short delay to show success state
        setTimeout(() => {
          window.location.href = data.sessionUrl
        }, 1500)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('Recovery error:', error)

      // Track recovery failure
      trackEvent('checkout_recovery_failed', {
        utm_token: utm,
        error: error.message,
        retry_count: retryCount,
      })

      setState({
        status: 'error',
        message: error.message || 'Unable to recover your checkout session',
      })
      setRetryCount((prev) => prev + 1)
    }
  }

  const handleRetry = () => {
    recoverSession()
  }

  const handleStartNew = () => {
    if (utm) {
      router.push(`/purchase?utm=${utm}`)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full p-8">
        {state.status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-ignition-blue animate-spin" />
            <h2 className="text-xl font-semibold text-anthracite-black mb-2">
              Recovering Your Checkout
            </h2>
            <p className="text-anthracite-gray">
              Please wait while we restore your session...
            </p>
          </div>
        )}

        {state.status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-anthracite-black mb-2">
              Session Recovered!
            </h2>
            <p className="text-anthracite-gray mb-4">
              Redirecting you to checkout...
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-ignition-blue animate-[slide_1.5s_ease-in-out]" />
              </div>
            </div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-anthracite-black mb-2">
              Recovery Failed
            </h2>
            <p className="text-anthracite-gray mb-6">{state.message}</p>
            <div className="space-y-3">
              {retryCount < 3 && (
                <Button onClick={handleRetry} variant="primary" fullWidth>
                  Try Again
                </Button>
              )}
              <Button
                onClick={handleStartNew}
                variant={retryCount < 3 ? 'secondary' : 'primary'}
                fullWidth
              >
                Start New Purchase
              </Button>
            </div>
          </div>
        )}

        {state.status === 'invalid' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-anthracite-black mb-2">
              Invalid Recovery Link
            </h2>
            <p className="text-anthracite-gray mb-6">
              This recovery link is invalid or incomplete.
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="primary"
              fullWidth
            >
              Go to Homepage
            </Button>
          </div>
        )}
      </Card>

      <style jsx>{`
        @keyframes slide {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
