'use client'

/**
 * Example: Using A/B Testing on Homepage
 * Shows how to implement variant testing for different elements
 */

import React from 'react'
import { useExperiment, useVariant, useExperimentTracking } from '../hooks'

// Example 1: Simple headline variant test
export function HeroHeadline() {
  const variant = useExperiment('homepage-headline')

  const headlines = {
    control: 'Your website has untapped potential',
    'variant-a': 'Unlock hidden revenue in your website',
    'variant-b': 'Turn your website into a growth engine',
  }

  return (
    <h1 className="text-6xl font-light">
      {headlines[variant as keyof typeof headlines] || headlines.control}
    </h1>
  )
}

// Example 2: CTA button color test with tracking
export function CTAButton() {
  const { variantId, trackEvent, trackConversion } =
    useExperimentTracking('cta-color')

  const buttonStyles = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
  }

  const handleClick = () => {
    // Track the click event
    trackEvent('cta_clicked', {
      location: 'hero',
      text: 'Get Started',
    })

    // Navigate to sign up
    window.location.href = '/signup'
  }

  const handleSignupComplete = (value: number) => {
    // Track conversion with value
    trackConversion(value, {
      plan: 'premium',
      source: 'homepage_hero',
    })
  }

  return (
    <button
      onClick={handleClick}
      className={`px-8 py-4 text-white rounded-lg ${
        buttonStyles[variantId as keyof typeof buttonStyles] ||
        buttonStyles.blue
      }`}
    >
      Get Started
    </button>
  )
}

// Example 3: Conditional feature based on variant
export function WaitlistForm() {
  const showExtendedForm = useVariant('waitlist-form', 'extended')
  const { trackEvent } = useExperimentTracking('waitlist-form')

  const handleSubmit = (formData: any) => {
    trackEvent('waitlist_submitted', {
      fields_count: showExtendedForm ? 4 : 2,
      ...formData,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="domain"
        placeholder="Enter your domain"
        required
      />
      <input type="email" name="email" placeholder="Your email" required />

      {showExtendedForm && (
        <>
          <input type="text" name="company" placeholder="Company name" />
          <select name="company_size">
            <option value="">Company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="200+">200+ employees</option>
          </select>
        </>
      )}

      <button type="submit">Join Waitlist</button>
    </form>
  )
}

// Example 4: Multi-variant content test
export function ValueProposition() {
  const variant = useExperiment('value-prop-style')

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-3 gap-6">
        <ValueCard
          title="SEO Analysis"
          description="Comprehensive technical SEO audit"
          icon="🔍"
        />
        <ValueCard
          title="Performance"
          description="Core Web Vitals optimization"
          icon="⚡"
        />
        <ValueCard
          title="Competitors"
          description="Detailed competitive analysis"
          icon="📊"
        />
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <ul className="space-y-4">
        <li className="flex items-start">
          <span className="text-2xl mr-4">🔍</span>
          <div>
            <h3 className="font-semibold">SEO Analysis</h3>
            <p className="text-gray-600">Comprehensive technical SEO audit</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-4">⚡</span>
          <div>
            <h3 className="font-semibold">Performance</h3>
            <p className="text-gray-600">Core Web Vitals optimization</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-4">📊</span>
          <div>
            <h3 className="font-semibold">Competitors</h3>
            <p className="text-gray-600">Detailed competitive analysis</p>
          </div>
        </li>
      </ul>
    )
  }

  // Default: narrative style
  return (
    <div className="prose max-w-3xl mx-auto">
      <p className="text-lg leading-relaxed">
        Our comprehensive website audit combines technical SEO analysis,
        performance optimization insights, and competitive intelligence to give
        you a complete picture of your site's potential.
      </p>
      <p className="text-lg leading-relaxed mt-4">
        We analyze Core Web Vitals, identify ranking opportunities, and provide
        actionable recommendations that can dramatically improve your online
        presence.
      </p>
    </div>
  )
}

// Helper component
function ValueCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

// Example 5: Server-side experiment (for app directory)
export async function ServerSideHero({
  experimentAssignments,
}: {
  experimentAssignments: Record<string, string>
}) {
  const variant = experimentAssignments['homepage-layout'] || 'control'

  if (variant === 'minimal') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h1 className="text-7xl font-light mb-8">Website Audits</h1>
          <p className="text-xl text-gray-600 mb-12">
            Automated. Actionable. Affordable.
          </p>
          <CTAButton />
        </div>
      </div>
    )
  }

  // Default: full layout
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-light mb-6">
              Transform Your Website Into a Revenue Machine
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get a comprehensive audit that reveals exactly how to improve your
              site's performance, SEO, and conversions.
            </p>
            <CTAButton />
          </div>
          <div>
            <img
              src="/hero-illustration.svg"
              alt="Website audit visualization"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
