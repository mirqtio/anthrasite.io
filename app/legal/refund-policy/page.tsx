// app/legal/refund-policy/page.tsx
import React from 'react'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="January 1, 2026">
      <h3 className="text-[24px] font-light mt-8 mb-4">
        90-Day Performance Guarantee
      </h3>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        We stand behind the value of our reports.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        If you purchase a report, implement the recommendations we identify, and
        do not see enough measurable improvement to reasonably cover the cost of
        the report within <strong>90 days of delivery</strong>, you are eligible
        for a <strong>full refund</strong>.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-4">
        <strong>To request a refund:</strong>
      </p>

      <ul className="list-disc pl-6 text-[17px] opacity-80 space-y-2 mb-6">
        <li>Contact us within 90 days of receiving your report.</li>
        <li>
          Confirm that you implemented the recommended changes in good faith.
        </li>
        <li>Briefly describe the actions taken and the outcomes observed.</li>
      </ul>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Refunds are issued to the original payment method once eligibility is
        confirmed.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        This guarantee is intended to remove risk, not add friction. If you put
        the work in and it doesn’t pay off, you don’t pay.
      </p>
    </LegalPageLayout>
  )
}
