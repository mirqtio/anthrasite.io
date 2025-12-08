import React from 'react'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export default function AboutPage() {
  return (
    <LegalPageLayout title="About Anthrasite">
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Anthrasite helps growth teams understand how their websites actually
        perform for real visitors. We combine technical audits, behavioral data,
        and narrative reporting so you can see where you are leaving money on
        the table Instead of generic best-practices checklists, we focus on the
        specific frictions your visitors encounter 7e2 from content clarity and
        information architecture to perceived performance, trust, and UX debt.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">What we do</h3>
      <ul className="list-disc pl-6 text-[17px] opacity-80 space-y-2 mb-6">
        <li>Run deep, page-level audits of high-intent flows</li>
        <li>Quantify narrative and UX issues in plain language</li>
        <li>Prioritize fixes by business impact, not just severity labels</li>
        <li>Provide concrete, implementation-ready recommendations</li>
      </ul>

      <h3 className="text-[24px] font-light mt-8 mb-4">Who it is for</h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Anthrasite is designed for founders, marketing leaders, and growth teams
        who already invest in acquisition and want clearer visibility into how
        well their website converts that demand.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">How to get in touch</h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        If you would like to learn more, request an assessment, or talk about a
        custom engagement, email <strong>hello@anthrasite.io</strong> and we
        will get back to you.
      </p>
    </LegalPageLayout>
  )
}
