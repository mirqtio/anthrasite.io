'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { SecureCheckout } from '@/components/landing/SecureCheckout'
import { trackEvent } from '@/lib/analytics/analytics-client'
import type { HookOpportunity } from '@/lib/landing/types'

/** Referral discount info from localStorage */
interface ReferralDiscount {
  code: string
  discountDisplay: string
  discountedPrice: number
}

interface HeroSectionProps {
  company: string
  score: number
  issueCount: number
  impactHigh: string
  hookOpportunity: HookOpportunity
  desktopScreenshotUrl: string
  price: number
  isLoading: boolean
  onCheckout: () => void
  /** Optional referral discount info */
  referralDiscount?: ReferralDiscount | null
}

export function HeroSection({
  company,
  score,
  issueCount,
  impactHigh,
  hookOpportunity,
  desktopScreenshotUrl,
  price,
  isLoading,
  onCheckout,
  referralDiscount,
}: HeroSectionProps) {
  // Determine display price (discounted or original)
  const displayPrice = referralDiscount?.discountedPrice ?? price
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <section
      className="relative bg-[#232323] flex flex-col"
      aria-labelledby="hero-heading"
    >
      {/* Header - Logo + Tagline - 96px gap to hero content below */}
      <header className="pt-4 min-[800px]:pt-5 pb-24">
        <div className="logo-container w-fit">
          <Link href="/" className="flex flex-col">
            <Logo size="medium" darkMode className="logo-mobile" />
            <div className="tagline text-[10px] min-[800px]:text-[13px] font-light opacity-70 mt-1 flex justify-between">
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
          </Link>
        </div>
      </header>

      {/* Main Content Area - NO external padding, parent controls section spacing */}
      <div className="flex flex-col gap-10 min-[800px]:gap-24">
        {/* Row 1: Screenshot (1/3 left) + H1 (2/3 right) */}
        <div className="flex flex-col gap-10 min-[800px]:grid min-[800px]:grid-cols-[1fr_2fr] min-[800px]:gap-12 min-[800px]:items-center">
          {/* Screenshot - Mobile Only (shows first on mobile) */}
          {!imageError && (
            <div className="min-[800px]:hidden max-w-[400px] mx-auto rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={desktopScreenshotUrl}
                alt={`Screenshot of ${company} website`}
                width={0}
                height={0}
                sizes="400px"
                className={`w-full h-auto transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                unoptimized
              />
            </div>
          )}

          {/* Screenshot - Desktop Only (1/3 left) */}
          {!imageError && (
            <div className="hidden min-[800px]:flex min-[800px]:justify-center min-[800px]:items-center">
              <div className="max-w-[400px] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={desktopScreenshotUrl}
                  alt={`Screenshot of ${company} website`}
                  width={0}
                  height={0}
                  sizes="400px"
                  className={`w-full h-auto transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* H1 (2/3 right on desktop, below screenshot on mobile) */}
          <h1
            id="hero-heading"
            className="text-white text-[48px] min-[800px]:text-[64px] font-thin leading-[1.1]"
          >
            Is your website working for you?
          </h1>
        </div>

        {/* Row 2: Two paragraphs side-by-side (50/50) on desktop */}
        <div className="flex flex-col gap-8 min-[800px]:grid min-[800px]:grid-cols-2 min-[800px]:gap-12">
          {/* Analysis Summary */}
          <p className="text-white/60 text-[18px] min-[800px]:text-[20px] leading-[1.6] tracking-[0.02em]">
            We assessed{' '}
            <span className="text-white font-semibold">{company}&apos;s</span>{' '}
            website using tools that top companies like Google use. Your site
            scores{' '}
            <span className="text-white font-semibold">{score} / 100</span> and
            has{' '}
            <span className="text-white font-semibold">
              {issueCount} priority issues
            </span>
            . These could be costing you up to{' '}
            <span className="text-white font-semibold">{impactHigh}/month</span>
            .
          </p>

          {/* CTA Copy */}
          <p className="text-white/60 text-[18px] min-[800px]:text-[20px] leading-[1.6] tracking-[0.02em]">
            Learn what to fix and what it&apos;s worth. Get the full report
            detailing all {issueCount} prioritized issues now.{' '}
            <span className="text-white font-semibold">
              No risk money-back guarantee.
            </span>
          </p>
        </div>

        {/* CTA Button - Hidden on mobile (sticky CTA handles it) */}
        <div className="hidden min-[800px]:flex flex-col items-center gap-3">
          <button
            onClick={() => {
              trackEvent('cta_click', {
                location: 'hero',
                referral_code: referralDiscount?.code,
              })
              onCheckout()
            }}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white text-[18px] min-[800px]:text-[20px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#232323] disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <span>Get Your Report – ${displayPrice}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <SecureCheckout darkMode />
        </div>
      </div>
    </section>
  )
}
