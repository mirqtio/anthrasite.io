'use client'

import React from 'react'

interface WhatsInsideV2Props {
  onCtaClick: () => void
}

export function WhatsInsideV2({ onCtaClick }: WhatsInsideV2Props) {
  const listItems = [
    {
      bold: 'Your top 3-5 priorities',
      text: 'the changes with biggest impact',
    },
    {
      bold: 'Effort labels',
      text: 'each marked Easy, Moderate, or Hard',
    },
    {
      bold: 'Plain-English explanations',
      text: 'why each issue matters to customers',
    },
    {
      bold: 'Technical scores',
      text: 'performance, SEO, security, accessibility',
    },
    {
      bold: 'Revenue impact estimate',
      text: 'what these issues could be costing you',
    },
  ]

  return (
    <section className="bg-anthracite-white border-t border-[#e5e7eb]">
      <div className="w-full max-w-[640px] mx-auto px-6 py-12 md:px-12 md:py-16">
        <h2 className="text-[28px] md:text-[28px] font-light text-[#333] text-center mb-8 md:mb-10">
          What&apos;s in the report
        </h2>

        <div className="space-y-6 md:space-y-5">
          {listItems.map((item, idx) => (
            <div key={idx} className="text-[16px]">
              {/* Mobile: Stacked */}
              <div className="md:hidden">
                <div className="font-medium text-[#333] mb-1">{item.bold}</div>
                <div className="font-normal text-slate-600">{item.text}</div>
              </div>

              {/* Desktop: Inline */}
              <div className="hidden md:block">
                <span className="font-medium text-[#333]">{item.bold}</span>
                <span className="mx-1 text-slate-600">—</span>
                <span className="font-normal text-slate-600">{item.text}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-10 flex justify-center">
          <button
            onClick={onCtaClick}
            className="w-full md:w-auto h-[52px] md:px-8 bg-anthracite-blue text-white font-medium rounded text-[16px] flex items-center justify-center hover:bg-[#0052cc] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-anthracite-blue outline-none"
            aria-label="Download your website audit report for $199"
          >
            Download Your Report — $199
          </button>
        </div>
      </div>
    </section>
  )
}
