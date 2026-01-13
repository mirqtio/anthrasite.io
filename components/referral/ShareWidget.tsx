'use client'

import { useState } from 'react'
import { Copy, Check, Gift, ChevronDown } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/analytics-client'

interface ShareWidgetProps {
  code: string
  discountDisplay: string
  rewardDisplay?: string // Optional for backwards compatibility; defaults to discountDisplay
  maxRedemptions?: number | null // Optional limit on code uses
}

/**
 * ShareWidget - Displays referral link on success page
 *
 * Accordion-style widget showing title and description by default,
 * with shareable link revealed on expand.
 */
export function ShareWidget({
  code,
  discountDisplay,
  rewardDisplay,
  maxRedemptions,
}: ShareWidgetProps) {
  // Use rewardDisplay if provided, otherwise fall back to discountDisplay
  const effectiveRewardDisplay = rewardDisplay || discountDisplay
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrl = `https://www.anthrasite.io/?promo=${code}`

  const handleToggle = () => {
    const opening = !isOpen
    setIsOpen(opening)
    if (opening) {
      trackEvent('referral_share_expand', { code })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      trackEvent('referral_share_copied', { code, method: 'link' })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div
      className="bg-gradient-to-br from-[#0066FF]/20 to-[#0066FF]/5 rounded-2xl border border-[#0066FF]/20 overflow-hidden"
      data-state={isOpen ? 'open' : 'closed'}
    >
      {/* Accordion trigger - always visible */}
      <button
        onClick={handleToggle}
        className="flex justify-between items-center w-full p-8 bg-transparent text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066FF]"
        aria-expanded={isOpen}
        aria-controls="share-widget-content"
      >
        <div className="flex flex-col gap-4 pr-4">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-[#0066FF]" />
            <h2 className="text-[20px] min-[800px]:text-[24px] font-semibold tracking-[0.02em]">
              Know someone who&apos;d find this useful?
            </h2>
          </div>
          <p className="text-white/80 text-[16px] min-[800px]:text-[18px] tracking-[0.02em] leading-[1.6]">
            Share your code — they&apos;ll get {discountDisplay}, and
            you&apos;ll get {effectiveRewardDisplay} back when they buy.
          </p>
        </div>
        <ChevronDown
          className={`w-6 h-6 flex-shrink-0 text-white/60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Expandable content with grid animation */}
      <div
        id="share-widget-content"
        role="region"
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden">
          <div className="px-8 pb-8">
            {/* Share link */}
            <div className="flex flex-col gap-2">
              <p className="text-white/60 text-[14px] tracking-[0.02em]">
                Just share this link
                {maxRedemptions ? ` — good for ${maxRedemptions} uses` : ''}:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white/80 text-[14px] min-[800px]:text-[16px] font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center p-3 bg-[#0066FF] hover:bg-[#0052CC] rounded-lg transition-colors"
                  aria-label="Copy link"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
