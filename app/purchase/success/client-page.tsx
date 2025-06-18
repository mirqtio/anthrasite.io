'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Download, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/Button'
import { trackEvent } from '@/lib/analytics/analytics-client'
import Link from 'next/link'

interface PurchaseData {
  success: boolean
  businessName?: string
  domain?: string
  email?: string
  amount?: number
  reportUrl?: string
  error?: string
}

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Missing session ID')
      setLoading(false)
      return
    }

    const fetchPurchaseData = async () => {
      try {
        const response = await fetch(
          `/api/stripe/recover-session?session_id=${sessionId}`
        )

        if (!response.ok) {
          throw new Error('Unable to verify your purchase')
        }

        const data = await response.json()
        setPurchaseData(data)

        if (data.success) {
          trackEvent('purchase_success_viewed', {
            session_id: sessionId,
            amount: data.amount,
            domain: data.domain,
          })
        } else {
          setError(data.error || 'Purchase verification failed')
        }
      } catch (err) {
        setError('Unable to verify your purchase')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchaseData()
  }, [sessionId])

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Finalizing your purchase...</p>
        </div>
      </main>
    )
  }

  if (error || !purchaseData?.success) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-red-600 text-2xl">!</span>
          </div>

          <h1 className="text-3xl font-semibold mb-4 text-red-600">
            {error === 'Missing session ID'
              ? 'Missing Session ID'
              : 'Verification Error'}
          </h1>

          <p className="text-gray-600 mb-8">
            {error ||
              'Unable to verify your purchase. Please check your email for confirmation details.'}
          </p>

          <Link href="/">
            <Button variant="primary" className="w-full">
              Back to Homepage
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  const { businessName, domain, email, amount, reportUrl } = purchaseData

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-semibold mb-4">Purchase Successful!</h1>

        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your comprehensive website audit report
          {businessName && ` for ${businessName}`} has been generated.
        </p>

        {/* Purchase Details */}
        {(businessName || domain || email || amount) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-medium mb-4">Purchase Details</h2>
            <div className="space-y-2 text-sm">
              {businessName && (
                <p>
                  <span className="text-gray-500">Business:</span>{' '}
                  {businessName}
                </p>
              )}
              {domain && (
                <p>
                  <span className="text-gray-500">Domain:</span> {domain}
                </p>
              )}
              {email && (
                <p>
                  <span className="text-gray-500">Email:</span> {email}
                </p>
              )}
              {amount && (
                <p>
                  <span className="text-gray-500">Amount:</span> $
                  {(amount / 100).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Report Download or Pending */}
        {reportUrl ? (
          <div className="mb-8">
            <a
              href={reportUrl}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4" />
              Download Your Report
            </a>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800 text-sm">
              Your report is being generated. We'll email it to you shortly.
            </p>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-medium mb-4">What Happens Next</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Check your email</strong> - Confirmation and report
                  details sent
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Review your report</strong> - Comprehensive analysis
                  and insights
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Implement recommendations</strong> - Start improving
                  your site
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/">
            <Button variant="primary" className="w-full">
              Back to Homepage
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <p className="text-sm text-gray-500">
            If you have any questions, contact us at{' '}
            <a
              href="mailto:support@anthrasite.io"
              className="text-blue-600 hover:underline"
            >
              support@anthrasite.io
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
