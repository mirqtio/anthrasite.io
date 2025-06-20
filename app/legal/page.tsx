'use client'

import React, { useState } from 'react'
import { Logo } from '@/components/Logo'

export default function LegalPage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div>
      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5 flex items-center justify-between">
          <div className="logo-container">
            <a href="/" className="flex flex-col">
              <Logo size="medium" className="logo-mobile" />
              <div className="tagline text-[10px] md:text-[13px] font-light opacity-70 mt-1 flex justify-between">
                <span>V</span>
                <span>A</span>
                <span>L</span>
                <span>U</span>
                <span>E</span>
                <span>,</span>
                <span>&nbsp;</span>
                <span>C</span>
                <span>R</span>
                <span>Y</span>
                <span>S</span>
                <span>T</span>
                <span>A</span>
                <span>L</span>
                <span>L</span>
                <span>I</span>
                <span>Z</span>
                <span>E</span>
                <span>D</span>
              </div>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/about" className="text-[17px] opacity-70 hover:opacity-100 transition-opacity">
              About Us
            </a>
            <a href="/#faq" className="text-[17px] opacity-70 hover:opacity-100 transition-opacity">
              FAQ
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${showMobileMenu ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-carbon border-t border-smoke">
            <div className="flex flex-col py-4">
              <a 
                href="/about" 
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                About Us
              </a>
              <a 
                href="/#faq" 
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                FAQ
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-[120px] pb-[60px] px-10">
        <div className="max-w-[800px] mx-auto prose prose-invert">
          <h1 className="text-[48px] font-light mb-8">Anthrasite Privacy Policy & Terms of Service</h1>
          <p className="text-[17px] opacity-60 mb-12">Last updated: June 20, 2025</p>
          
          <hr className="border-white/10 my-12" />
          
          <h2 className="text-[32px] font-light mt-12 mb-6">1. Privacy Policy</h2>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.1 Scope</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            This Privacy Policy explains how Entrainment Inc., doing business as <strong>Anthrasite</strong> ("Anthrasite," "we," "our," or "us"), collects, uses, and discloses information when you visit <strong>anthrasite.com</strong> or purchase our website‑audit services (the "Services").
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.2 Information We Collect</h3>
          <table className="w-full mb-6 text-[17px]">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 font-medium">Category</th>
                <th className="text-left py-3 font-medium">Examples</th>
                <th className="text-left py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-3"><strong>Information you provide</strong></td>
                <td className="py-3 opacity-80">Name, business email, billing address, payment method, URLs you ask us to analyze, support requests, survey responses</td>
                <td className="py-3 opacity-80">Directly from you</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3"><strong>Automatic usage data</strong></td>
                <td className="py-3 opacity-80">IP address, device/browser type, referring pages, pages viewed, time spent, error logs</td>
                <td className="py-3 opacity-80">Collected through cookies, log files, and similar technologies</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3"><strong>Derived analytics</strong></td>
                <td className="py-3 opacity-80">Site‑performance metrics, audit scores, uplift estimates</td>
                <td className="py-3 opacity-80">Generated by our assessment engine from the URLs you submit</td>
              </tr>
            </tbody>
          </table>
          
          <blockquote className="border-l-4 border-accent pl-6 my-6 text-[17px] opacity-80">
            <strong>Cookies & tracking</strong> – We use first‑party cookies and Google Analytics 4 to understand how visitors use the site and to improve performance. You can reject non‑essential cookies in the banner or through your browser settings.
          </blockquote>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.3 How We Use Information</h3>
          <ol className="list-decimal pl-6 text-[17px] opacity-80 space-y-2 mb-6">
            <li><strong>Deliver and improve the Services</strong> (run audits, generate reports, provide support)</li>
            <li><strong>Process transactions</strong> and send invoices/receipts</li>
            <li><strong>Communicate</strong> – service alerts, feature updates, marketing (with opt‑out)</li>
            <li><strong>Research & development</strong> – aggregate, de‑identified data to refine scoring models</li>
            <li><strong>Legal & security</strong> – detect fraud, enforce Terms, comply with applicable laws</li>
          </ol>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.4 Legal Bases (GDPR)</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            We process personal data under one or more of the following bases: <strong>contractual necessity</strong>, <strong>legitimate interests</strong> (e.g., improving our Services), <strong>consent</strong> (for optional cookies & marketing), and <strong>legal obligation</strong>.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.5 How We Share Information</h3>
          <ul className="list-disc pl-6 text-[17px] opacity-80 space-y-2 mb-6">
            <li><strong>Service providers</strong> – payment processors (Stripe), cloud hosting (AWS), analytics (Google), and email delivery (Postmark), bound by confidentiality agreements.</li>
            <li><strong>Corporate events</strong> – merger, acquisition, or asset sale.</li>
            <li><strong>Legal compliance</strong> – when required by law, court order, or to protect rights, property, or safety.</li>
            <li>We <strong>never sell</strong> customer data to third parties.</li>
          </ul>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.6 Data Retention</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            Audit artifacts are retained for <strong>18 months</strong> by default, after which they are permanently deleted or anonymized unless we are legally required to retain them longer.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.7 Security</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            We follow industry best practices: TLS 1.2+, least‑privilege access, encrypted backups, and regular penetration testing. No internet transmission is 100 % secure; use the Service at your own risk.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.8 Your Rights</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            Depending on where you live, you may have rights to access, correct, delete, or port your data and to object or restrict certain processing. Email <strong>privacy@anthrasite.com</strong> to exercise these rights.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.9 International Transfers</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            We are headquartered in New York, USA, and may transfer data to the United States and other countries with adequate safeguards such as the EU Standard Contractual Clauses.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.10 Children's Privacy</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            The Services are not directed to children under 13. We do not knowingly collect personal data from children.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.11 Changes to This Policy</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            We will post any Privacy Policy changes on this page and, if the changes are material, provide a prominent notice or email 30 days before they take effect.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">1.12 Contact Us</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            Email: <strong>privacy@anthrasite.com</strong><br />
            Mail: Entrainment Inc., 99 Madison Ave #1234, New York, NY 10016, USA
          </p>
          
          <hr className="border-white/10 my-12" />
          
          <h2 className="text-[32px] font-light mt-12 mb-6">2. Terms of Service</h2>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.1 Acceptance of Terms</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            By accessing <strong>anthrasite.com</strong> or purchasing a report, you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Services.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.2 Eligibility</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            You must be at least 18 years old and able to form a binding contract. You represent that you are using the Service for business purposes and have authority to bind the entity you represent.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.3 Description of Service</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            Anthrasite provides evidence‑based website audit reports, related documentation, and optional consulting.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.4 Accounts & Purchases</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            You may need an account to access certain features. You are responsible for safeguarding your login credentials. All fees are quoted in USD; payment is due at checkout via Stripe.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.5 Refunds</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            Because the audit is a custom digital good created immediately upon purchase, <strong>all sales are final</strong> unless required by consumer‑protection law.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.6 License & Intellectual Property</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            Upon full payment, Anthrasite grants you a non‑exclusive, non‑transferable license to use the delivered report internally or with service providers working on your behalf. Anthrasite retains all intellectual‑property rights.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.7 Prohibited Conduct</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            You will not (a) reverse engineer or resell the Service, (b) submit URLs you do not own or have permission to audit, or (c) use the Service to infringe, harass, or violate any law.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.8 Disclaimers</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6 italic">
            The report provides estimates based on industry benchmarks and the information you supply. Results are <strong>not guaranteed</strong>, and Anthrasite disclaims all warranties, express or implied, including fitness for a particular purpose.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.9 Limitation of Liability</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            To the maximum extent permitted by law, Anthrasite's total liability under these Terms will not exceed the amount you paid for the Services in the 12 months preceding the claim. Anthrasite is <strong>not liable</strong> for indirect, consequential, or punitive damages.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.10 Indemnification</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            You agree to defend and indemnify Anthrasite against any claims arising from your use of the Services, violation of these Terms, or infringement of third‑party rights.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.11 Modifications to the Service</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            We may modify, suspend, or discontinue the Service at any time with reasonable notice when feasible.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.12 Termination</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            We may suspend or terminate your access for breach of these Terms without refund.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.13 Governing Law & Dispute Resolution</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            These Terms are governed by the laws of the State of New York, excluding conflict‑of‑law rules. Any dispute will be resolved by binding arbitration under JAMS in New York County, unless you opt out within 30 days of first agreeing to these Terms.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.14 Severability & Miscellaneous</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            If any provision is unenforceable, the remaining provisions will remain in effect. These Terms constitute the entire agreement between you and Anthrasite regarding the Service.
          </p>
          
          <h3 className="text-[24px] font-light mt-8 mb-4">2.15 Contact</h3>
          <p className="text-[17px] opacity-80 leading-relaxed mb-6">
            Questions? Email <strong>support@anthrasite.com</strong> or write to the address above.
          </p>
          
          <hr className="border-white/10 my-12" />
          
          <blockquote className="border-l-4 border-white/20 pl-6 my-6 text-[17px] opacity-60">
            <strong>Disclaimer:</strong> This document is provided for informational purposes and does not constitute legal advice. Consult qualified counsel to adapt these terms to your specific circumstances.
          </blockquote>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-[60px] px-10 border-t border-white/5 text-center">
        <div className="footer-links">
          <a href="/legal">Privacy & Terms</a>
          <a href="mailto:hello@anthrasite.io">Contact</a>
        </div>
        <p className="text-tiny opacity-30">
          © {new Date().getFullYear()} Anthrasite. All rights reserved.
        </p>
      </footer>
    </div>
  )
}