'use client'

import React from 'react'
import { Iphone14Pro } from 'react-framify'
// import { motion } from 'framer-motion'

interface CleanDraftHeroProps {
  businessName: string
  domain: string
  screenshotUrl?: string | null
  mobileScreenshotUrl?: string | null
  price?: number
  issueCount?: number
}

// Removed framer-motion to resolve persistent layout squishing issues on client load
// Reverted to standard divs with explicit width constraints per ADR-P14

export function CleanDraftHero({
  businessName,
  domain,
  screenshotUrl,
  mobileScreenshotUrl,
  price = 199,
  issueCount = 7,
}: CleanDraftHeroProps) {
  const scrollToCheckout = () => {
    const el = document.getElementById('checkout-target')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
      {/* Background with premium subtle glow */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        {/* Subtle accent glow top-right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full opacity-50" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Mobile Screenshot */}
          <div className="flex justify-center lg:justify-end order-2 lg:order-1">
            <div className="transform scale-90 sm:scale-100 origin-center">
              <Iphone14Pro>
                {mobileScreenshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mobileScreenshotUrl}
                    alt={`${domain} on mobile`}
                    className="w-full h-full object-cover object-top"
                  />
                ) : screenshotUrl ? (
                  // Fallback to desktop screenshot if no mobile
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={screenshotUrl}
                    alt={`${domain} on mobile`}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  // Placeholder
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 p-8 text-center">
                    <span className="text-sm">
                      {domain}
                      <br />
                      Mobile View
                    </span>
                  </div>
                )}
              </Iphone14Pro>
            </div>
          </div>

          {/* Right: Copy */}
          <div
            className="text-left order-1 lg:order-2"
            style={{ width: '100%', minWidth: '300px' }}
          >
            <h1 className="text-display mb-6 text-white leading-[1.1]">
              Your Website
              <br />
              Audit Report
            </h1>

            <p
              className="text-[24px] font-light md:text-[28px] text-gray-400 mb-10 leading-snug"
              style={{ maxWidth: '32rem', minWidth: '300px' }}
            >
              {issueCount} issues ranked by impact.
              <br />
              Each labeled by effort.
              <br />
              <span className="text-white">No fluff.</span>
            </p>

            <button
              onClick={scrollToCheckout}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded text-xl font-medium transition-all shadow-[0_0_40px_-10px_rgba(0,102,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(0,102,255,0.5)] active:scale-[0.98] mb-4 w-full sm:w-auto"
            >
              Download Your Report — ${price}
            </button>

            <p className="text-sm text-gray-500 font-medium tracking-wide">
              Instant delivery. Money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
