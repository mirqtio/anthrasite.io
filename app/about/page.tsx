import React from 'react'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export default function AboutPage() {
  return (
    <LegalPageLayout title="About Anthrasite" showLastUpdated={false}>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Most website audits are designed to scare you into buying something.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        They flood you with technical jargon, label everything "critical," and
        leave you feeling like your site is a disaster—without telling you what
        actually matters or where to start.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        We think small businesses deserve better.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Anthrasite was built on a simple belief: the insights that help
        enterprise companies understand their websites shouldn't require an
        enterprise budget. Every business owner should be able to see what's
        working, what isn't, and what to fix first—in plain language,
        prioritized by real business impact.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        We lead with value, not fear. Our reports tell you what's costing you
        money and equip you with the information to address it. We'd rather help
        you make a confident decision than pressure you into a panicked one.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        The good news: most website problems are fixable, and simpler than they
        sound.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        If that sounds like the kind of company you want to work with, we're at{' '}
        <strong>hello@anthrasite.io</strong>.
      </p>
    </LegalPageLayout>
  )
}
