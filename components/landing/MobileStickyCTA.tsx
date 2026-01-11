'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, ArrowRight, Loader2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/analytics-client'

interface MobileStickyCTAProps {
  price: number
  isLoading: boolean
  onCheckout: () => void
}

export function MobileStickyCTA({
  price,
  isLoading,
  onCheckout,
}: MobileStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Find the main CTA button to observe (not the whole section)
    const ctaButton = document.getElementById('main-cta-button')

    if (!ctaButton) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Show sticky CTA when the main CTA button is NOT in viewport
        setIsVisible(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: '0px', // Hide as soon as button enters viewport
      }
    )

    observerRef.current.observe(ctaButton)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[1100] min-[800px]:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      role="complementary"
      aria-label="Quick checkout"
    >
      <div className="bg-[#141414]/95 border-t border-white/10 px-3 py-2 safe-area-inset-bottom">
        <button
          onClick={() => {
            trackEvent('cta_click', { location: 'mobile_sticky' })
            onCheckout()
          }}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" aria-hidden="true" />
          )}
          <span className="text-[18px] font-semibold tracking-[0.02em]">
            Get Your Report — ${price}
          </span>
          {!isLoading && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
