'use client'

import { Mail, Download, Share2 } from 'lucide-react'

interface DeliveryBlockProps {
  purchaseEmail: string | null
}

/**
 * Shows how the report will be delivered.
 * Emphasizes email delivery with secure PDF link.
 */
export function DeliveryBlock({ purchaseEmail }: DeliveryBlockProps) {
  const emailDisplay = purchaseEmail || 'your email address'

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 min-[800px]:p-8">
      <h3 className="text-[18px] min-[800px]:text-[20px] font-semibold tracking-[0.02em] mb-6">
        How you&apos;ll receive your report
      </h3>

      <div className="space-y-4">
        {/* Email Delivery */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0066FF]/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#0066FF]" />
          </div>
          <div>
            <p className="text-[16px] min-[800px]:text-[18px] font-medium tracking-[0.02em]">
              Delivered by email
            </p>
            <p className="text-white/60 text-[14px] min-[800px]:text-[16px] tracking-[0.02em]">
              We&apos;ll send your report to{' '}
              <span className="text-white">{emailDisplay}</span>
            </p>
          </div>
        </div>

        {/* Secure PDF Link */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <p className="text-[16px] min-[800px]:text-[18px] font-medium tracking-[0.02em]">
              Secure PDF link
            </p>
            <p className="text-white/60 text-[14px] min-[800px]:text-[16px] tracking-[0.02em]">
              No login required — just click to download
            </p>
          </div>
        </div>

        {/* Shareable */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <p className="text-[16px] min-[800px]:text-[18px] font-medium tracking-[0.02em]">
              Share with your team
            </p>
            <p className="text-white/60 text-[14px] min-[800px]:text-[16px] tracking-[0.02em]">
              Download, forward, or share the report as needed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
