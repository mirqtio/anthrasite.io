'use client'

import { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutForm } from './CheckoutForm'
import { Skeleton } from '@/components/Skeleton'

// Initialize Stripe client lazily to avoid errors if env var is missing
const getStripePromise = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured')
    return Promise.resolve(null)
  }
  return loadStripe(key)
}

const stripePromise = getStripePromise()

interface PaymentElementWrapperProps {
  businessId: string
  businessName: string
  utm: string
  tier: string
  leadId?: string
}

export function PaymentElementWrapper({
  businessId,
  businessName,
  utm,
  tier,
  leadId,
}: PaymentElementWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Create PaymentIntent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/checkout/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId, utm, tier, leadId }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to initialize payment')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error('Payment initialization error:', err)
        setError(
          err instanceof Error ? err.message : 'Unable to initialize payment'
        )
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [businessId, utm, tier, leadId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full bg-white/10" />
        <Skeleton className="h-12 w-full bg-white/10" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="p-6 bg-accent/10 border border-accent/20 rounded-lg">
        <p className="text-accent">Unable to initialize payment.</p>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#DDFB4C',
            colorBackground: '#232323',
            colorText: '#FFFFFF',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <CheckoutForm businessName={businessName} />
    </Elements>
  )
}
