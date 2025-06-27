'use client'

import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { ReportPreviewData } from '@/lib/purchase/purchase-service'
import { Business } from '@prisma/client'
import { useState } from 'react'

interface SimplifiedPurchasePageProps {
  business: Business
  preview: ReportPreviewData
  utm: string
  onCheckout: () => Promise<void>
}

export function SimplifiedPurchasePage({
  business,
  preview,
  utm,
  onCheckout,
}: SimplifiedPurchasePageProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    setIsProcessing(true)
    try {
      await onCheckout()
    } catch (error) {
      console.error('Checkout error:', error)
      setIsProcessing(false)
    }
  }

  // Determine colors based on scores
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="min-h-screen bg-carbon text-white flex flex-col">
      {/* Header */}
      <header className="py-6 px-10 border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-[1200px] mx-auto text-center">
          <Logo className="h-8 mx-auto mb-2 opacity-95" />
          <div className="text-[13px] font-normal opacity-70 tracking-[0.25em] uppercase">
            VALUE, CRYSTALLIZED
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-10 px-5">
        <motion.div
          className="max-w-[640px] w-full bg-white/[0.02] border border-white/5 rounded-xl px-12 py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-[36px] font-light mb-10 leading-tight">
            Your website audit is complete
          </h1>

          <p className="text-[20px] font-light opacity-70 mb-4">
            We identified opportunities worth
          </p>

          <div className="text-[56px] font-light text-green-500 mb-2">
            {preview.estimatedValue}
          </div>
          <p className="text-base font-light opacity-60 mb-16">
            in revenue improvement
          </p>

          {/* Score Display */}
          <div className="flex justify-center gap-16 mb-16">
            <div className="text-center">
              <div
                className={`text-[40px] font-light leading-none mb-2 ${getScoreColor(preview.metrics.performanceScore)}`}
              >
                {preview.metrics.performanceScore}
              </div>
              <div className="text-sm font-normal opacity-60 uppercase tracking-wider">
                Performance
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-[40px] font-light leading-none mb-2 ${getScoreColor(preview.metrics.seoScore)}`}
              >
                {preview.metrics.seoScore}
              </div>
              <div className="text-sm font-normal opacity-60 uppercase tracking-wider">
                SEO
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-[40px] font-light leading-none mb-2 ${getScoreColor(preview.metrics.securityScore)}`}
              >
                {preview.metrics.securityScore}
              </div>
              <div className="text-sm font-normal opacity-60 uppercase tracking-wider">
                Security
              </div>
            </div>
          </div>

          {/* CTA with Pulse Animation */}
          <div className="relative inline-block">
            {!isProcessing && (
              <>
                <span className="absolute inset-0 rounded-full border border-blue-500/30 animate-[pressureExpand_2s_ease-in-out_infinite]" />
                <span className="absolute inset-0 rounded-full border border-blue-500/30 animate-[pressureExpand_2s_ease-in-out_infinite_0.7s]" />
                <span className="absolute inset-0 rounded-full border border-blue-500/30 animate-[pressureExpand_2s_ease-in-out_infinite_1.4s]" />
              </>
            )}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="relative px-12 py-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full text-[17px] font-medium transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,130,246,0.3)]"
            >
              {isProcessing ? 'Processing...' : 'Get Full Report · $399'}
            </button>
          </div>

          <p className="mt-6 text-sm font-light opacity-60">
            Secure checkout · Instant download
          </p>
        </motion.div>
      </main>

      {/* Help Widget */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 backdrop-blur-sm text-2xl font-light"
        aria-label="Get help"
        onClick={() => {
          // This would integrate with your help system
          console.log('Help widget clicked')
        }}
      >
        ?
      </button>
    </div>
  )
}
