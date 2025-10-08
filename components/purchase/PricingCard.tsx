'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { trackEvent } from '@/lib/analytics/analytics-client'

interface PricingCardProps {
  businessName: string
  utm: string
  onCheckout: () => Promise<void>
}

export function PricingCard({
  businessName,
  utm,
  onCheckout,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setIsLoading(true)
    setError('')

    try {
      await onCheckout()

      // Track successful checkout initiation
      trackEvent('checkout_started', {
        business_name: businessName,
        utm_token: utm,
      })
    } catch (error: any) {
      console.error('Checkout error:', error)
      setError('Unable to start checkout. Please try again.')

      // Track checkout error
      trackEvent('checkout_error', {
        error: error.message || 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-12 md:py-16">
      <div className="px-10 max-w-[1200px] mx-auto">
        {/* Value Proposition Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="carbon-container p-[60px] mb-12 text-center"
        >
          <div>
            {/* Large value display */}
            <div className="text-[60px] font-light text-accent mb-4">
              $2,400
            </div>
            <p className="text-[24px] opacity-70">
              in potential improvements identified
            </p>
          </div>
        </motion.div>

        {/* Report Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mb-12"
        >
          <h2 className="text-[32px] font-light mb-8 text-center">
            What's included
          </h2>
          <div className="space-y-6 max-w-[800px] mx-auto">
            {[
              'Complete 50+ page website audit report',
              'Technical SEO analysis & recommendations',
              'Performance optimization roadmap',
              'Priority-ranked action items with ROI estimates',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.2 + index * 0.05,
                  ease: 'easeOut',
                }}
                className="flex items-start gap-4"
              >
                {/* Custom bullet */}
                <div className="w-[2px] h-8 bg-accent flex-shrink-0 mt-0.5" />
                <span className="text-[20px]">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-accent/10 text-accent text-sm rounded-lg max-w-[600px] mx-auto"
          >
            {error}
          </motion.div>
        )}

        {/* CTA Section with Pulsing Rings */}
        <div className="relative inline-block w-full">
          <div
            className="pressure-visual mx-auto"
            style={{ width: '400px', height: '400px' }}
          >
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
                disabled={isLoading}
                className="cta-primary min-w-[240px]"
                data-testid="checkout-button"
              >
                {isLoading ? (
                  <span className="opacity-60">Processing...</span>
                ) : (
                  'Get Your Report for $399'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Trust text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 text-[17px] opacity-40"
        >
          Secure payment · Instant delivery · 30-day guarantee
        </motion.p>
      </div>
    </section>
  )
}
