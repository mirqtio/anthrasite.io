'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { createContext, useContext, useEffect, useState } from 'react'

// Initialize Stripe client
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
    stripePromise
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