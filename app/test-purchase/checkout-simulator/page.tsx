'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CheckoutSimulatorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = searchParams.get('session')
  const businessId = searchParams.get('business')
  const leadId = searchParams.get('leadId')
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Simulate webhook call
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-signature': 'skip',
        },
        body: JSON.stringify({
          id: `evt_mock_${Date.now()}`,
          type: 'checkout.session.completed',
          data: {
            object: {
              id: session || `cs_mock_${Date.now()}`,
              object: 'checkout.session',
              amount_total: 9900,
              currency: 'usd',
              metadata: {
                businessId: businessId || 'dev-business-1',
                utm: 'dev-utm-valid',
                leadId: leadId,
              },
              customer_details: {
                email: 'test@example.com',
              },
              payment_intent: `pi_mock_${Date.now()}`,
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Webhook failed')
      }

      alert('Payment successful! Webhook triggered.')
      router.push('/purchase/success?session_id=' + session)
    } catch (error) {
      console.error(error)
      alert('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Checkout Simulator</h1>
        <div className="space-y-4 mb-8">
          <p>
            <span className="text-gray-400">Session:</span> {session}
          </p>
          <p>
            <span className="text-gray-400">Business:</span> {businessId}
          </p>
          <p>
            <span className="text-gray-400">Lead ID:</span> {leadId || 'N/A'}
          </p>
          <p>
            <span className="text-gray-400">Amount:</span> $99.00
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Simulate Successful Payment'}
        </button>
      </div>
    </div>
  )
}
