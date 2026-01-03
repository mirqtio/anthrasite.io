'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRenderTracking } from '@/lib/monitoring/hooks'
import { Logo } from '@/components/Logo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { FAQSection } from '@/components/landing/FAQSection'
import type { FAQItem } from '@/lib/landing/types'
import {
  WaitlistFormIds,
  WaitlistA11y,
} from '@/lib/testing/waitlistFormContract'

// Static FAQ content
const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What does Anthrasite do?',
    answer:
      'Our goal is to help small businesses. We analyze your website using industry-standard tools and visual assessments. Then we convert the findings into a prioritized list of what affects your business.',
  },
  {
    question: 'How do you analyze my site?',
    answer:
      'We use public scanning tools to check speed, security, and mobile performance. We also do a visual review of the customer experience. No login or access required—we only look at what your visitors see.',
  },
  {
    question: 'What exactly do I get in the full report?',
    answer:
      'A detailed analysis of your site, organized by what matters most to your bottom line. A score and estimated revenue impact. Specific issues prioritized by impact with non-technical explanations. And detailed metrics for everything we measure.',
  },
  {
    question: "What if it doesn't pay off?",
    answer:
      "The report pays for itself or it's free. Give it a real shot. If you don't see the value after 90 days, email us for a full refund.",
  },
  {
    question: 'How can I contact you?',
    answer: 'Email us at hello@anthrasite.io.',
  },
]

export function OrganicHomepage() {
  // useRenderTracking('OrganicHomepage')
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
            <a
              href="#assessment"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              Method
            </a>
            <a
              href="#faq"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              FAQ
            </a>
            <a
              href="/about"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              About Us
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 relative z-50"
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#232323] border-t border-white/5 z-50">
            <div className="flex flex-col py-4">
              <a
                href="#assessment"
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                Method
              </a>
              <a
                href="#faq"
                className="px-5 py-3 text-[17px] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowMobileMenu(false)}
              >
                FAQ
              </a>
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
            <h2 className="text-[28px] md:text-[32px] font-medium opacity-70 mb-8 md:mb-0 max-w-[900px] mx-auto tracking-[0.02em]">
              We analyze hundreds of data points to show you what to fix and
              what it's worth.
            </h2>

            {/* CTA Button with Pulsing Rings */}
            <div
              className="relative w-full md:inline-block mt-0 md:-mt-[80px]"
              data-testid="hero-home"
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
                    data-testid={WaitlistFormIds.openButton}
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
            <h3 className="text-header text-center">What This Looks Like</h3>

            <div className="assessment-grid">
              <div className="text-center reveal-card" data-delay="0">
                <div className="text-number" style={{ color: '#FFC107' }}>
                  4.8s
                </div>
                <h4 className="text-[18px] md:text-[20px] font-medium mb-3">
                  Load Performance
                </h4>
                <p className="text-[18px] md:text-[20px] font-medium opacity-60 leading-[1.6] tracking-[0.02em]">
                  How fast your site loads on real devices, and what it's
                  costing you in lost customers.
                </p>
              </div>

              <div className="text-center reveal-card" data-delay="150">
                <div className="text-number" style={{ color: '#DC2626' }}>
                  47%
                </div>
                <h4 className="text-[18px] md:text-[20px] font-medium mb-3">
                  Mobile Experience
                </h4>
                <p className="text-[18px] md:text-[20px] font-medium opacity-60 leading-[1.6] tracking-[0.02em]">
                  Where mobile visitors fail to convert, with specific
                  breakpoints identified.
                </p>
              </div>

              <div className="text-center reveal-card" data-delay="300">
                <div className="text-number" style={{ color: '#22C55E' }}>
                  $$
                </div>
                <h4 className="text-[18px] md:text-[20px] font-medium mb-3">
                  Revenue Impact
                </h4>
                <p className="text-[18px] md:text-[20px] font-medium opacity-60 leading-[1.6] tracking-[0.02em]">
                  Estimated monthly revenue loss from technical issues,
                  calculated for your specific market.
                </p>
              </div>
            </div>

            <p
              className="text-center text-[20px] md:text-[24px] font-medium opacity-70 tracking-[0.02em] reveal-tagline"
              data-delay="450"
            >
              No fluff. No 50-page reports. Just what's broken and what it's
              worth to fix it.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="section" aria-labelledby="faq-heading">
          <div className="container-tight">
            <FAQSection items={FAQ_ITEMS} />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-[60px] border-t border-white/5">
          <div className="container-narrow text-center">
            {/* Logo removed from footer */}
            <div className="footer-links mt-[30px]">
              <a href="/legal/privacy">Privacy Policy</a>
              <a href="/legal/terms">Terms of Service</a>
              <a href="/legal/refund-policy">Refund policy</a>
              <a href="/legal/do-not-sell">
                Do Not Sell or Share My Personal Information
              </a>
              <a href="mailto:hello@anthrasite.io">Contact</a>
            </div>
            <p className="text-[14px] opacity-50 mt-[20px]">
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
              <p className="text-[18px] md:text-[20px] opacity-70 mb-8">
                We're currently assessing targeted SMB websites. Provide your
                information below and we'll review your site and contact you as
                soon as we launch.
              </p>
              <form
                role={WaitlistA11y.formRole}
                data-testid={WaitlistFormIds.form}
                onSubmit={handleEmailSubmit}
              >
                <div className="form-group">
                  <label
                    htmlFor={WaitlistFormIds.domainInput}
                    className="form-label"
                  >
                    Your website URL
                  </label>
                  <input
                    id={WaitlistFormIds.domainInput}
                    data-testid={WaitlistFormIds.domainInput}
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor={WaitlistFormIds.emailInput}
                    className="form-label"
                  >
                    Business email
                  </label>
                  <input
                    id={WaitlistFormIds.emailInput}
                    data-testid={WaitlistFormIds.emailInput}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="form-input"
                    autoComplete="email"
                    required
                  />
                </div>
                {error && (
                  <div
                    role="alert"
                    data-testid={WaitlistFormIds.errorBanner}
                    className="text-red-500 text-sm mb-4"
                  >
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  data-testid={WaitlistFormIds.submitButton}
                  className="cta-primary button-full"
                  disabled={isSubmitting}
                  aria-label="Join waitlist"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div
                role="status"
                data-testid={WaitlistFormIds.successBanner}
                aria-live="polite"
              >
                <h3 className="text-[32px] md:text-[32px] text-[24px] mb-6">
                  You're on the list!
                </h3>
                <p className="text-[18px] md:text-[20px] opacity-70 mb-8">
                  We'll analyze {domain} and send your report to {email} as soon
                  as we launch.
                </p>
              </div>
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
