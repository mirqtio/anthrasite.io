'use client'

import { useState, FormEvent } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { trackEvent } from '@/lib/analytics/analytics-client'

interface CheckoutFormProps {
  purchaseUid: string
  businessName: string
}

export function CheckoutForm({ purchaseUid, businessName }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/purchase/success?purchase=${purchaseUid}`,
        },
      })

      if (submitError) {
        setError(submitError.message || 'An error occurred')

        // Track payment error
        trackEvent('payment_error', {
          error: submitError.message,
          purchaseUid,
        })
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Payment error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="cta-primary w-full"
        data-testid="payment-submit-button"
      >
        {isProcessing ? (
          <span className="opacity-60">Processing...</span>
        ) : (
          'Complete Purchase'
        )}
      </button>

      <p className="text-center text-sm opacity-40">
        Secure payment · Instant delivery · 30-day guarantee
      </p>
    </form>
  )
}
