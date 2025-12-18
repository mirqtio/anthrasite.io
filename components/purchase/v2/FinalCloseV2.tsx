'use client'

import React, { useState } from 'react'

interface FinalCloseV2Props {
  desktopScreenshotUrl: string | null
  onCtaClick: () => void
}

export function FinalCloseV2({
  desktopScreenshotUrl,
  onCtaClick,
}: FinalCloseV2Props) {
  const [imageError, setImageError] = useState(false)

  return (
    <section className="relative bg-anthracite-black overflow-hidden">
      {/* --- Desktop View: Min height logic isn't strictly 100vh, but "Standard section" padding --- */}
      <div className="relative w-full py-16 md:py-20 min-h-[500px] flex items-center">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 flex justify-end">
          {/* Mobile: 60% width right aligned. Desktop: 50% width right aligned. */}
          <div className="relative w-[60%] md:w-[50%] h-full">
            {desktopScreenshotUrl && !imageError ? (
              <>
                <img
                  src={desktopScreenshotUrl}
                  alt="Website desktop screenshot"
                  className="w-full h-full object-cover object-left md:object-center opacity-40 md:opacity-50"
                  onError={() => setImageError(true)}
                />
                {/* Gradient: Carbon Left -> Transparent Right */}
                <div className="absolute inset-0 bg-gradient-to-r from-anthracite-black to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-[#1a1a1a]" />
            )}
          </div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-[28px] md:text-[40px] font-light text-white mb-8 md:mb-10">
            Your report is ready.
          </h2>

          <div className="w-full max-w-[340px] md:max-w-none">
            <button
              onClick={onCtaClick}
              className="w-full md:w-auto h-[52px] md:px-8 bg-anthracite-blue text-white font-medium rounded text-[16px] flex items-center justify-center hover:bg-[#0052cc] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-anthracite-blue outline-none"
              aria-label="Download your website audit report for $199"
            >
              Download Your Report — $199
            </button>

            <div className="text-[12px] md:text-[12px] text-gray-400 mt-3">
              Instant delivery. Money-back guarantee.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
