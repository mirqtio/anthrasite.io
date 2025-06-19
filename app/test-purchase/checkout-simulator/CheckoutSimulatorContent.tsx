'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export function CheckoutSimulatorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/25',
    cvc: '123',
    name: '',
  })

  const sessionId = searchParams.get('session')
  const businessId = searchParams.get('business')

  useEffect(() => {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      router.push('/')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to success page
    router.push(`/purchase/success?session_id=${sessionId}&dev=true`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-carbon text-white">
      <div className="max-w-[600px] mx-auto py-12 px-6">
        <div className="carbon-container overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-white/10">
            <h1 className="text-[32px] font-light mb-2">Checkout Simulator</h1>
            <p className="text-[17px] opacity-60">Development Mode Only</p>
          </div>

          {/* Warning Banner */}
          <div className="bg-accent/10 border-b border-accent/20 p-6">
            <p className="text-[17px] text-accent">
              <strong>Test Mode:</strong> This is a simulated checkout for
              development. No real payment will be processed.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="test@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Cardholder name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber" className="form-label">
                Card number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                required
                className="form-input opacity-60"
                readOnly
              />
              <p className="text-[15px] opacity-40 mt-2">
                Test card number (read-only)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="expiry" className="form-label">
                  Expiry
                </label>
                <input
                  type="text"
                  id="expiry"
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  required
                  className="form-input opacity-60"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvc" className="form-label">
                  CVC
                </label>
                <input
                  type="text"
                  id="cvc"
                  name="cvc"
                  value={formData.cvc}
                  onChange={handleInputChange}
                  required
                  className="form-input opacity-60"
                  readOnly
                />
              </div>
            </div>

            {/* Price Display */}
            <div className="border-t border-white/10 pt-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[24px] font-light">Total</span>
                <span className="text-[32px] font-light text-accent">
                  $99.00
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="cta-primary button-full"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center opacity-60">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Complete Purchase'
              )}
            </button>

            {/* Cancel Link */}
            <div className="text-center mt-6">
              <Link
                href="/purchase/cancel"
                className="text-[17px] opacity-60 hover:opacity-100 underline transition-opacity duration-200"
              >
                Cancel and return to merchant
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-white/5 px-8 py-6">
            <div className="flex items-center justify-between text-[15px] opacity-40">
              <span>Session ID: {sessionId?.slice(0, 20)}...</span>
              <span>Powered by Dev Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
