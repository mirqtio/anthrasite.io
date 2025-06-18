'use client'

import React from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { trackEvent } from '@/lib/analytics/analytics-client'
import Link from 'next/link'

interface StripeErrorFallbackProps {
  resetErrorBoundary: () => void
  error: Error
}

function StripeErrorFallback({ resetErrorBoundary, error }: StripeErrorFallbackProps) {
  React.useEffect(() => {
    // Track Stripe errors
    trackEvent('stripe_error', {
      error: error.message,
      type: 'payment_error_boundary',
    })
  }, [error])

  // Determine if it's a specific Stripe error
  const isNetworkError = error.message.toLowerCase().includes('network')
  const isRateLimitError = error.message.toLowerCase().includes('rate limit')
  
  return (
    <div className="py-12">
      <Card className="max-w-md mx-auto p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-12 w-12 text-ignition-blue"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-anthracite-black mb-2">
          Payment System Unavailable
        </h3>
        
        <p className="text-anthracite-gray mb-6">
          {isNetworkError
            ? "We're having trouble connecting to our payment system. Please check your internet connection and try again."
            : isRateLimitError
            ? "Too many payment attempts. Please wait a moment before trying again."
            : "We're unable to process payments at the moment. Please try again in a few minutes."}
        </p>
        
        <div className="space-y-3">
          <Button onClick={resetErrorBoundary} variant="primary" fullWidth>
            Try Again
          </Button>
          
          <Link href="/contact" className="w-full">
            <Button 
              variant="secondary"
              fullWidth
            >
              Contact Support
            </Button>
          </Link>
        </div>
        
        <p className="mt-4 text-sm text-anthracite-gray">
          Your purchase link remains valid for 24 hours.
        </p>
      </Card>
    </div>
  )
}

interface StripeErrorBoundaryProps {
  children: React.ReactNode
}

// Custom Error Boundary for Stripe errors
class StripeErrorBoundaryInner extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Stripe Error:', error, errorInfo)
    
    // Track error in analytics
    if (typeof window !== 'undefined') {
      trackEvent('stripe_error', {
        error_message: error.message,
        error_stack: error.stack,
        context: {
          url: window.location.href,
          component: 'stripe_error_boundary',
        },
      })
      
      // Log to monitoring
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: {
            component: 'stripe_error_boundary',
          },
        })
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <StripeErrorFallback
          resetErrorBoundary={this.resetErrorBoundary}
          error={this.state.error}
        />
      )
    }

    return this.props.children
  }
}

export function StripeErrorBoundary({ children }: StripeErrorBoundaryProps) {
  return <StripeErrorBoundaryInner>{children}</StripeErrorBoundaryInner>
}