'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getMockBusinesses,
  getMockUTMTokens,
} from '@/lib/purchase/purchase-service-dev'

export default function TestPurchasePage() {
  const [isDevMode, setIsDevMode] = useState(false)
  const [mockBusinesses, setMockBusinesses] = useState<any[]>([])
  const [mockTokens, setMockTokens] = useState<any[]>([])

  useEffect(() => {
    // Check if we're in development or test mode
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    setIsDevMode(isDev)

    if (isDev) {
      // Load mock data
      setMockBusinesses(getMockBusinesses())
      setMockTokens(getMockUTMTokens())
    }
  }, [])

  if (!isDevMode) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              This page is only available in development or test mode.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-ignition-blue hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-anthracite-black mb-2">
              Purchase Flow Test Page
            </h1>
            <p className="text-gray-600 mb-6">
              This page allows you to test the purchase flow without backend
              dependencies.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> To use this feature, set{' '}
                <code className="bg-yellow-100 px-1 py-0.5 rounded">
                  NEXT_PUBLIC_USE_MOCK_PURCHASE=true
                </code>{' '}
                in your{' '}
                <code className="bg-yellow-100 px-1 py-0.5 rounded">
                  .env.local
                </code>{' '}
                file.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mock UTM Tokens */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Available Test UTM Tokens
              </h2>
              <div className="space-y-3">
                {mockTokens.map((token) => (
                  <div
                    key={token.token}
                    className={`border rounded-lg p-4 ${
                      token.used
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-ignition-blue bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">
                          {token.businessName}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          Token:{' '}
                          <code className="bg-gray-100 px-1 py-0.5 rounded">
                            {token.token}
                          </code>
                        </p>
                        <p className="text-xs">
                          Status:{' '}
                          <span
                            className={
                              token.used
                                ? 'text-gray-500'
                                : 'text-green-600 font-medium'
                            }
                          >
                            {token.used ? 'Used' : 'Valid'}
                          </span>
                        </p>
                      </div>
                      <Link
                        href={`/purchase?utm=${token.token}`}
                        className={`ml-4 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          token.used
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-ignition-blue text-white hover:bg-blue-700'
                        }`}
                        onClick={(e) => {
                          if (token.used) {
                            e.preventDefault()
                          }
                        }}
                      >
                        Test Purchase
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Businesses */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Mock Businesses</h2>
              <div className="space-y-3">
                {mockBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-medium mb-1">{business.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {business.domain}
                    </p>
                    <p className="text-xs text-gray-500">{business.email}</p>
                    {business.reportData?.scores && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          Performance: {business.reportData.scores.performance}%
                        </div>
                        <div>SEO: {business.reportData.scores.seo}%</div>
                        <div>
                          Security: {business.reportData.scores.security}%
                        </div>
                        <div>
                          A11y: {business.reportData.scores.accessibility}%
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Direct Links */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Test Links</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/purchase?utm=dev-utm-valid"
                className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="font-medium text-green-800 mb-1">
                  Valid Purchase Flow
                </h3>
                <p className="text-sm text-green-600">
                  Test with a valid UTM token
                </p>
              </Link>

              <Link
                href="/purchase?utm=dev-utm-used"
                className="block p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <h3 className="font-medium text-yellow-800 mb-1">
                  Used Token Flow
                </h3>
                <p className="text-sm text-yellow-600">
                  Test with an already used token
                </p>
              </Link>

              <Link
                href="/purchase?utm=invalid-token"
                className="block p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <h3 className="font-medium text-red-800 mb-1">
                  Invalid Token Flow
                </h3>
                <p className="text-sm text-red-600">
                  Test with an invalid token
                </p>
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                Set{' '}
                <code className="bg-white px-1 py-0.5 rounded">
                  NEXT_PUBLIC_USE_MOCK_PURCHASE=true
                </code>{' '}
                in your{' '}
                <code className="bg-white px-1 py-0.5 rounded">.env.local</code>{' '}
                file
              </li>
              <li>Restart your development server</li>
              <li>
                Click on any of the test links above to simulate different
                purchase scenarios
              </li>
              <li>
                The checkout will redirect to a simulated checkout page instead
                of Stripe
              </li>
              <li>
                You can test the full UI flow without any backend dependencies
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
