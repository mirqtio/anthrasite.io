'use client'

import React from 'react'
import { MacbookPro } from 'react-framify'

interface CleanDraftEvidenceProps {
  screenshotUrl?: string | null
  impactMonthly?: number
  topPriority?: string
  description?: string
  issueCount?: number
}

export function CleanDraftEvidence({
  screenshotUrl,
  impactMonthly = 4500,
  topPriority = 'Add trust signals to strengthen credibility',
  description = "Visitors evaluating your business didn't see testimonials, reviews, or client logos—the evidence that others have vetted you.",
  issueCount = 7,
}: CleanDraftEvidenceProps) {
  // Format currency
  const formattedImpact = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(impactMonthly)

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5 relative overflow-hidden">
      <div
        className="container mx-auto px-6"
        style={{ width: '100%', minWidth: '300px' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Content */}
          <div className="order-2 lg:order-1">
            <h2 className="text-header text-white mb-8">What we found</h2>

            <div className="space-y-6 text-xl font-light leading-relaxed text-gray-300">
              <p>
                We tested your site against the metrics search engines use to
                rank results, the signals customers look for before buying, and
                the friction points that block conversions.
              </p>

              <p className="text-white">
                <span className="font-semibold text-accent">
                  {issueCount} prioritized issues
                </span>{' '}
                with an estimated revenue impact of up to{' '}
                <span className="font-semibold">{formattedImpact}/month</span>.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-8 mt-8">
                <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                  Your Top Priority
                </p>
                <p className="text-2xl text-white font-medium mb-4">
                  {topPriority}
                </p>
                <p className="text-lg text-gray-400">{description}</p>
              </div>
            </div>
          </div>

          {/* Right: Desktop Screenshot */}
          <div className="relative order-1 lg:order-2">
            {/* Desktop Monitor Frame */}
            <MacbookPro>
              {screenshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={screenshotUrl}
                  alt="Desktop view"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  Desktop View
                </div>
              )}
            </MacbookPro>
          </div>
        </div>
      </div>
    </section>
  )
}
