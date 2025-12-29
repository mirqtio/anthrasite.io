'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/Logo'
import type { HookOpportunity } from '@/lib/landing/types'

interface HeroSectionProps {
  company: string
  issueCount: number
  impactHigh: string
  hookOpportunity: HookOpportunity
  desktopScreenshotUrl: string
}

export function HeroSection({
  company,
  issueCount,
  impactHigh,
  hookOpportunity,
  desktopScreenshotUrl,
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <section className="relative bg-[#232323]" aria-labelledby="hero-heading">
      {/* Header - Logo + Tagline (matches homepage nav layout) */}
      <header className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5">
        <div className="logo-container w-fit">
          <Link href="/" className="flex flex-col">
            <Logo size="medium" darkMode className="logo-mobile" />
            <div className="tagline text-[10px] md:text-[13px] font-light opacity-70 mt-1 flex justify-between">
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
      <div className="py-8 md:py-12">
        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-white text-[48px] md:text-[64px] font-thin leading-[0.9] mb-6 md:mb-8"
        >
          Is your website working for you?
        </h1>

        {/* Desktop Screenshot - Full width, inline */}
        {!imageError && (
          <div className="w-full rounded-lg overflow-hidden shadow-lg mb-8 md:mb-10">
            <Image
              src={desktopScreenshotUrl}
              alt={`Screenshot of ${company} website`}
              width={0}
              height={0}
              sizes="100vw"
              className={`w-full h-auto transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        )}

        {/* Offer + Trust */}
        <p className="text-white/60 text-[18px] md:text-[20px] leading-[1.6] tracking-[0.02em] mb-10">
          We analyzed <span className="text-white font-medium">{company}</span>{' '}
          and found{' '}
          <span className="text-white font-medium">{issueCount} issues</span>{' '}
          using the same tools Google uses.
        </p>

        {/* Hook - Pain Statement */}
        <div className="space-y-6 mb-10">
          <p className="text-white/40 text-[14px] tracking-[0.02em]">
            Most impactful:
          </p>
          <p className="text-white text-[20px] md:text-[24px] font-medium leading-[1.4] tracking-[0.02em]">
            {hookOpportunity.painStatement}
          </p>
        </div>

        {/* Impact */}
        <p className="text-white/60 text-[18px] md:text-[20px] tracking-[0.02em]">
          This could be costing you up to{' '}
          <span className="text-white font-semibold">{impactHigh}/month</span>.
        </p>
      </div>
    </section>
  )
}
