'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, ArrowRight, Circle, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import Link from 'next/link'
import Image from 'next/image'

// ============================================================================
// Progress Page Mockups
// ============================================================================

const PROGRESS_STEPS = [
  {
    label: 'Find',
    title: 'Can customers discover your business?',
    description:
      "If people can't find you in search results or on maps, nothing else matters. We look at local search presence, page speed, and the technical signals Google uses to decide what to show.",
  },
  {
    label: 'Trust',
    title: 'Does your website inspire confidence?',
    description:
      'Visitors decide in seconds whether your business feels legitimate. We look at security indicators, reviews, professional presentation—the signals that make people stay or leave.',
  },
  {
    label: 'Understand',
    title: 'Is it clear what you offer?',
    description:
      'Once visitors stay, they need to quickly grasp your value. We assess your layout, messaging, and how easily someone can understand what makes you different.',
  },
  {
    label: 'Contact',
    title: 'Can interested visitors take action?',
    description:
      'This is where browsers become buyers. We check whether your calls-to-action are visible, contact info is findable, and everything works on mobile.',
  },
  {
    label: 'Impact',
    title: 'Calculating what matters for you',
    description:
      "Every website has issues. The question is which ones matter for yours. We're combining what we found with your industry, location, and size to calculate what these problems are actually costing you—and which fixes will move the needle most.",
  },
]

function ProgressPageRunning({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const isLastStep = currentStep === PROGRESS_STEPS.length - 1

  useEffect(() => {
    if (currentStep < PROGRESS_STEPS.length - 1) {
      // Steps 1-4: 20 seconds each
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 20000)
      return () => clearTimeout(timer)
    } else {
      // Last step (Impact): holds until ready, then auto-completes after 5s for demo
      const timer = setTimeout(() => {
        onComplete?.()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, onComplete])

  return (
    <div className="bg-[#232323] min-h-[600px] p-8 flex flex-col">
      <div className="mb-16">
        <Logo size="medium" darkMode />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
        <h1 className="text-white text-[32px] md:text-[48px] font-thin mb-12 text-center">
          Analyzing acmeplumbing.com...
        </h1>

        <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-0">
          {/* Left: Progress checklist */}
          <div className="flex flex-col gap-4 md:mr-12">
            {PROGRESS_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                {i < currentStep ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : i === currentStep ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40" />
                )}
                <span
                  className={
                    i < currentStep
                      ? 'text-white/60'
                      : i === currentStep
                        ? 'text-white'
                        : 'text-white/40'
                  }
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Right: Step explanation */}
          <div className="bg-white/5 rounded-xl p-6 max-w-md">
            <h3 className="text-white text-[20px] font-medium mb-2">
              {PROGRESS_STEPS[currentStep].title}
            </h3>
            <p className="text-white/70 text-[15px] leading-relaxed">
              {PROGRESS_STEPS[currentStep].description}
            </p>
          </div>
        </div>

        <p className="text-white/60 text-[16px] mt-12 text-center">
          This usually takes about 90 seconds.
        </p>
        <p className="text-white/40 text-[14px] mt-4 text-center">
          We&apos;ll email you when it&apos;s ready.
        </p>
      </div>
    </div>
  )
}

function ProgressPageReady({ onComplete }: { onComplete?: () => void }) {
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Start redirect after animation completes
    const timer = setTimeout(() => {
      setRedirecting(true)
    }, 1500)

    // Navigate to landing page mockup
    const redirectTimer = setTimeout(() => {
      onComplete?.()
    }, 2500)

    return () => {
      clearTimeout(timer)
      clearTimeout(redirectTimer)
    }
  }, [onComplete])

  return (
    <div className="bg-[#232323] min-h-[600px] p-8 flex flex-col">
      <div className="mb-16">
        <Logo size="medium" darkMode />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        {/* Animated checkmark */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-green-500/40 flex items-center justify-center animate-[scale-in_0.5s_ease-out_0.1s_both]">
              <Check
                className="w-10 h-10 text-green-500 animate-[scale-in_0.3s_ease-out_0.3s_both]"
                strokeWidth={3}
              />
            </div>
          </div>
        </div>

        <h1 className="text-white text-[32px] md:text-[48px] font-thin mb-4 animate-[fade-in_0.5s_ease-out_0.4s_both]">
          Analysis complete
        </h1>

        <p className="text-white/60 text-[18px] animate-[fade-in_0.5s_ease-out_0.6s_both]">
          {redirecting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to your results...
            </span>
          ) : (
            'Preparing your results...'
          )}
        </p>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function ProgressPageError() {
  return (
    <div className="bg-[#232323] min-h-[600px] p-8 flex flex-col">
      <div className="mb-16">
        <Logo size="medium" darkMode />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        <h1 className="text-white text-[32px] md:text-[48px] font-thin mb-6">
          Something went wrong
        </h1>

        <p className="text-white/60 text-[18px] mb-8">
          We couldn&apos;t complete the analysis.
          <br />
          Please try again or contact{' '}
          <a
            href="mailto:support@anthrasite.io"
            className="text-[#0066FF] hover:underline"
          >
            support@anthrasite.io
          </a>
        </p>

        <button
          onClick={() => (window.location.href = '/')}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] text-white text-[18px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] transition-all duration-200"
        >
          <span>Try Again</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Landing Page Mockup
// ============================================================================

function LandingPageMockup() {
  return (
    <div className="bg-[#232323]">
      <Image
        src="/mockups/landing-page-preview.png"
        alt="Landing page preview"
        width={1200}
        height={900}
        className="w-full h-auto"
        priority
      />
    </div>
  )
}

// ============================================================================
// Intake Modal Mockups
// ============================================================================

function IntakeLoading({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="bg-black/50 backdrop-blur-sm min-h-[500px] p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 text-gray-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[18px]">Checking site availability...</span>
        </div>
      </div>
    </div>
  )
}

function IntakeForm({ onSubmit }: { onSubmit?: () => void }) {
  const [selectedRevenue, setSelectedRevenue] = useState(2) // Default to $25k-$75k

  const revenueOptions = [
    { label: 'Under $10k', value: 'under-10k' },
    { label: '$10k-$25k', value: '10k-25k' },
    { label: '$25k-$75k', value: '25k-75k' },
    { label: '$75k-$125k', value: '75k-125k' },
    { label: '$125k-$200k', value: '125k-200k' },
    { label: 'Over $200k', value: 'over-200k' },
  ]

  return (
    <div className="bg-black/50 backdrop-blur-sm min-h-[800px] p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-gray-900 text-[24px] font-semibold mb-6">
          Confirm Your Details
        </h2>

        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="Acme Plumbing LLC"
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11"
            />
          </div>

          {/* City, State, ZIP row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                City
              </label>
              <input
                type="text"
                defaultValue="Denver"
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                State
              </label>
              <select
                defaultValue="CO"
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11 bg-white"
              >
                <option value="">--</option>
                <option value="AL">AL</option>
                <option value="AK">AK</option>
                <option value="AZ">AZ</option>
                <option value="CA">CA</option>
                <option value="CO">CO</option>
                <option value="NY">NY</option>
                <option value="TX">TX</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                ZIP
              </label>
              <input
                type="text"
                defaultValue="80202"
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11"
              />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Industry
            </label>
            <select className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11 bg-white">
              <option value="23">Construction</option>
              <option value="54">Professional Services</option>
              <option value="62">Healthcare</option>
              <option value="44">Retail</option>
              <option value="51">Technology & Information</option>
              <option value="72">Restaurants & Hospitality</option>
              <option value="81">Personal & Other Services</option>
            </select>
          </div>

          <hr className="my-6" />

          {/* Revenue */}
          <div>
            <label className="block text-gray-900 font-medium mb-3">
              Monthly Revenue{' '}
              <span className="text-gray-500 font-normal">
                (estimate is fine)
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {revenueOptions.map((option, i) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all ${
                    selectedRevenue === i
                      ? 'border-[#0066FF] border-2 bg-blue-50 text-[#0066FF]'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                  onClick={() => setSelectedRevenue(i)}
                >
                  <input
                    type="radio"
                    name="revenue"
                    value={option.value}
                    className="sr-only"
                    checked={selectedRevenue === i}
                    onChange={() => setSelectedRevenue(i)}
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-6" />

          {/* Terms */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
                defaultChecked
              />
              <span className="text-sm text-gray-700">
                I accept the{' '}
                <a
                  href="/legal/terms"
                  className="text-[#0066FF] hover:underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/legal/privacy"
                  className="text-[#0066FF] hover:underline"
                >
                  Privacy Policy
                </a>{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
                defaultChecked
              />
              <span className="text-sm text-gray-700">
                Send me tips and updates
              </span>
            </label>
          </div>

          <button
            onClick={onSubmit}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white text-[16px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] transition-all duration-200 mt-4"
          >
            <span>Analyze My Website</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Homepage Entry Mockup
// ============================================================================

function HomepageEntry({ onSubmit }: { onSubmit?: () => void }) {
  return (
    <div className="bg-[#232323] min-h-[700px]">
      {/* Navigation - matches existing homepage */}
      <nav className="bg-[#232323]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5 flex items-center justify-between">
          <div className="logo-container">
            <a href="#" className="flex flex-col">
              <Logo size="medium" darkMode className="logo-mobile" />
              <div
                className="text-[10px] md:text-[13px] font-light opacity-70 mt-1 flex justify-between text-white"
                style={{ width: '100%', maxWidth: '140px' }}
              >
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
              className="text-[17px] text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              Method
            </a>
            <a
              href="#faq"
              className="text-[17px] text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              FAQ
            </a>
            <a
              href="/about"
              className="text-[17px] text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              About Us
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-white text-[48px] md:text-[80px] font-thin leading-[0.9] mb-8">
            Your website has
            <br />
            untapped potential
          </h1>
          <p className="text-white/70 text-[24px] md:text-[32px] font-medium max-w-[900px] mx-auto tracking-[0.02em]">
            We analyze hundreds of data points to show you what to fix and what
            it&apos;s worth.
          </p>
        </div>

        {/* Intake Form Card - replaces "Join Waitlist" CTA */}
        <div className="bg-white/10 rounded-2xl p-6 md:p-8 max-w-md mx-auto mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1">
                Your website URL
              </label>
              <input
                type="url"
                placeholder="yourcompany.com"
                className="block w-full rounded-md border-0 shadow-sm px-3 py-2.5 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1">
                Your email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className="block w-full rounded-md border-0 shadow-sm px-3 py-2.5 text-gray-900 bg-white"
              />
            </div>
            <button
              onClick={onSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white text-[16px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] transition-all duration-200"
            >
              <span>Analyze My Website</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white/60 text-[14px]">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>See your score before you pay</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Results in under 2 minutes</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Mockups Page
// ============================================================================

export default function MockupsPage() {
  const [activeTab, setActiveTab] = useState<
    'homepage' | 'intake' | 'progress' | 'landing'
  >('homepage')
  const [activeVariant, setActiveVariant] = useState(0)

  const tabs = [
    { id: 'homepage', label: '1. Homepage', variants: ['Default'] },
    { id: 'intake', label: '2. Intake Modal', variants: ['Loading', 'Form'] },
    {
      id: 'progress',
      label: '3. Progress Page',
      variants: ['Running', 'Ready', 'Error'],
    },
    { id: 'landing', label: '4. Landing Page', variants: ['Default'] },
  ] as const

  const goToIntakeLoading = () => {
    setActiveTab('intake')
    setActiveVariant(0)
  }

  const goToIntakeForm = () => {
    setActiveTab('intake')
    setActiveVariant(1)
  }

  const goToProgressRunning = () => {
    setActiveTab('progress')
    setActiveVariant(0)
  }

  const goToProgressReady = () => {
    setActiveTab('progress')
    setActiveVariant(1)
  }

  const goToLanding = () => {
    setActiveTab('landing')
    setActiveVariant(0)
  }

  const currentTab = tabs.find((t) => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              Self-Serve Mockups
            </h1>
            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Admin
            </Link>
          </div>

          {/* Tab buttons */}
          <div className="flex gap-2 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setActiveVariant(0)
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0066FF] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Variant buttons */}
          {currentTab.variants.length > 1 && (
            <div className="flex gap-2 mt-3">
              {currentTab.variants.map((variant, i) => (
                <button
                  key={variant}
                  onClick={() => setActiveVariant(i)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeVariant === i
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {variant}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <div>
          <div className="overflow-hidden">
            {activeTab === 'homepage' && (
              <HomepageEntry onSubmit={goToIntakeLoading} />
            )}
            {activeTab === 'intake' && activeVariant === 0 && (
              <IntakeLoading onComplete={goToIntakeForm} />
            )}
            {activeTab === 'intake' && activeVariant === 1 && (
              <IntakeForm onSubmit={goToProgressRunning} />
            )}
            {activeTab === 'progress' && activeVariant === 0 && (
              <ProgressPageRunning onComplete={goToProgressReady} />
            )}
            {activeTab === 'progress' && activeVariant === 1 && (
              <ProgressPageReady onComplete={goToLanding} />
            )}
            {activeTab === 'progress' && activeVariant === 2 && (
              <ProgressPageError />
            )}
            {activeTab === 'landing' && <LandingPageMockup />}
          </div>
        </div>
      </div>
    </div>
  )
}
