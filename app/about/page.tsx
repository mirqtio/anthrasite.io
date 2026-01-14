import React from 'react'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export default function AboutPage() {
  return (
    <LegalPageLayout title="About Us" showLastUpdated={false}>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        I'm Charlie, the founder.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Before Anthrasite, I was VP of Engineering at Gainbridge, where I helped
        scale the business from $30 million to over a billion in two years.
        Along the way, I kept seeing the same gap: enterprise companies had
        entire teams dedicated to understanding how their websites performed.
        Small businesses—the ones who actually depend on their websites to bring
        in customers—got generic checklists and scare tactics.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Most audit tools tell you what's broken. They don't tell you what it's
        costing you or what to fix first.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        I built Anthrasite to change that. Every report translates technical
        issues into business impact, prioritizes what actually matters to your
        revenue, and gives you a clear path forward—whether you fix it yourself
        or hand it to someone who can.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        If you have questions or want to talk, I'm at{' '}
        <strong>hello@anthrasite.io</strong>.
      </p>
    </LegalPageLayout>
  )
}
