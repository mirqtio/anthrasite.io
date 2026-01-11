'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/Logo'
import { FAQSection } from '@/components/landing/FAQSection'
import { IntakeModal } from '@/components/self-serve/IntakeModal'
import { ProgressView } from '@/components/self-serve/ProgressView'
import type { FAQItem } from '@/lib/landing/types'
import { Check, ArrowRight, Loader2 } from 'lucide-react'

// =============================================================================
// FAQ Content
// =============================================================================

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What does Anthrasite do?',
    answer:
      "We analyze your website using industry-standard tools and visual assessments. Then we convert the findings into a prioritized list of what affects your business—not just what's technically wrong.",
  },
  {
    question: 'Do you actually look at my website?',
    answer:
      "Yes. We run automated scans for speed, security, and mobile performance. We also do a visual review of what your customers actually see. No login required—we only look at what's public.",
  },
  {
    question: 'How is this different from free tools?',
    answer:
      "Free tools give you numbers. We tell you which numbers matter for your business—and what they're costing you. Everything is prioritized by business impact, not technical severity.",
  },
  {
    question: 'Where does the revenue impact number come from?',
    answer:
      'We combine what we find on your site with your industry, location, and the revenue estimate you provide. The model weights issues by where they fall in the customer journey and how severely they deviate from benchmarks.',
  },
  {
    question: 'What happens after I purchase?',
    answer:
      "You'll receive your report as a PDF within a few minutes. It includes everything: your score, all issues prioritized by impact, difficulty ratings, and the metrics behind each finding.",
  },
  {
    question: "What if it doesn't pay off?",
    answer:
      "The report pays for itself or it's free. Give it a real shot. If you don't see enough improvement to cover the cost within 90 days, email us for a full refund.",
  },
]

// =============================================================================
// How It Works Steps
// =============================================================================

const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    title: 'Find',
    question: 'Can customers discover your business?',
    description:
      "If you don't show up in search results or on maps, nothing else matters.",
  },
  {
    number: 2,
    title: 'Trust',
    question: 'Does your site inspire confidence?',
    description:
      'Visitors decide in seconds whether your business feels legitimate.',
  },
  {
    number: 3,
    title: 'Understand',
    question: 'Is it clear what you offer?',
    description: "Confused visitors don't become customers.",
  },
  {
    number: 4,
    title: 'Contact',
    question: 'Can interested visitors take action?',
    description: 'This is where browsers become buyers.',
  },
  {
    number: 5,
    title: 'Your Business',
    question: 'We calculate what these issues cost you.',
    description:
      'Not all problems matter equally—we show you which ones move the needle for your business.',
  },
]

// =============================================================================
// Testimonials
// =============================================================================

const TESTIMONIALS = [
  {
    quote:
      'We were surprised by our low score—professional photos, premium look, clear calls to action. Then I saw how few people were actually finding us in local searches. That one insight changed our whole priority list.',
    name: 'Chelsea',
    titleCompany: 'Partner, Invest in Yakima',
  },
  {
    quote:
      "I was bracing for a laundry list of expensive fixes. Instead, I got two things I could do this week—and suddenly all the branding work we'd already done would actually get seen.",
    name: 'Kelly',
    titleCompany: 'Owner, Mandala Integrative Veterinary Care',
  },
  {
    quote:
      'It clearly connected performance metrics to real business impact—showing not just what needed improvement, but how each issue could be costing us visibility, trust, and revenue.',
    name: 'Madeline',
    titleCompany: 'Owner, The Parlor Room, Virginia Beach',
  },
]

// =============================================================================
// Shared Button Styles
// =============================================================================

const PRIMARY_BUTTON_CLASSES =
  'inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] disabled:opacity-50 text-white text-[18px] min-[800px]:text-[20px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed'

// =============================================================================
// Main Component
// =============================================================================

export function OrganicHomepage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [emailError, setEmailError] = useState('')

  // Modal/progress state
  const [showIntakeModal, setShowIntakeModal] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [normalizedUrl, setNormalizedUrl] = useState('')

  // URL validation - matches domain with TLD (e.g., example.com, my-site.co.uk)
  const isValidUrl = (input: string): boolean => {
    const trimmed = input.trim().toLowerCase()
    // Remove protocol if present
    const withoutProtocol = trimmed.replace(/^https?:\/\//, '')
    // Remove www if present
    const withoutWww = withoutProtocol.replace(/^www\./, '')
    // Check for valid domain pattern: alphanumeric with optional hyphens, dot, TLD (2+ chars)
    const domainPattern =
      /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)*\.[a-z]{2,}(\/.*)?$/
    return domainPattern.test(withoutWww)
  }

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setUrlError('Please enter a website URL')
      return false
    }
    if (!isValidUrl(value)) {
      setUrlError('Please enter a valid website (e.g., yourcompany.com)')
      return false
    }
    setUrlError('')
    return true
  }

  // Email validation - standard email format check
  const isValidEmail = (input: string): boolean => {
    const trimmed = input.trim().toLowerCase()
    // Standard email pattern: local@domain.tld
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    return emailPattern.test(trimmed)
  }

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Please enter your email')
      return false
    }
    if (!isValidEmail(value)) {
      setEmailError('Please enter a valid email (e.g., you@company.com)')
      return false
    }
    setEmailError('')
    return true
  }
  const [showStickyCta, setShowStickyCta] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const mainCtaRef = useRef<HTMLButtonElement>(null)

  // Show sticky CTA when main CTA button leaves viewport
  useEffect(() => {
    const ctaButton = mainCtaRef.current
    if (!ctaButton) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky CTA when the main CTA button is NOT in viewport
        setShowStickyCta(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: '0px',
      }
    )

    observer.observe(ctaButton)

    return () => observer.disconnect()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      urlInputRef.current?.focus()
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Trigger validation (same as blur) for any untouched fields
    const urlValid = validateUrl(url)
    const emailValid = validateEmail(email)

    // Stop if either field is invalid or empty
    if (!urlValid || !emailValid) return

    setError('')

    // Normalize the domain
    let normalized = url.trim()
    if (
      !normalized.startsWith('http://') &&
      !normalized.startsWith('https://')
    ) {
      normalized = 'https://' + normalized
    }
    setNormalizedUrl(normalized)

    // Open the intake modal (it will call validate endpoint)
    setShowIntakeModal(true)
  }

  const handleIntakeSubmitSuccess = (newRequestId: string) => {
    setRequestId(newRequestId)
    setShowIntakeModal(false)
    setShowProgress(true)
  }

  const handleCloseIntakeModal = () => {
    setShowIntakeModal(false)
  }

  const handleCloseProgress = () => {
    setShowProgress(false)
    setRequestId(null)
  }

  // Extract domain from normalized URL for display
  const getDomainFromUrl = (urlStr: string): string => {
    try {
      const u = new URL(urlStr)
      return u.hostname.replace(/^www\./, '')
    } catch {
      return urlStr
    }
  }

  return (
    <div
      id="organic-homepage-wrapper"
      className="min-h-screen font-[Inter,system-ui,sans-serif]"
    >
      {/* ===================================================================== */}
      {/* Navigation */}
      {/* ===================================================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#232323]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-5 min-[800px]:px-10 py-4 min-[800px]:py-5 flex items-center justify-between">
          <div className="logo-container">
            <button onClick={scrollToTop} className="flex flex-col w-fit">
              <Logo size="medium" darkMode className="logo-mobile" />
              <div className="tagline text-[10px] min-[800px]:text-[13px] font-light opacity-70 mt-1 flex justify-between">
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
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden min-[800px]:flex items-center space-x-8">
            <a
              href="#how-it-works"
              className="text-[17px] text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              How It Works
            </a>
            <a
              href="#faq"
              className="text-[17px] text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              FAQ
            </a>
            <Link
              href="/about"
              className="text-[17px] text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              About Us
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="min-[800px]:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 relative z-50"
            aria-label="Toggle menu"
            aria-expanded={showMobileMenu}
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? 'opacity-0' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#232323] z-40 transition-opacity duration-300 min-[800px]:hidden ${
          showMobileMenu
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <a
            href="#how-it-works"
            className="text-[24px] text-white opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          >
            How It Works
          </a>
          <a
            href="#faq"
            className="text-[24px] text-white opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          >
            FAQ
          </a>
          <Link
            href="/about"
            className="text-[24px] text-white opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          >
            About Us
          </Link>
        </div>
      </div>

      <main>
        {/* ===================================================================== */}
        {/* Hero Section (Dark) */}
        {/* ===================================================================== */}
        <section className="bg-[#232323] pt-24 min-[800px]:pt-32">
          <div className="landing-container">
            <div className="flex flex-col pb-20 min-[800px]:pb-24">
              {/* Headline */}
              <div className="text-center mt-12 mb-24">
                <h1 className="text-white text-[48px] min-[800px]:text-[64px] font-thin leading-[1.1] mb-24">
                  Is your website costing you customers?
                </h1>
                <p className="text-white/60 text-[18px] min-[800px]:text-[20px] max-w-[700px] mx-auto leading-[1.6] tracking-[0.02em]">
                  Find out in 2 minutes. We analyze your site and show you
                  what's broken, what it's worth, and what to fix first.
                </p>
              </div>

              {/* Intake Form - Horizontal on desktop, vertical on mobile */}
              <div className="bg-white/10 rounded-2xl p-6 min-[800px]:p-8 max-w-3xl mx-auto w-full">
                <p className="text-white/80 text-[16px] min-[800px]:text-[18px] mb-4 tracking-[0.02em]">
                  Enter any website to analyze it and your email so we can send
                  you the report.
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col min-[800px]:flex-row gap-4 min-[800px]:items-end"
                >
                  <div className="flex-1">
                    <label className="block text-white/80 text-sm font-medium mb-1 tracking-[0.02em]">
                      Website URL
                    </label>
                    <input
                      ref={urlInputRef}
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (urlError) validateUrl(e.target.value)
                      }}
                      onBlur={(e) => validateUrl(e.target.value)}
                      placeholder="yourcompany.com"
                      className={`block w-full rounded-md border-0 shadow-sm px-4 py-3 text-gray-900 bg-white text-[16px] ${
                        urlError ? 'ring-2 ring-red-500' : ''
                      }`}
                    />
                    <p
                      className={`text-red-400 text-sm mt-1 h-5 transition-opacity ${urlError ? 'opacity-100' : 'opacity-0'}`}
                    >
                      {urlError || '\u00A0'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <label className="block text-white/80 text-sm font-medium mb-1 tracking-[0.02em]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) validateEmail(e.target.value)
                      }}
                      onBlur={(e) => validateEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={`block w-full rounded-md border-0 shadow-sm px-4 py-3 text-gray-900 bg-white text-[16px] ${
                        emailError ? 'ring-2 ring-red-500' : ''
                      }`}
                      autoComplete="email"
                    />
                    <p
                      className={`text-red-400 text-sm mt-1 h-5 transition-opacity ${emailError ? 'opacity-100' : 'opacity-0'}`}
                    >
                      {emailError || '\u00A0'}
                    </p>
                  </div>
                  <div className="min-[800px]:flex-shrink-0">
                    {/* Spacer to match label height on desktop */}
                    <div className="hidden min-[800px]:block h-[22px]" />
                    <button
                      ref={mainCtaRef}
                      type="submit"
                      disabled={isSubmitting}
                      className={`${PRIMARY_BUTTON_CLASSES} focus-visible:ring-offset-[#232323] w-full min-[800px]:w-auto`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze Website</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    {/* Spacer to match error message height on desktop */}
                    <div className="hidden min-[800px]:block h-5 mt-1" />
                  </div>
                </form>
                {error && (
                  <div className="text-red-400 text-sm mt-3">{error}</div>
                )}
              </div>

              {/* Trust Signals - 48px below form */}
              <div className="flex flex-col min-[800px]:flex-row items-center justify-center gap-4 min-[800px]:gap-8 text-white/60 text-[14px] tracking-[0.02em] mt-12">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>See your score and top issue free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Results in under 2 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of page - Light background */}
        <div className="bg-[#F8F9FA]">
          <div className="landing-container">
            <div className="flex flex-col gap-20 min-[800px]:gap-24 py-20 min-[800px]:py-24">
              {/* ===================================================================== */}
              {/* How It Works Section */}
              {/* ===================================================================== */}
              <section id="how-it-works" className="scroll-mt-24">
                <div className="container-narrow">
                  <div className="text-center mb-12">
                    <h2 className="text-slate-900 text-[28px] min-[800px]:text-[32px] font-semibold leading-tight tracking-[0.02em] mb-4">
                      How It Works
                    </h2>
                    <p className="text-slate-600 text-[18px] min-[800px]:text-[20px] leading-[1.6] tracking-[0.02em]">
                      We check your site against what actually drives
                      customers—then tell you what to fix first.
                    </p>
                  </div>

                  <div className="flex flex-col gap-8">
                    {HOW_IT_WORKS_STEPS.map((step) => (
                      <div key={step.number} className="flex gap-4">
                        {/* Blue bullet */}
                        <div
                          className="w-2 h-2 rounded-full bg-[#0066FF] flex-shrink-0 mt-2.5"
                          aria-hidden="true"
                        />
                        {/* Content */}
                        <div>
                          <span className="text-slate-900 text-[18px] min-[800px]:text-[20px] font-semibold tracking-[0.02em]">
                            {step.title}
                          </span>
                          <span className="text-slate-900 text-[18px] min-[800px]:text-[20px] tracking-[0.02em]">
                            {' '}
                            — {step.question}
                          </span>
                          <span className="text-slate-600 text-[18px] min-[800px]:text-[20px] tracking-[0.02em]">
                            {' '}
                            {step.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CTA - Hidden on mobile, sticky CTA handles it */}
              <div className="hidden min-[800px]:block text-center">
                <button
                  onClick={scrollToTop}
                  className={`${PRIMARY_BUTTON_CLASSES} focus-visible:ring-offset-[#F8F9FA]`}
                >
                  <span>Analyze Website</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* ===================================================================== */}
              {/* What You Get Section */}
              {/* ===================================================================== */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-slate-900 text-[28px] min-[800px]:text-[32px] font-semibold leading-tight tracking-[0.02em]">
                    What You Get
                  </h2>
                </div>

                <div className="flex flex-col gap-12 min-[800px]:grid min-[800px]:grid-cols-2 min-[800px]:gap-12 min-[800px]:items-start max-w-4xl mx-auto mb-12">
                  {/* Report Preview with stacked pages effect */}
                  <div className="relative w-3/4 mx-auto">
                    {/* Background pages */}
                    <div className="absolute inset-0 rounded-2xl bg-white ring-1 ring-black/10 transform rotate-3 translate-x-1 -translate-y-1" />
                    <div className="absolute inset-0 rounded-2xl bg-white ring-1 ring-black/10 transform rotate-[1.5deg] translate-x-0.5 -translate-y-0.5" />
                    {/* Main image */}
                    <Image
                      src="/images/report-preview-page1.png"
                      alt="Sample Anthrasite report showing score, revenue impact, and top priorities"
                      width={612}
                      height={792}
                      className="relative w-full h-auto rounded-2xl shadow-sm ring-1 ring-black/5"
                      priority
                    />
                  </div>

                  {/* Features List */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-slate-900 text-[18px] font-semibold tracking-[0.02em] mb-4">
                        Your free analysis shows:
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-[16px] tracking-[0.02em]">
                            Your score (0–100)
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-[16px] tracking-[0.02em]">
                            Your top issue and why it matters
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-[16px] tracking-[0.02em]">
                            Estimated monthly revenue impact
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-slate-900 text-[18px] font-semibold tracking-[0.02em] mb-4">
                        The full report ($199) adds:
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-[16px] tracking-[0.02em]">
                            All issues prioritized by impact
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-[16px] tracking-[0.02em]">
                            Difficulty rating for each fix
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-[16px] tracking-[0.02em]">
                            The metrics behind every finding
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-[16px] tracking-[0.02em]">
                            Plain-language explanations
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Guarantee Box */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6 min-[800px]:p-8 text-center max-w-[600px] mx-auto mb-12">
                  <p className="text-slate-600 text-[15px] min-[800px]:text-[16px] leading-[1.6] tracking-[0.02em]">
                    The report pays for itself or it's free. Give it a real
                    shot. If you don't see enough improvement to cover the cost
                    within 90 days, email us for a full refund.
                  </p>
                </div>

                {/* Section CTA - Hidden on mobile, sticky CTA handles it */}
                <div className="hidden min-[800px]:block text-center">
                  <button
                    onClick={scrollToTop}
                    className={`${PRIMARY_BUTTON_CLASSES} focus-visible:ring-offset-[#F8F9FA]`}
                  >
                    <span>Analyze Website</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </section>

              {/* ===================================================================== */}
              {/* Testimonials Section */}
              {/* ===================================================================== */}
              <section>
                <div className="flex flex-col gap-10">
                  <h2 className="text-[28px] min-[800px]:text-[32px] font-semibold text-slate-900 text-center tracking-[0.02em]">
                    What Our Customers Say
                  </h2>

                  {/* Desktop: 3-column grid */}
                  <div className="hidden gap-6 min-[800px]:grid min-[800px]:grid-cols-3 min-[800px]:max-w-5xl min-[800px]:mx-auto">
                    {TESTIMONIALS.map((t) => (
                      <figure
                        key={t.name}
                        className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5"
                      >
                        <blockquote>
                          <p className="text-[18px] leading-relaxed text-black tracking-[0.02em]">
                            &ldquo;{t.quote}&rdquo;
                          </p>
                        </blockquote>
                        <figcaption className="mt-6 text-slate-600 tracking-[0.02em]">
                          <span className="font-semibold">{t.name}</span>
                          {', '}
                          <span>{t.titleCompany}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>

                  {/* Mobile: horizontal scroll with snap */}
                  <div className="min-[800px]:hidden">
                    <div
                      className="
                        flex gap-4 overflow-x-auto overscroll-x-contain
                        scroll-smooth
                        snap-x snap-mandatory
                        px-6
                        -mx-6
                        pb-2
                        [scrollbar-width:none]
                        [&::-webkit-scrollbar]:hidden
                      "
                    >
                      {TESTIMONIALS.map((t) => (
                        <figure
                          key={t.name}
                          className="
                            snap-center
                            shrink-0
                            w-[85%]
                            rounded-2xl bg-white p-8
                            shadow-sm ring-1 ring-black/5
                          "
                        >
                          <blockquote>
                            <p className="text-[18px] leading-relaxed text-black tracking-[0.02em]">
                              &ldquo;{t.quote}&rdquo;
                            </p>
                          </blockquote>
                          <figcaption className="mt-6 text-slate-600 tracking-[0.02em]">
                            <span className="font-semibold">{t.name}</span>
                            {', '}
                            <span>{t.titleCompany}</span>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ===================================================================== */}
              {/* FAQ Section */}
              {/* ===================================================================== */}
              <section id="faq" className="scroll-mt-24">
                <div className="container-narrow">
                  <FAQSection items={FAQ_ITEMS} />
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 pb-24 min-[800px]:pb-8 border-t border-slate-200">
            <div className="text-center px-6">
              {/* Links row */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 min-[800px]:gap-x-6 text-[13px] min-[800px]:text-[14px] leading-tight">
                <Link
                  href="/legal/privacy"
                  className="text-slate-500 hover:text-slate-700 transition-colors leading-tight"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/legal/terms"
                  className="text-slate-500 hover:text-slate-700 transition-colors leading-tight"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/legal/refund-policy"
                  className="text-slate-500 hover:text-slate-700 transition-colors leading-tight"
                >
                  Refund Policy
                </Link>
                <Link
                  href="/legal/do-not-sell"
                  className="text-slate-500 hover:text-slate-700 transition-colors leading-tight"
                >
                  Do Not Sell
                </Link>
                <a
                  href="mailto:hello@anthrasite.io"
                  className="text-slate-500 hover:text-slate-700 transition-colors leading-tight"
                >
                  Contact
                </a>
              </div>
              {/* Copyright */}
              <p className="text-[13px] text-slate-400 mt-4">
                © {new Date().getFullYear()} Anthrasite. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </main>

      {/* ===================================================================== */}
      {/* Mobile Sticky CTA */}
      {/* ===================================================================== */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[1100] min-[800px]:hidden transition-transform duration-300 ${
          showStickyCta ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        role="complementary"
        aria-label="Quick action"
      >
        <div className="bg-[#141414]/95 border-t border-white/10 px-3 py-2 safe-area-inset-bottom">
          <button
            onClick={scrollToTop}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#004099] text-white rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2"
          >
            <span className="text-[18px] font-semibold tracking-[0.02em]">
              Analyze Website
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* Intake Modal */}
      {/* ===================================================================== */}
      <IntakeModal
        isOpen={showIntakeModal}
        onClose={handleCloseIntakeModal}
        url={normalizedUrl}
        email={email}
        onSubmitSuccess={handleIntakeSubmitSuccess}
      />

      {/* ===================================================================== */}
      {/* Progress View */}
      {/* ===================================================================== */}
      {showProgress && requestId && (
        <ProgressView
          requestId={requestId}
          domain={getDomainFromUrl(normalizedUrl)}
          onClose={handleCloseProgress}
        />
      )}
    </div>
  )
}
