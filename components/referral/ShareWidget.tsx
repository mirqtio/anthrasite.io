'use client'

import { useState } from 'react'
import { Copy, Check, Gift } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/analytics-client'

interface ShareWidgetProps {
  code: string
  discountDisplay: string
}

/**
 * ShareWidget - Displays referral code on success page
 *
 * Shows the code prominently with a copy-to-clipboard button
 * and the shareable link.
 */
export function ShareWidget({ code, discountDisplay }: ShareWidgetProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `https://www.anthrasite.io/?promo=${code}`

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

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      trackEvent('referral_share_copied', { code, method: 'code' })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#0066FF]/20 to-[#0066FF]/5 rounded-2xl border border-[#0066FF]/20">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-6 h-6 text-[#0066FF]" />
        <h2 className="text-[20px] min-[800px]:text-[24px] font-semibold tracking-[0.02em]">
          Share & earn
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-white/80 text-[16px] min-[800px]:text-[18px] tracking-[0.02em] leading-[1.6]">
          Know someone who could use a website audit? Share your code and
          they&apos;ll get {discountDisplay}. When they purchase, you get{' '}
          {discountDisplay} back.
        </p>

        {/* Code display */}
        <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
          <span className="text-[24px] min-[800px]:text-[28px] font-mono font-bold tracking-wider text-white">
            {code}
          </span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
            <span className="text-[14px]">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Share link */}
        <div className="flex flex-col gap-2">
          <p className="text-white/60 text-[14px] tracking-[0.02em]">
            Or share this link:
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
  )
}
