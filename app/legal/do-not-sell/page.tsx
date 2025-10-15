// app/legal/do-not-sell/page.tsx
'use client'

import React from 'react'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export default function DoNotSellPage() {
  const optOut = () => {
    document.cookie = 'do_not_share=1;path=/;max-age=31536000' // 1 year
    alert('You have successfully opted out of analytics tracking.')
    // Optionally, you could trigger a page reload or a call to an analytics consent manager.
  }

  return (
    <LegalPageLayout title="Do Not Sell or Share My Personal Information">
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Anthrasite does not sell or share your personal information for monetary
        or other valuable consideration as defined under the California Consumer
        Privacy Act (CPRA) and other US state privacy laws.
      </p>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        However, we respect your right to opt out of the use of analytics
        cookies and similar tracking technologies that may be considered a
        "sale" or "sharing" under certain privacy laws. By opting out, we will
        disable analytics services like Google Analytics and PostHog for your
        browser.
      </p>
      <div className="mt-8">
        <button
          onClick={optOut}
          className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-accent-dark transition-colors"
        >
          Opt Out of Analytics Tracking
        </button>
      </div>
    </LegalPageLayout>
  )
}
