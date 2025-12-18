'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface HeroV2Props {
  issueCount: number
  revenueImpact: number
  mobileScreenshotUrl: string | null
  onCtaClick: () => void
}

export function HeroV2({
  issueCount,
  revenueImpact,
  mobileScreenshotUrl,
  onCtaClick,
}: HeroV2Props) {
  const formattedImpact = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(revenueImpact)

  const [imageError, setImageError] = useState(false)

  return (
    <section className="relative min-h-screen bg-anthracite-black overflow-hidden flex flex-col md:flex-row">
      {/* --- Mobile View (<768px) --- */}
      <div className="md:hidden relative w-full h-full min-h-screen">
        {/* Background Image Layer (z-0) */}
        <div className="absolute inset-0 z-0">
          {mobileScreenshotUrl && !imageError ? (
            <>
              {/* Image Container with Dark Tint */}
              <div className="relative w-[60%] h-full bg-black/15">
                <img
                  src={mobileScreenshotUrl}
                  alt="Website mobile screenshot"
                  className="w-full h-full object-cover object-left opacity-50"
                  onError={() => setImageError(true)}
                />
                {/* Gradient Overlay: Transparent Left -> Solid Carbon at ~50% */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-anthracite-black/50 to-anthracite-black" />
              </div>
            </>
          ) : (
            // Fallback Skeleton
            <div className="w-full h-full bg-[#1a1a1a]" />
          )}
        </div>

        {/* Content Layer (z-10) */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between pt-16 pb-32 px-6">
          {/* Top Content */}
          <div className="flex flex-col items-end text-right space-y-6 mt-12">
            <div className="text-[12px] text-gray-400 max-w-[200px]">
              Anthrasite finds website problems costing you customers.
            </div>

            <h1 className="text-[28px] font-light text-white leading-tight">
              We checked your website.
            </h1>

            <div className="space-y-1">
              <div className="text-[18px] font-medium text-white">
                {issueCount} issues.
              </div>
              <div className="text-[18px] font-medium text-anthracite-blue">
                Up to {formattedImpact}/month.
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[16px] font-normal text-white">
                Ranked by priority.
              </div>
              <div className="text-[16px] font-normal text-white">
                Labeled by effort.
              </div>
            </div>
          </div>

          {/* Fixed Bottom CTA Container */}
          {/* Note: This is visually outside the flow but we use fixed positioning */}
        </div>

        {/* Fixed CTA Container */}
        <div className="fixed bottom-6 left-6 right-6 z-50 flex flex-col gap-2">
          <button
            onClick={onCtaClick}
            className="w-full h-[52px] bg-anthracite-blue text-white font-medium rounded text-[16px] flex items-center justify-center hover:bg-[#0052cc] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-anthracite-blue outline-none"
            aria-label="Download your website audit report for $199"
          >
            Download Your Report — $199
          </button>
          <div className="text-center text-[12px] text-gray-400">
            Instant delivery. Money-back guarantee.
          </div>
        </div>
      </div>

      {/* --- Desktop View (>=768px) --- */}
      <div className="hidden md:flex flex-row w-full h-full min-h-screen">
        {/* Left Column: Image Zone (50%) */}
        <div className="w-1/2 relative h-full">
          {mobileScreenshotUrl && !imageError ? (
            <>
              <img
                src={mobileScreenshotUrl}
                alt="Website mobile screenshot"
                className="w-full h-full object-cover object-left opacity-50"
                onError={() => setImageError(true)}
              />
              {/* Gradient: Transparent Left -> Solid Carbon Right Edge */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-anthracite-black" />
            </>
          ) : (
            <div className="w-full h-full bg-[#1a1a1a]" />
          )}
        </div>

        {/* Right Column: Content Zone (50%) */}
        <div className="w-1/2 flex flex-col h-full bg-anthracite-black pr-12 relative">
          {/* Top Bar Zone */}
          <div className="w-full py-6 px-12">
            <div className="text-[12px] text-gray-400">
              Anthrasite finds website problems costing you customers.
            </div>
          </div>

          {/* Centered Main Content */}
          <div className="flex-1 flex flex-col justify-center px-12">
            <h1 className="text-[40px] font-light text-white leading-tight mb-6">
              We checked your website.
            </h1>

            <div className="space-y-1 mb-4">
              <div className="text-[18px] font-medium text-white">
                {issueCount} issues.
              </div>
              <div className="text-[18px] font-medium text-anthracite-blue">
                Up to {formattedImpact}/month.
              </div>
            </div>

            <div className="space-y-1 mb-8">
              <div className="text-[18px] font-normal text-white">
                Ranked by priority.
              </div>
              <div className="text-[18px] font-normal text-white">
                Labeled by effort.
              </div>
            </div>

            <div className="bg-anthracite-black">
              <button
                onClick={onCtaClick}
                className="h-[52px] px-8 bg-anthracite-blue text-white font-medium rounded text-[16px] flex items-center justify-center hover:bg-[#0052cc] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-anthracite-blue outline-none w-auto inline-block"
                aria-label="Download your website audit report for $199"
              >
                Download Your Report — $199
              </button>
              <div className="text-[12px] text-gray-400 mt-3">
                Instant delivery. Money-back guarantee.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
