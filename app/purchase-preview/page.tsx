'use client'

import { StripeErrorBoundary } from '@/components/purchase/StripeErrorBoundary'
import { Logo } from '@/components/Logo'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function PurchasePreviewPage() {
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock business data for preview
  const mockBusiness = {
    id: 'preview-business-123',
    name: 'Acme Corporation',
    domain: 'acme.example.com',
    email: 'contact@acme.example.com',
  }

  const mockReportPreview = {
    domain: mockBusiness.domain,
    metrics: {
      performanceScore: 75,
      visualScore: 68,
      seoScore: 82,
      trustScore: 90,
      socialScore: 45,
      mobileScore: 88,
    },
    improvements: [
      'Optimize image loading for 40% faster page speed',
      'Fix 12 critical SEO issues affecting search rankings',
      'Implement security headers to protect user data',
    ],
    estimatedValue: '$2,500-$5,000/month',
  }

  // Mock checkout handler
  const handleCheckout = async () => {
    setIsProcessing(true)

    try {
      // In preview, just simulate a checkout
      console.log('Preview checkout triggered', {
        business: mockBusiness,
        utm: 'preview-test-utm',
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, this would redirect to Stripe
      alert('Checkout would redirect to Stripe here')
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="min-h-screen bg-carbon text-white flex flex-col">
      {/* Header */}
      <header className="py-6 px-10 border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-[1200px] mx-auto">
          <div className="inline-block">
            <Logo size="medium" className="logo-mobile h-8 w-auto" />
            <div
              className="text-[10px] md:text-[13px] font-light opacity-70 mt-1 flex justify-between"
              style={{ width: '100%' }}
            >
              <span>V</span>
              <span>A</span>
              <span>L</span>
              <span>U</span>
              <span>E</span>
              <span>,</span>
              <span>&nbsp;</span>
              <span>C</span>
              <span>R</span>
              <span>Y</span>
              <span>S</span>
              <span>T</span>
              <span>A</span>
              <span>L</span>
              <span>L</span>
              <span>I</span>
              <span>Z</span>
              <span>E</span>
              <span>D</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-6 px-5">
        <StripeErrorBoundary>
          <motion.div
            className="max-w-[640px] w-full bg-white/[0.02] border border-white/5 rounded-xl px-12 py-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="text-header text-center mb-8">
              Your website audit is complete
            </h1>

            {/* CTA Button with Pulsing Rings - EXACT COPY from OrganicHomepage */}
            <div className="relative inline-block -mt-[200px] md:-mt-[80px]">
              <div className="pressure-visual">
                <div
                  className="pressure-ring"
                  style={{ '--scale': 1 } as React.CSSProperties}
                ></div>
                <div
                  className="pressure-ring"
                  style={
                    {
                      '--scale': 0.8,
                      animationDelay: '0.3s',
                    } as React.CSSProperties
                  }
                ></div>
                <div
                  className="pressure-ring"
                  style={
                    {
                      '--scale': 0.6,
                      animationDelay: '0.6s',
                    } as React.CSSProperties
                  }
                ></div>
                <div className="pressure-center">
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="cta-primary"
                  >
                    {isProcessing ? 'Processing...' : 'Get Full Report · $399'}
                  </button>
                </div>
              </div>
            </div>

            {/* Trust badges - positioned close to CTA */}
            <div className="-mt-[170px] mb-[80px]">
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm font-light opacity-60">Secure checkout</p>
                <svg
                  className="h-4 w-auto opacity-60"
                  viewBox="0 0 60 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M59.64 9.672c0-3.528-1.656-6.552-6.24-6.552-4.608 0-7.44 3.048-7.44 7.008 0 4.128 2.952 6.984 7.8 6.984 2.28 0 4.008-.528 5.28-1.2v-3.528c-1.272.624-2.736 1.032-4.488 1.032-1.776 0-3.336-.624-3.528-2.784h8.568c0-.216.048-1.08.048-1.96zm-8.64-1.2c0-2.064 1.272-2.928 2.424-2.928 1.104 0 2.304.864 2.304 2.928h-4.728zM42.336 3.12c-1.968 0-3.216.936-3.888 1.584l-.264-1.248h-4.2v19.2l4.8-.996v-5.808c.696.504 1.728 1.248 3.432 1.248 3.456 0 6.6-2.784 6.6-7.056-.024-4.44-3.168-6.924-6.48-6.924zm-1.128 10.368c-1.128 0-1.8-.384-2.28-.864V7.8c.528-.552 1.224-.888 2.28-.888 1.752 0 2.976 1.968 2.976 3.744 0 1.92-1.224 3.832-2.976 3.832zM28.704 2.28l-4.824 1.008v10.464c0 3.048 2.28 5.304 5.304 5.304 1.68 0 2.904-.312 3.576-.672v-3.576c-.648.264-3.84 1.2-3.84-1.8V7.176h3.84V3.456h-3.84l-.216-1.176zM19.2 7.32c0-.672.552-.912 1.464-.912 1.296 0 2.952.384 4.248 1.08V3.48c-1.416-.552-2.832-.792-4.248-.792-3.48 0-5.784 1.824-5.784 4.872 0 4.752 6.528 3.984 6.528 6.024 0 .792-.696 1.056-1.656 1.056-1.44 0-3.264-.6-4.704-1.392v4.08c1.584.672 3.192.984 4.704.984 3.552 0 6-1.752 6-4.92-.024-5.112-6.552-4.224-6.552-6.072zM5.136 16.896c1.44 0 2.592-.072 3.936-.432V20.4c-1.368.6-2.76.768-4.152.768C1.776 21.168 0 19.344 0 15.648c0-3.6 1.968-5.736 5.28-5.736 1.32 0 2.64.24 3.672.696l-.936 3.936c-.84-.336-1.704-.528-2.472-.528-1.464 0-2.112.792-2.112 1.848-.024.984.576 1.032 1.704 1.032z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm font-light opacity-60">·</span>
                <p className="text-sm font-light opacity-60">
                  Instant download
                </p>
              </div>
            </div>

            <p className="text-[20px] md:text-[24px] mb-3">
              We identified opportunities worth
            </p>

            <div className="text-[48px] font-thin text-green-500 mb-2">
              {mockReportPreview.estimatedValue}
            </div>
            <p className="text-[20px] md:text-[24px] mb-10">
              in revenue improvement
            </p>

            {/* Score Display - 2x3 Grid */}
            <div className="grid grid-cols-3 gap-x-12 gap-y-8 max-w-[500px] mx-auto">
              <div className="text-center">
                <div
                  className={`text-[48px] font-thin leading-none mb-2 ${getScoreColor(mockReportPreview.metrics.performanceScore)}`}
                >
                  {mockReportPreview.metrics.performanceScore}
                </div>
                <div className="text-[20px] md:text-[24px]">Performance</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-[48px] font-thin leading-none mb-2 ${getScoreColor(mockReportPreview.metrics.visualScore)}`}
                >
                  {mockReportPreview.metrics.visualScore}
                </div>
                <div className="text-[20px] md:text-[24px]">Visual</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-[48px] font-thin leading-none mb-2 ${getScoreColor(mockReportPreview.metrics.seoScore)}`}
                >
                  {mockReportPreview.metrics.seoScore}
                </div>
                <div className="text-[20px] md:text-[24px]">SEO</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-[48px] font-thin leading-none mb-2 ${getScoreColor(mockReportPreview.metrics.trustScore)}`}
                >
                  {mockReportPreview.metrics.trustScore}
                </div>
                <div className="text-[20px] md:text-[24px]">Trust</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-[48px] font-thin leading-none mb-2 ${getScoreColor(mockReportPreview.metrics.socialScore)}`}
                >
                  {mockReportPreview.metrics.socialScore}
                </div>
                <div className="text-[20px] md:text-[24px]">Social/Reviews</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-[48px] font-thin leading-none mb-2 ${getScoreColor(mockReportPreview.metrics.mobileScore)}`}
                >
                  {mockReportPreview.metrics.mobileScore}
                </div>
                <div className="text-[20px] md:text-[24px]">Mobile</div>
              </div>
            </div>
          </motion.div>
        </StripeErrorBoundary>
      </main>
    </div>
  )
}
