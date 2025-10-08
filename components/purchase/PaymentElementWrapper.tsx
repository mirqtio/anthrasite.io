'use client'

import { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutForm } from './CheckoutForm'
import { Skeleton } from '@/components/Skeleton'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface PaymentElementWrapperProps {
  businessId: string
  businessName: string
  utm: string
}

export function PaymentElementWrapper({
  businessId,
  businessName,
  utm,
}: PaymentElementWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [purchaseUid, setPurchaseUid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Create PaymentIntent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/checkout/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId, utm }),
        })

        if (!response.ok) {
          throw new Error('Failed to initialize payment')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
        setPurchaseUid(data.purchaseUid)
      } catch (err) {
        console.error('Payment initialization error:', err)
        setError('Unable to initialize payment. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [businessId, utm])

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

  if (!clientSecret || !purchaseUid) {
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
            colorBackground: '#0A0A0A',
            colorText: '#FFFFFF',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <CheckoutForm purchaseUid={purchaseUid} businessName={businessName} />
    </Elements>
  )
}
