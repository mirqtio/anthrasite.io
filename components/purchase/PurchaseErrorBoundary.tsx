'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/Button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class PurchaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Purchase error boundary caught:', error, errorInfo)
    
    // In production, log to error tracking service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-4">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-6">
              We encountered an error while processing your request. Please try again or contact support if the issue persists.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = 'mailto:support@anthrasite.io'}
                variant="outline"
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}