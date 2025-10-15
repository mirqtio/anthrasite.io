// app/legal/page.tsx
import React from 'react'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'
import Link from 'next/link'

export default function LegalHubPage() {
  return (
    <LegalPageLayout title="Legal Information">
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Here you can find important legal documents governing your use of
        Anthrasite's services.
      </p>
      <ul className="list-disc pl-6 text-[17px] opacity-80 space-y-4">
        <li>
          <Link href="/legal/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
          <p className="opacity-70">
            How we collect, use, and protect your data.
          </p>
        </li>
        <li>
          <Link href="/legal/terms" className="text-accent hover:underline">
            Terms of Service
          </Link>
          <p className="opacity-70">
            The terms and conditions for using our services.
          </p>
        </li>
        <li>
          <Link
            href="/legal/do-not-sell"
            className="text-accent hover:underline"
          >
            Do Not Sell or Share My Personal Information
          </Link>
          <p className="opacity-70">
            Your rights and choices regarding data sharing under US privacy
            laws.
          </p>
        </li>
      </ul>
    </LegalPageLayout>
  )
}
