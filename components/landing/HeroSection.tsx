'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Logo } from '@/components/Logo'
import type { HookOpportunity } from '@/lib/landing/types'

interface HeroSectionProps {
  company: string
  issueCount: number
  impactHigh: string
  hookOpportunity: HookOpportunity
  desktopScreenshotUrl: string
  price: number
  isLoading: boolean
  onCheckout: () => void
}

export function HeroSection({
  company,
  issueCount,
  impactHigh,
  hookOpportunity,
  desktopScreenshotUrl,
  price,
  isLoading,
  onCheckout,
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <section className="relative bg-[#232323]" aria-labelledby="hero-heading">
      {/* Header - Logo + Tagline */}
      <header className="py-4 min-[800px]:py-5">
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

      {/* Main Content Area */}
      <div className="py-10 min-[800px]:py-14 space-y-10 min-[800px]:space-y-24">
        {/* Row 1: H1 + Screenshot */}
        <div className="min-[800px]:grid min-[800px]:grid-cols-[1fr_auto] min-[800px]:gap-12 min-[800px]:items-center">
          {/* H1 */}
          <h1
            id="hero-heading"
            className="text-white text-[48px] min-[800px]:text-[64px] font-thin leading-[1.1] mb-10 min-[800px]:mb-0"
          >
            Is your website working for you?
          </h1>

          {/* Screenshot - Mobile Only */}
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

          {/* Screenshot - Desktop Only (right 40%, centered) */}
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
        </div>

        {/* Row 2: Two paragraphs side-by-side (50/50) on desktop */}
        <div className="space-y-8 min-[800px]:space-y-0 min-[800px]:grid min-[800px]:grid-cols-2 min-[800px]:gap-12">
          {/* Analysis Summary */}
          <p className="text-white/60 text-[18px] min-[800px]:text-[20px] leading-[1.6] tracking-[0.02em]">
            We analyzed{' '}
            <span className="text-white font-medium">{company}&apos;s</span>{' '}
            website with the same tools Google uses and found{' '}
            <span className="text-white font-medium">{issueCount} issues</span>.
            These could be costing you up to{' '}
            <span className="text-white font-semibold">{impactHigh}/month</span>
            .
          </p>

          {/* CTA Copy */}
          <p className="text-white/60 text-[18px] min-[800px]:text-[20px] leading-[1.6] tracking-[0.02em]">
            Know what to fix and what it&apos;s worth. Get the full report
            detailing all{' '}
            <span className="text-white font-medium">{issueCount}</span>{' '}
            prioritized issues now. No risk money-back guarantee.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={onCheckout}
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
                <span>Get Your Report – ${price}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
