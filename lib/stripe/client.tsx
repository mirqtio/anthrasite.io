'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { createContext, useContext, useEffect, useState } from 'react'

// Stripe promise singleton - initialized lazily on first access
let stripePromise: Promise<Stripe | null> | null = null

// Initialize Stripe client lazily to avoid SSR errors
const getStripePromise = () => {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  // Return existing promise if already initialized
  if (stripePromise) {
    return stripePromise
  }

  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured')
    return Promise.resolve(null)
  }

  stripePromise = loadStripe(key)
  return stripePromise
}

interface StripeContextValue {
  stripe: Stripe | null
  isLoading: boolean
  error: Error | null
}

const StripeContext = createContext<StripeContextValue>({
  stripe: null,
  isLoading: true,
  error: null,
})

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    getStripePromise()
      .then((stripe) => {
        setStripe(stripe)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err)
        setIsLoading(false)
      })
  }, [])

  return (
    <StripeContext.Provider value={{ stripe, isLoading, error }}>
      {children}
    </StripeContext.Provider>
  )
}

export function useStripe() {
  return useContext(StripeContext)
}

// Export getStripe for direct usage outside of React context
export function getStripe() {
  return getStripePromise()
}

export default getStripe
