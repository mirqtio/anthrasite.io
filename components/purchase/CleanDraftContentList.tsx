'use client'

import React from 'react'

export function CleanDraftContentList() {
  const items = [
    {
      title: 'Prioritized issues',
      desc: 'Ranked by impact to your business, not alphabetically or by technical category.',
    },
    {
      title: 'Effort indicators',
      desc: 'Each issue marked Easy, Moderate, or Hard so you can spot quick wins.',
    },
    {
      title: 'Plain-English explanations',
      desc: 'What each issue means for visitors, not just a score.',
    },
    {
      title: 'Mobile and desktop screenshots',
      desc: 'Proof we looked at your actual site.',
    },
    {
      title: 'Methodology explained',
      desc: 'How we estimated impact, so you can judge for yourself.',
    },
  ]

  return (
    <section className="py-24 bg-[#232323] border-t border-white/5">
      <div
        className="container mx-auto px-6"
        style={{ width: '100%', minWidth: '300px', maxWidth: '56rem' }}
      >
        <h2 className="text-header text-white mb-12">What you'll get</h2>

        <div className="space-y-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent mt-1 group-hover:bg-accent group-hover:text-white transition-colors">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl text-white font-medium mb-2">
                  {item.title}
                </h3>
                <p className="text-lg text-gray-400 font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
