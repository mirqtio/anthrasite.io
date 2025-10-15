// app/legal/terms/page.tsx
import React from 'react'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.1 Acceptance of Terms
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        By accessing <strong>anthrasite.io</strong> or purchasing a report, you
        agree to be bound by these Terms of Service ("Terms"). If you do not
        agree, do not use the Services.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">2.2 Eligibility</h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        You must be at least 18 years old and able to form a binding contract.
        You represent that you are using the Service for business purposes and
        have authority to bind the entity you represent.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.3 Description of Service
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Anthrasite provides evidence‑based website audit reports, related
        documentation, and optional consulting.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.4 Accounts & Purchases
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        You may need an account to access certain features. You are responsible
        for safeguarding your login credentials. All fees are quoted in USD;
        payment is due at checkout via Stripe.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">2.5 Refunds</h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Because the audit is a custom digital good created immediately upon
        purchase, <strong>all sales are final</strong> unless required by
        consumer‑protection law.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.6 License & Intellectual Property
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Upon full payment, Anthrasite grants you a non‑exclusive,
        non‑transferable license to use the delivered report internally or with
        service providers working on your behalf. Anthrasite retains all
        intellectual‑property rights.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.7 Prohibited Conduct
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        You will not (a) reverse engineer or resell the Service, (b) submit URLs
        you do not own or have permission to audit, or (c) use the Service to
        infringe, harass, or violate any law.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">2.8 Disclaimers</h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6 italic">
        The report provides estimates based on industry benchmarks and the
        information you supply. Results are <strong>not guaranteed</strong>, and
        Anthrasite disclaims all warranties, express or implied, including
        fitness for a particular purpose.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.9 Limitation of Liability
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        To the maximum extent permitted by law, Anthrasite's total liability
        under these Terms will not exceed the amount you paid for the Services
        in the 12 months preceding the claim. Anthrasite is{' '}
        <strong>not liable</strong> for indirect, consequential, or punitive
        damages.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">2.10 Indemnification</h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        You agree to defend and indemnify Anthrasite against any claims arising
        from your use of the Services, violation of these Terms, or infringement
        of third‑party rights.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.11 Modifications to the Service
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        We may modify, suspend, or discontinue the Service at any time with
        reasonable notice when feasible.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">2.12 Termination</h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        We may suspend or terminate your access for breach of these Terms
        without refund.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.13 Governing Law & Dispute Resolution
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        These Terms are governed by the laws of the State of New York, excluding
        conflict‑of‑law rules. Any dispute will be resolved by binding
        arbitration under JAMS in New York County, unless you opt out within 30
        days of first agreeing to these Terms.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">
        2.14 Severability & Miscellaneous
      </h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        If any provision is unenforceable, the remaining provisions will remain
        in effect. These Terms constitute the entire agreement between you and
        Anthrasite regarding the Service.
      </p>

      <h3 className="text-[24px] font-light mt-8 mb-4">2.15 Contact</h3>
      <p className="text-[17px] opacity-80 leading-relaxed mb-6">
        Questions? Email <strong>support@anthrasite.io</strong> or write to the
        address provided in our Privacy Policy.
      </p>
    </LegalPageLayout>
  )
}
