'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button/Button'
import { Card } from '@/components/Card/Card'

interface TestScenario {
  name: string
  description: string
  url: string
  requiresAuth?: boolean
}

export default function TestHarnessPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedUrls, setGeneratedUrls] = useState<any>(null)
  const [error, setError] = useState('')

  // Check if test harness is enabled
  const isEnabled = 
    process.env.NEXT_PUBLIC_ENABLE_TEST_HARNESS === 'true' ||
    process.env.NODE_ENV === 'development'

  useEffect(() => {
    // Check if already authorized via cookie/session
    const storedAuth = sessionStorage.getItem('test-harness-auth')
    if (storedAuth === process.env.NEXT_PUBLIC_TEST_HARNESS_KEY) {
      setIsAuthorized(true)
    }
  }, [])

  const handleAuth = () => {
    if (apiKey === process.env.NEXT_PUBLIC_TEST_HARNESS_KEY) {
      setIsAuthorized(true)
      sessionStorage.setItem('test-harness-auth', apiKey)
      setError('')
    } else {
      setError('Invalid API key')
    }
  }

  const generateTestToken = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/generate-utm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
        },
        body: JSON.stringify({
          businessId: 'test-business-001',
          businessName: 'Test Business',
          domain: 'test.example.com',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate token')
      }

      const data = await response.json()
      setGeneratedUrls(data.urls)
    } catch (err) {
      setError('Failed to generate test token')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Test scenarios for E2E testing
  const testScenarios: TestScenario[] = [
    {
      name: 'Homepage - Organic',
      description: 'Default homepage without UTM parameters',
      url: '/',
    },
    {
      name: 'Homepage - UTM',
      description: 'Homepage with UTM parameters (triggers PurchaseHomepage)',
      url: generatedUrls?.homepage || '/?utm=test',
    },
    {
      name: 'Purchase Page - Direct',
      description: 'Direct purchase page (should redirect to Stripe)',
      url: generatedUrls?.purchase || '/purchase?utm=test',
      requiresAuth: true,
    },
    {
      name: 'Purchase Page - Preview',
      description: 'Purchase page in preview mode (no redirect)',
      url: generatedUrls?.purchaseWithPreview || '/purchase?utm=test&preview=true',
      requiresAuth: true,
    },
    {
      name: 'Analytics Dashboard',
      description: 'Internal analytics dashboard',
      url: '/analytics',
    },
    {
      name: 'About Page',
      description: 'Company about page',
      url: '/about',
    },
    {
      name: 'Legal Page',
      description: 'Privacy and terms page',
      url: '/legal',
    },
    {
      name: 'Link Expired',
      description: 'Expired UTM token page',
      url: '/link-expired',
    },
  ]

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-carbon text-white flex items-center justify-center">
        <Card className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Test Harness Disabled</h1>
          <p className="opacity-70">
            The test harness is not enabled in this environment.
          </p>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-carbon text-white flex items-center justify-center">
        <Card className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Test Harness Authentication</h1>
          <p className="mb-4 opacity-70">
            Enter the test harness API key to continue
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          />
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          <Button onClick={handleAuth} variant="primary" className="w-full">
            Authenticate
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-carbon text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">E2E Test Harness</h1>
            <p className="text-xl opacity-70">
              Test all application flows in production safely
            </p>
          </div>

          {/* Token Generation Section */}
          <Card className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Generate Test Token</h2>
            <p className="mb-4 opacity-70">
              Generate a valid UTM token for testing the purchase flow
            </p>
            <Button 
              onClick={generateTestToken} 
              disabled={loading}
              variant="primary"
            >
              {loading ? 'Generating...' : 'Generate Token'}
            </Button>
            
            {generatedUrls && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <p className="font-semibold mb-2">Generated URLs:</p>
                <div className="space-y-2 text-sm">
                  {Object.entries(generatedUrls).map(([key, url]) => (
                    <div key={key}>
                      <span className="opacity-70">{key}:</span>
                      <a 
                        href={url as string} 
                        className="ml-2 text-blue-400 hover:underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {url as string}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Test Scenarios Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {testScenarios.map((scenario) => (
              <Card key={scenario.name} className="hover:bg-white/5 transition-colors">
                <h3 className="text-xl font-semibold mb-2">{scenario.name}</h3>
                <p className="opacity-70 mb-4">{scenario.description}</p>
                <div className="flex items-center justify-between">
                  <a
                    href={scenario.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Open in new tab →
                  </a>
                  {scenario.requiresAuth && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                      Requires Token
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <Card className="mt-8 bg-white/5">
            <h2 className="text-2xl font-semibold mb-4">Testing Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 opacity-70">
              <li>Generate a test token using the button above</li>
              <li>Use the generated URLs to test different flows</li>
              <li>All test data is isolated and won't affect production</li>
              <li>Test tokens expire after 24 hours</li>
              <li>Use Playwright or similar tools for automated E2E tests</li>
            </ol>
          </Card>

          {/* Environment Info */}
          <Card className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Environment Info</h3>
            <div className="space-y-1 text-sm opacity-70">
              <p>Node Env: {process.env.NODE_ENV}</p>
              <p>Vercel Env: {process.env.VERCEL_ENV || 'N/A'}</p>
              <p>Test Mode: {process.env.ENABLE_TEST_MODE || 'false'}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}