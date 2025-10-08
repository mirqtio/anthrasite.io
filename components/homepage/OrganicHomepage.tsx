'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRenderTracking } from '@/lib/monitoring/hooks'
import { Logo } from '@/components/Logo'
import { ScrollToTop } from '@/components/ScrollToTop'

export function OrganicHomepage() {
  // useRenderTracking('OrganicHomepage')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [step, setStep] = useState<'domain' | 'success'>('domain')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Set up Intersection Observer for reveal animations
  useEffect(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement
              const delay = parseInt(target.dataset.delay || '0')

              setTimeout(() => {
                target.classList.add('revealed')
              }, delay)

              // Stop observing once revealed
              observerRef.current?.unobserve(target)
            }
          })
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -50px 0px',
        }
      )

      // Observe all reveal elements
      const revealElements = document.querySelectorAll(
        '.reveal-card, .reveal-tagline'
      )
      revealElements.forEach((el) => observerRef.current?.observe(el))
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  // Handle hash navigation from other pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove #
      if (hash) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const elements = document.querySelectorAll(`#${hash}`)
          // Get the second instance (visible one) due to duplicate content fix
          const targetElement = elements[1] || elements[0]
          if (targetElement) {
            const navbarHeight = 80 // Height of fixed navbar
            const extraOffset = hash === 'assessment' ? 120 : 0 // Extra offset for Examples section
            const elementPosition =
              targetElement.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - navbarHeight - extraOffset

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            })
          }
        }, 100)
      }
    }

    // Check on mount
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const scrollToSection = (sectionId: string) => {
    const elements = document.querySelectorAll(`#${sectionId}`)
    // Get the second instance (visible one)
    const targetElement = elements[1] || elements[0]
    if (targetElement) {
      const navbarHeight = 80 // Height of fixed navbar
      const extraOffset = sectionId === 'assessment' ? 120 : 0 // Extra offset for Examples section
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navbarHeight - extraOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
    setShowMobileMenu(false)
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

    // Normalize the domain - accept any format
    let normalizedDomain = domain.trim()
    // Remove protocol if present
    normalizedDomain = normalizedDomain.replace(/^https?:\/\//, '')
    // Remove trailing slash
    normalizedDomain = normalizedDomain.replace(/\/$/, '')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain: normalizedDomain }),
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
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5 flex items-center justify-between">
          <div className="logo-container">
            <a href="#top" className="flex flex-col">
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
            <button
              onClick={() => scrollToSection('assessment')}
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
            >
              Method
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
            >
              FAQ
            </button>
            <a
              href="/about"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              About Us
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-transform ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-opacity ${showMobileMenu ? 'opacity-0' : ''}`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-transform ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-carbon border-t border-smoke">
            <div className="flex flex-col py-4">
              <button
                onClick={() => scrollToSection('assessment')}
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity text-left"
              >
                Method
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity text-left"
              >
                FAQ
              </button>
              <a
                href="/about"
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                About Us
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="hero" data-testid="organic-homepage">
          <div className="hero-content container-narrow">
            <h1 className="text-[64px] md:text-[80px] leading-[0.9] font-thin mb-8">
              Your website has untapped potential
            </h1>
            <p className="text-header opacity-70 mb-0 max-w-[900px] mx-auto">
              We analyze hundreds of data points to show you what to fix and
              what it's worth.
            </p>

            {/* CTA Button with Pulsing Rings */}
            <div
              className="relative inline-block -mt-[200px] md:-mt-[80px]"
              data-testid="hero-section"
            >
              <div className="pressure-visual">
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

            {/* Animated Arrow */}
            <div className="arrow-container" aria-hidden="true">
              <div className="scroll-arrow">
                <span></span>
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Section */}
        <section id="assessment" className="section examples-section">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-header text-center">What This Looks Like</h2>

            <div className="assessment-grid">
              <div className="text-center reveal-card" data-delay="0">
                <div className="text-number" style={{ color: '#FFC107' }}>
                  4.8s
                </div>
                <h3 className="text-[24px] md:text-[24px] text-[20px] mb-3">
                  Load Performance
                </h3>
                <p className="text-[17px] md:text-[17px] text-[15px] opacity-60 leading-[1.6]">
                  How fast your site loads on real devices, and what it's
                  costing you in lost customers.
                </p>
              </div>

              <div className="text-center reveal-card" data-delay="150">
                <div className="text-number" style={{ color: '#DC2626' }}>
                  47%
                </div>
                <h3 className="text-[24px] md:text-[24px] text-[20px] mb-3">
                  Mobile Experience
                </h3>
                <p className="text-[17px] md:text-[17px] text-[15px] opacity-60 leading-[1.6]">
                  Where mobile visitors fail to convert, with specific
                  breakpoints identified.
                </p>
              </div>

              <div className="text-center reveal-card" data-delay="300">
                <div className="text-number" style={{ color: '#22C55E' }}>
                  $$
                </div>
                <h3 className="text-[24px] md:text-[24px] text-[20px] mb-3">
                  Revenue Impact
                </h3>
                <p className="text-[17px] md:text-[17px] text-[15px] opacity-60 leading-[1.6]">
                  Estimated monthly revenue loss from technical issues,
                  calculated for your specific market.
                </p>
              </div>
            </div>

            <p
              className="text-center text-[24px] md:text-[24px] text-[20px] font-normal opacity-70 reveal-tagline"
              data-delay="450"
            >
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
   • First-page ranking → 30 % click rate vs < 2 % page 2 (Backlinko CTR Study, 2023)
   • Missing trust signals → 42 % abandonment rate (Baymard Institute, 2024)
   • Mobile responsive → 67 % traffic shift (StatCounter, US, 2024)
   • Poor mobile UX → 3.5 × higher bounce (Think with Google, 2023)

4. Industry channel mix – We adjust for your specific industry's digital reliance. A plumber gets 20 % of leads online while SaaS runs closer to 95 %.

Result: revenue-per-point lets us rank every issue by its likely dollar impact on your specific business.`,
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className="faq-question">
                    {faq.q}
                    <span className="faq-toggle">+</span>
                  </div>
                  <div className="faq-answer whitespace-pre-line">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-[60px] border-t border-smoke">
          <div className="container-narrow text-center">
            {/* Logo removed from footer */}
            <div className="footer-links mt-[30px]">
              <a href="/legal">Privacy & Terms</a>
              <a href="mailto:hello@anthrasite.io">Contact</a>
            </div>
            <p className="text-[14px] opacity-30 mt-[20px]">
              © {new Date().getFullYear()} Anthrasite. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      {/* Modal */}
      <div
        className={`modal ${showModal ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal()
        }}
      >
        <div className="modal-container container-form">
          <button className="modal-close" onClick={closeModal}>
            ×
          </button>

          {step === 'domain' && (
            <>
              <h3 className="text-[32px] md:text-[32px] text-[24px] mb-6">
                Join the Waitlist
              </h3>
              <p className="text-[17px] md:text-[17px] text-[15px] opacity-70 mb-8">
                We're currently assessing targeted SMB websites. Provide your
                information below and we'll review your site and contact you as
                soon as we launch.
              </p>
              <form onSubmit={handleEmailSubmit}>
                <div className="form-group">
                  <label className="form-label">Your website URL</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Business email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="form-input"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <button
                  type="submit"
                  className="cta-primary button-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="text-center">
              <h3 className="text-[32px] md:text-[32px] text-[24px] mb-6">
                You're on the list!
              </h3>
              <p className="text-[17px] md:text-[17px] text-[15px] opacity-70 mb-8">
                We'll analyze {domain} and send your report to {email} as soon
                as we launch.
              </p>
              <button onClick={closeModal} className="cta-primary">
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      <ScrollToTop />
    </div>
  )
}
