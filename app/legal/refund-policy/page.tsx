// app/legal/refund-policy/page.tsx
import React from 'react'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="January 2, 2026">
      <h3 className="text-[24px] font-light mt-8 mb-4">90-Day Guarantee</h3>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        We stand behind the value of our reports.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Give it a real shot. If you don&apos;t see the value after 90 days,
        email us at{' '}
        <a
          href="mailto:hello@anthrasite.io"
          className="text-[#0066FF] hover:underline"
        >
          hello@anthrasite.io
        </a>{' '}
        and we&apos;ll refund you in full. No hoops.
      </p>

      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Refunds are issued to the original payment method.
      </p>
    </LegalPageLayout>
  )
}
