'use client'

import { useState } from 'react'
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
      {/* Header - Logo + Tagline */}
      <header className="w-full px-6 pt-6 pb-4">
        <div className="flex flex-col">
          <Logo size="medium" darkMode />
          <div className="tagline text-[10px] md:text-[13px] font-light text-white/70 mt-1 flex justify-between max-w-[140px]">
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
      </header>

      {/* Main Content Area */}
      <div className="px-6 pb-8 space-y-6">
        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-white text-3xl md:text-4xl lg:text-5xl font-light leading-tight"
        >
          Is your website working for you?
        </h1>

        {/* Desktop Screenshot - Full width, inline */}
        {!imageError && (
          <div className="w-full rounded-lg overflow-hidden shadow-lg">
            <img
              src={desktopScreenshotUrl}
              alt={`Screenshot of ${company} website`}
              className={`w-full h-auto transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Offer + Trust */}
        <p className="text-white/70 text-base md:text-lg leading-relaxed">
          We analyzed <span className="text-white font-medium">{company}</span>{' '}
          and found{' '}
          <span className="text-white font-medium">{issueCount} issues</span>{' '}
          using the same tools Google uses.
        </p>

        {/* Hook - Pain Statement */}
        <div className="space-y-1">
          <p className="text-white/50 text-sm uppercase tracking-wider">
            Most impactful:
          </p>
          <p className="text-white text-lg md:text-xl font-medium leading-snug">
            {hookOpportunity.painStatement}
          </p>
        </div>

        {/* Impact */}
        <p className="text-white/70 text-base md:text-lg">
          This could be costing you up to{' '}
          <span className="text-white font-semibold">{impactHigh}/month</span>.
        </p>
      </div>
    </section>
  )
}
