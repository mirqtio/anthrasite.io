'use client'

import React, { useState } from 'react'
import { PurchaseIssue } from '@/lib/purchase/types'

interface PriorityDetailV2Props {
  issue: PurchaseIssue
  desktopScreenshotUrl: string | null
  onCtaClick: () => void
}

export function PriorityDetailV2({
  issue,
  desktopScreenshotUrl,
  onCtaClick,
}: PriorityDetailV2Props) {
  const [imageError, setImageError] = useState(false)

  // Effort Badge Logic
  const getBadgeClasses = (effort?: string) => {
    const normalizedEffort = effort?.toUpperCase() || 'MODERATE'
    switch (normalizedEffort) {
      case 'EASY':
        return 'text-green-600 bg-green-500/10'
      case 'HARD':
        return 'text-red-600 bg-red-600/10'
      case 'MODERATE':
      default:
        return 'text-amber-600 bg-amber-500/10'
    }
  }
  const badgeClasses = getBadgeClasses(issue.effort)

  return (
    <section className="bg-anthracite-white">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="md:grid md:grid-cols-[55%_45%] md:gap-6">
          {/* --- Content Column --- */}
          <div className="px-6 py-12 md:px-12 md:py-16 md:flex md:flex-col md:justify-center">
            <div className="text-[12px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-3">
              YOUR #1 PRIORITY
            </div>

            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[18px] md:text-[18px] font-medium text-[#333]">
                {issue.title}
              </h2>
              <span
                className={`text-[12px] font-medium uppercase px-1.5 py-0.5 rounded-[3px] ${badgeClasses}`}
              >
                {issue.effort || 'MODERATE'}
              </span>
            </div>

            <p className="text-[16px] md:text-[16px] font-normal text-slate-600 leading-[1.7] mb-6">
              {issue.description}
            </p>

            {/* Mobile: Screenshot appears here in stack */}
            <div className="md:hidden w-full mb-6">
              {desktopScreenshotUrl && !imageError ? (
                <img
                  src={desktopScreenshotUrl}
                  alt="Website desktop screenshot"
                  className="w-full h-auto shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-sm"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full aspect-video bg-gray-200 rounded-sm animate-pulse" />
              )}
            </div>

            <div>
              <button
                onClick={onCtaClick}
                className="w-full md:w-auto h-[52px] md:px-8 bg-anthracite-blue text-white font-medium rounded text-[16px] flex items-center justify-center hover:bg-[#0052cc] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-anthracite-blue outline-none"
                aria-label="Download full report for $199"
              >
                Download Full Report — $199
              </button>
            </div>
          </div>

          {/* --- Desktop Image Column --- */}
          <div className="hidden md:flex items-center pr-12 py-16">
            {desktopScreenshotUrl && !imageError ? (
              <img
                src={desktopScreenshotUrl}
                alt="Website desktop screenshot"
                className="w-full h-auto shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-sm"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full aspect-video bg-gray-200 rounded-sm animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
