'use client'

import React, { useState } from 'react'
import { useRenderTracking } from '@/lib/monitoring/hooks'
import { Logo } from '@/components/Logo'
import { ScrollToTop } from '@/components/ScrollToTop'

export function OrganicHomepage() {
  // useRenderTracking('OrganicHomepage')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<'domain' | 'email' | 'success'>('domain')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const scrollToSection = (sectionId: string) => {
    const elements = document.querySelectorAll(`#${sectionId}`)
    // Get the second instance (visible one)
    const targetElement = elements[1] || elements[0]
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openModal = () => {
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setShowModal(false)
    document.body.style.overflow = ''
    setError('')
    setStep('domain')
    setDomain('')
    setEmail('')
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain || !email) return

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain }),
      })

      if (!response.ok) {
        throw new Error('Failed to join waitlist')
      }

      setStep('success')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="organic-homepage-wrapper">
      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="max-w-[1200px] mx-auto px-10 py-5 flex items-center justify-between">
          <div>
            <a href="#top" className="flex flex-col">
              <Logo size="medium" />
              <div className="text-[13px] font-light opacity-70 mt-1 flex justify-between" style={{ width: '264px' }}>
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
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('faq')} 
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
            >
              FAQ
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="hero" data-testid="organic-homepage">
          <div className="hero-content container-narrow">
            <h1 className="text-display mb-8">
              Your website has untapped potential
            </h1>
            <p className="text-header opacity-70 mb-[60px] max-w-[900px] mx-auto">
              We analyze thousands of data points to show you what to fix and
              what it's worth.
            </p>

            {/* CTA Button with Pulsing Rings */}
            <div className="relative inline-block" data-testid="hero-section">
              <div
                className="pressure-visual"
                style={{ width: '400px', height: '400px', margin: '0 auto' }}
              >
                <div
                  className="pressure-ring"
                  style={{ '--scale': 1 } as React.CSSProperties}
                ></div>
                <div
                  className="pressure-ring"
                  style={
                    {
                      '--scale': 0.8,
                      animationDelay: '0.3s',
                    } as React.CSSProperties
                  }
                ></div>
                <div
                  className="pressure-ring"
                  style={
                    {
                      '--scale': 0.6,
                      animationDelay: '0.6s',
                    } as React.CSSProperties
                  }
                ></div>
                <div className="pressure-center">
                  <button
                    onClick={openModal}
                    className="cta-primary"
                    data-testid="open-waitlist-button"
                  >
                    Join Waitlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Section */}
        <section id="assessment" className="section">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-header text-center">What We Analyze</h2>

            <div className="assessment-grid">
              <div className="text-center">
                <div className="text-number" style={{ color: '#FFC107' }}>
                  4.8s
                </div>
                <h3 className="text-[24px] mb-3">Load Performance</h3>
                <p className="text-[17px] opacity-60 leading-[1.6]">
                  How fast your site loads on real devices, and what it's
                  costing you in lost customers.
                </p>
              </div>

              <div className="text-center">
                <div className="text-number" style={{ color: '#DC2626' }}>
                  47%
                </div>
                <h3 className="text-[24px] mb-3">Mobile Experience</h3>
                <p className="text-[17px] opacity-60 leading-[1.6]">
                  Where mobile visitors fail to convert, with specific
                  breakpoints identified.
                </p>
              </div>

              <div className="text-center">
                <div className="text-number" style={{ color: '#22C55E' }}>
                  $$
                </div>
                <h3 className="text-[24px] mb-3">Revenue Impact</h3>
                <p className="text-[17px] opacity-60 leading-[1.6]">
                  Estimated monthly revenue loss from technical issues,
                  calculated for your specific market.
                </p>
              </div>
            </div>

            <p className="text-center text-[24px] font-normal opacity-70">
              No fluff. No 50-page reports. Just what's broken and what it's
              worth to fix it.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="section">
          <div className="container-tight">
            <h2 className="text-header text-center">Questions</h2>

            <div className="space-y-0">
              {[
                {
                  q: 'What exactly do I get?',
                  a: `Synthesis. A revenue-focused website audit you can act on today. We run several assessments across performance, SEO, trust, UX, mobile, and social signals, then package the results into:

1. Prioritized findings. The handful of issues costing you the most money, ranked by estimated revenue impact.

2. Executable plan. Developer-ready issue descriptions so you can fix each issue quickly.

3. Full assessment appendix. A detailed breakdown of all checks we ran—no fluff, just the data that backs our recommendations.

The deliverable is a concise report, not a 50-page data dump. Most clients recoup multiples of the report with a single high-impact fix.`,
                },
                {
                  q: 'How is this different from free tools?',
                  a: `Free scanners list every technical warning they can find—often hundreds per site—and leave you to guess which ones matter. We go several steps further:

1. Business-aware scoring. We estimate the likely revenue impact of each issue using industry benchmarks, location data, and detailed studies, so you see problems ranked by dollars, not jargon.

2. Actionable focus. Instead of a wall of red flags, you get a short list of high-leverage issues with clear solutions.

3. Complete transparency. An appendix shows every check we ran and the data behind each estimate, so you can judge our recommendations for yourself.

Think of free tools as a medical encyclopedia and our audit as the doctor who interprets the symptoms, prioritizes the treatment, and hands you a clear prescription—without pretending it's a guaranteed cure.`,
                },
                {
                  q: 'How do I get my report?',
                  a: "We're currently in early access. Join the waitlist and we'll analyze your site and send you an email as soon as we launch.",
                },
                {
                  q: 'How do you calculate revenue impact?',
                  a: `We combine four data layers to estimate the annual revenue-per-point for your ZIP × industry:

1. Local revenue baseline – We start with the latest U.S. Census County & ZIP Business Patterns (2022; 2023 release scheduled June 25 2025) and BLS Quarterly Census of Employment & Wages (Q4 2024) to size typical payroll and head-count for businesses like yours.
   census.gov
   bls.gov

2. Payroll-to-revenue bridge – Payroll is converted to revenue using Bureau of Economic Analysis small-business bridging ratios (≈ 2.2 × on average for SMBs).

3. Digital uplift curves – For each of our six score categories (performance, SEO, trust, UX, mobile, social) we apply peer-reviewed elasticity models. Examples:

   • 100 ms faster LCP → 2-4 % conversion lift (Chrome UX Report, 2024)

   • Moving from Google position 5 → 3 roughly doubles click-through (Backlinko CTR Study, 2024)

   • Adding a well-placed trust badge lifts checkout completion ≈ 14 % (Baymard Institute, 2023)

   • Better review volume boosts local pack calls ≈ 10 % (BrightLocal, 2024)

   • Case study: 80 % INP reduction yielded +36 % conversions (QuintoAndar, Jan 2025)
     web.dev

4. Industry channel mix – Finally, we weight each uplift by your NAICS segment's online-revenue share from the Adobe Digital Economy Index (May 2025) so, for example, a landscaping firm isn't benchmarked like a pure-play e-commerce store.
   business.adobe.com

The result is an evidence-based estimate of how much one score point is likely to move your annual revenue. It isn't a guarantee, but it lets you see—in plain dollars—which fixes are poised to pay for themselves first.`,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className="faq-question">
                    {item.q}
                    <span className="faq-toggle">+</span>
                  </div>
                  <div className="faq-answer whitespace-pre-line">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
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

      {/* Waitlist Modal */}
      <div
        className={`modal ${showModal ? 'active' : ''}`}
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div className="modal-container container-form">
          <button className="modal-close" onClick={closeModal}>
            &times;
          </button>

          <p className="text-body mb-8">
            We are currently only analyzing targeted sites. Be among the first
            to know when we expand.
          </p>

          {step !== 'success' && (
            <form onSubmit={handleEmailSubmit} data-testid="waitlist-form">
              <div className="form-group">
                <label className="form-label">Your website URL</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  required
                  className="form-input"
                  autoFocus
                  data-testid="waitlist-domain-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="form-input"
                  data-testid="waitlist-email-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !email || !domain}
                className="cta-primary button-full"
                data-testid="waitlist-submit-button"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="carbon-container text-center">
              <h3 className="text-[24px] mb-4">You're on the list!</h3>
              <p className="text-body">
                We'll analyze {domain} and send the report when we launch.
              </p>
              <button onClick={closeModal} className="cta-primary mt-6">
                Close
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* Scroll to Top Component */}
      <ScrollToTop />
    </div>
  )
}
