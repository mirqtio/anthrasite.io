'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { getStripe } from '@/lib/stripe/client'
import { trackEvent } from '@/lib/analytics/analytics-client'

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') // Old redirect flow
  const purchaseId = searchParams.get('purchase') // New Payment Element flow
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Handle both old and new flows
    if (!sessionId && !purchaseId) {
      setError('Missing payment information')
      setLoading(false)
      return
    }

    // Track successful redirect to success page
    trackEvent('purchase_success_page_viewed', {
      sessionId: sessionId || undefined,
      purchaseId: purchaseId || undefined,
      flow: purchaseId ? 'payment_element' : 'redirect',
    })

    // Verify the session/purchase
    const verifyPurchase = async () => {
      try {
        if (purchaseId) {
          // New Payment Element flow - purchase already created and verified by webhook
          // Just confirm it exists and is completed
          const response = await fetch(`/api/purchase/${purchaseId}`, {
            method: 'GET',
          })

          if (!response.ok) {
            throw new Error('Purchase not found')
          }

          const data = await response.json()
          if (data.status !== 'completed') {
            throw new Error('Payment not completed')
          }

          setLoading(false)
        } else if (sessionId) {
          // Old redirect flow - verify with Stripe
          const stripe = await getStripe()
          if (!stripe) {
            throw new Error('Failed to load Stripe')
          }

          // Note: In production, you'd want to verify this server-side
          // For now, we'll just track the success
          setLoading(false)
        }
      } catch (err) {
        console.error('Error verifying purchase:', err)
        setError('Failed to verify payment')
        setLoading(false)
      }
    }

    verifyPurchase()
  }, [sessionId, purchaseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-white/60">Verifying your purchase...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <a
            href="/purchase"
            className="inline-flex items-center px-6 py-3 bg-electric-blue text-white rounded-lg font-medium hover:bg-electric-blue/90 transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-center mb-12">
          <Logo />
        </div>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Purchase Successful!</h1>
            <p className="text-xl text-white/80">
              Thank you for your purchase. We're already working on your
              comprehensive website audit.
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-card-darker border border-card-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">What happens next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <span className="text-electric-blue font-bold mr-3">1.</span>
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-white/60 text-sm">
                    Check your inbox for your purchase confirmation and receipt.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-electric-blue font-bold mr-3">2.</span>
                <div>
                  <p className="font-medium">Audit Processing</p>
                  <p className="text-white/60 text-sm">
                    Our systems are analyzing your website. This typically takes
                    24-48 hours.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-electric-blue font-bold mr-3">3.</span>
                <div>
                  <p className="font-medium">Report Delivery</p>
                  <p className="text-white/60 text-sm">
                    You'll receive your comprehensive PDF report via email once
                    complete.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="text-center">
            <p className="text-white/60 mb-4">Have questions? Need help?</p>
            <a
              href="mailto:hello@anthrasite.io"
              className="inline-flex items-center px-6 py-3 bg-card-darker border border-card-border rounded-lg font-medium hover:bg-card-darkest transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
