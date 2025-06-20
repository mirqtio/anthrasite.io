import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Check, Download, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/Button'
import { retrieveSessionWithLineItems } from '@/lib/stripe/checkout'
import Link from 'next/link'

interface SuccessPageProps {
  searchParams: {
    session_id?: string
    dev?: string
  }
}

async function SuccessContent({
  sessionId,
  isDev,
}: {
  sessionId: string
  isDev: boolean
}) {
  // In development mode with mock data, create a fake session
  if (isDev && process.env.NODE_ENV === 'development') {
    const mockSession = {
      customer_details: { email: 'test@example.com' },
      metadata: { businessName: 'Example Business' },
    }

    const customerEmail = mockSession.customer_details?.email
    const businessName = mockSession.metadata?.businessName || 'your business'

    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Development Mode Banner */}
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Development Mode:</strong> This is a simulated success
              page
            </p>
          </div>

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
            for {businessName} is being generated.
          </p>

          {/* What's Next */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-medium mb-4">What happens next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    You'll receive an email at <strong>{customerEmail}</strong>{' '}
                    within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    Your report will include a secure download link
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/test-purchase">
              <Button variant="primary" className="w-full">
                Back to Test Page
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <p className="text-sm text-gray-500">Session ID: {sessionId}</p>
          </div>
        </div>
      </main>
    )
  }

  // Production mode - use real Stripe session
  const session = await retrieveSessionWithLineItems(sessionId)

  if (!session) {
    notFound()
  }

  const customerEmail = session.customer_details?.email
  const businessName = session.metadata?.businessName || 'your business'

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
          for {businessName} is being generated.
        </p>

        {/* What's Next */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-medium mb-4">What happens next?</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  You'll receive an email at <strong>{customerEmail}</strong>{' '}
                  within 24 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  Your report will include a secure download link
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
            Questions? Contact us at{' '}
            <a
              href="mailto:support@anthrasite.io"
              className="text-anthracite-blue hover:underline"
            >
              support@anthrasite.io
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id
  const isDev = searchParams.dev === 'true'

  if (!sessionId) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </main>
      }
    >
      <SuccessContent sessionId={sessionId} isDev={isDev} />
    </Suspense>
  )
}
