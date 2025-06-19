import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button/Button'
import { Card } from '@/components/Card/Card'
import { Skeleton } from '@/components/Skeleton/Skeleton'
import { useUTMValidation, type ReportIssue } from '@/lib/utm/hooks'
import { useSiteMode } from '@/lib/context/SiteModeContext'
import {
  usePurchaseFunnelTracking,
  useRenderTracking,
} from '@/lib/monitoring/hooks'
import { trackEvent } from '@/lib/monitoring'
import { Logo } from '@/components/Logo'

export function PurchaseHomepage() {
  useRenderTracking('PurchaseHomepage')
  const router = useRouter()
  const { businessId } = useSiteMode()
  const { loading, valid, error, businessName, reportData } = useUTMValidation()
  const { trackStep } = usePurchaseFunnelTracking()
  const [redirecting, setRedirecting] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  useEffect(() => {
    if (!loading && valid) {
      trackStep('homepage_purchase_view', {
        businessId,
        businessName,
      })
    }
  }, [loading, valid, businessId, businessName, trackStep])

  const handleGetReport = () => {
    setRedirecting(true)
    trackStep('homepage_to_purchase_click')
    router.push('/purchase')
  }

  if (loading) {
    return <PurchaseHomepageLoading />
  }

  if (!valid || error) {
    return <PurchaseHomepageError error={error} />
  }

  return (
    <>
      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="max-w-[1200px] mx-auto px-10 py-5 flex justify-between items-center">
          <div>
            <Logo />
            <div className="text-[17px] font-light tracking-[0.3em] opacity-70 mt-[2px] text-center">
              VALUE, CRYSTALLIZED
            </div>
          </div>
          <ul className="hidden md:flex gap-10 list-none">
            <li>
              <a
                href="#preview"
                className="text-white no-underline text-[24px] font-normal opacity-70 hover:opacity-100 transition-opacity duration-300"
              >
                Report Preview
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-white no-underline text-[24px] font-normal opacity-70 hover:opacity-100 transition-opacity duration-300"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main>
      {/* Hero Section */}
      <section className="hero" data-testid="purchase-homepage">
        <div className="hero-content container-narrow">
          <h1 className="text-display mb-8">
            {businessName}, your audit is ready.
          </h1>
          <p className="text-[24px] font-normal opacity-70 mb-[60px] max-w-[700px] mx-auto">
            We've identified critical improvements worth thousands in monthly
            revenue.
          </p>

          {/* Pressure Visualization with Value */}
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
              <div className="text-display-large text-accent">$12,450</div>
              <div className="text-label mt-2">Monthly Impact</div>
            </div>
          </div>

          <button
            onClick={handleGetReport}
            disabled={redirecting}
            className="cta-primary"
          >
            {redirecting ? 'Loading...' : 'Get Your Report - $199'}
          </button>

          <p className="text-[17px] opacity-50 mt-4">
            Secure payment via Stripe. Instant delivery.
          </p>
        </div>
      </section>

      {/* Key Findings Preview */}
      <section id="preview" className="section">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-header text-center">Your Top 3 Issues</h2>

          <div className="assessment-grid">
            <div className="text-center">
              <ShieldIcon className="w-12 h-12 text-accent opacity-60 mx-auto mb-4" />
              <h3 className="text-[20px] mb-3">Security Headers Missing</h3>
              <p className="text-[14px] opacity-60 leading-[1.6]">
                Critical headers absent. Leaving your site vulnerable to XSS
                attacks and data breaches.
              </p>
              <p className="text-[16px] text-accent mt-3">
                Impact: -15% trust score
              </p>
            </div>

            <div className="text-center">
              <ClockIcon className="w-12 h-12 text-accent opacity-60 mx-auto mb-4" />
              <h3 className="text-[20px] mb-3">4.2s Load Time</h3>
              <p className="text-[14px] opacity-60 leading-[1.6]">
                68% slower than competitors. Every second costs you 7% in
                conversions.
              </p>
              <p className="text-[16px] text-accent mt-3">
                Impact: -$3,200/month
              </p>
            </div>

            <div className="text-center">
              <CheckIcon className="w-12 h-12 text-accent opacity-60 mx-auto mb-4" />
              <h3 className="text-[20px] mb-3">Image Optimization</h3>
              <p className="text-[14px] opacity-60 leading-[1.6]">
                23 unoptimized images adding 2.8MB. Mobile users are bouncing
                before load.
              </p>
              <p className="text-[16px] text-accent mt-3">
                Impact: -$1,800/month
              </p>
            </div>
          </div>

          <p className="text-center opacity-60 text-[18px] mt-12">
            Your full report includes specific fixes for each issue with
            implementation priority.
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
                q: "What's in the full report?",
                a: 'A focused 15-page PDF with your specific issues, their revenue impact, and step-by-step fixes. Plus benchmarks against your top 3 competitors.',
              },
              {
                q: 'How accurate are the revenue calculations?',
                a: 'We use your actual traffic data, industry conversion rates, and competitor analysis. Our calculations are conservative - most clients see 20-30% higher actual impact.',
              },
              {
                q: 'Can I implement the fixes myself?',
                a: 'Yes. Each recommendation includes clear technical steps. If you need help, we can connect you with pre-vetted developers who specialize in your issues.',
              },
              {
                q: "What if I'm not satisfied?",
                a: "We offer a 30-day money-back guarantee. If the report doesn't provide value, we'll refund your purchase.",
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
                <div className="faq-answer">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="py-[60px] px-10 border-t border-white/5 text-center">
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="mailto:hello@anthrasite.io">Contact</a>
        </div>
        <p className="text-tiny opacity-30">
          © 2024 Anthrasite. All rights reserved.
        </p>
      </footer>
    </>
  )
}

function PurchaseHomepageLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-anthracite-gray-50 to-white">
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Skeleton className="mx-auto mb-6 h-8 w-[200px]" />
          <Skeleton className="mx-auto mb-4 h-12 w-4/5" />
          <Skeleton className="mx-auto mb-8 h-6 w-3/5" />
          <Skeleton className="mx-auto h-14 w-[200px]" />
        </div>
      </section>
    </main>
  )
}

function PurchaseHomepageError({ error }: { error?: string }) {
  const router = useRouter()

  useEffect(() => {
    trackEvent('purchase_homepage.validation_error', { error })
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card variant="bordered" className="max-w-md text-center">
        <div className="p-8 space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-anthracite-error/10 flex items-center justify-center">
            <XIcon className="h-8 w-8 text-anthracite-error" />
          </div>

          <h2 className="text-2xl font-bold text-anthracite-black">
            Invalid Purchase Link
          </h2>

          <p className="text-anthracite-black/60">
            {error ||
              'This purchase link is not valid. Please check your email for the correct link.'}
          </p>

          <Button variant="primary" onClick={() => router.push('/')}>
            Return to Homepage
          </Button>
        </div>
      </Card>
    </main>
  )
}

interface ScoreCardProps {
  label: string
  score: number
  color: 'blue' | 'yellow' | 'green'
}

function ScoreCard({ label, score, color }: ScoreCardProps) {
  const colorClasses = {
    blue: 'text-anthracite-blue bg-anthracite-blue/10',
    yellow: 'text-yellow-600 bg-yellow-500/10',
    green: 'text-green-600 bg-green-500/10',
  }

  return (
    <div className="text-center">
      <p className="text-sm text-anthracite-black/60">{label}</p>
      <p
        className={`mt-2 text-3xl font-bold rounded-lg py-2 ${colorClasses[color]}`}
      >
        {score}
      </p>
    </div>
  )
}

// Default issues for demo
const defaultIssues: ReportIssue[] = [
  {
    severity: 'high',
    title: 'Missing Security Headers',
    description:
      'Your site is missing critical security headers that protect against XSS attacks.',
  },
  {
    severity: 'medium',
    title: 'Slow Page Load Speed',
    description:
      'Main page takes 4.2s to load. Google recommends under 2.5s for optimal user experience.',
  },
  {
    severity: 'low',
    title: 'Images Not Optimized',
    description:
      '23 images could be compressed to reduce page weight by up to 65%.',
  },
]

// Icons
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}
