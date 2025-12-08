import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Skeleton } from '@/components/Skeleton'
import { StripeErrorBoundary } from '@/components/purchase/StripeErrorBoundary'
import { PaymentElementWrapper } from '@/components/purchase/PaymentElementWrapper'
import { trackEvent } from '@/lib/analytics/analytics-server'
import { validatePurchaseToken, lookupPurchaseContext } from '@/lib/purchase'
import { Logo } from '@/components/Logo'
import type { PurchaseContext } from '@/lib/purchase'

const PURCHASE_PRICE_USD = 399
const PURCHASE_PRICE_DISPLAY = `$${PURCHASE_PRICE_USD}`

export const dynamic = 'force-dynamic'

interface PurchasePageProps {
  searchParams: Promise<{
    sid?: string // JWT token (new pattern)
    utm?: string // Legacy UTM token (deprecated, for backward compat)
    preview?: string
  }>
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Error component for invalid/expired tokens
 */
function TokenError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-carbon text-white flex items-center justify-center">
      <div
        className="mx-auto p-8 text-center bg-carbon"
        style={{ width: '90vw', maxWidth: '28rem', minWidth: '300px' }}
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-light mb-4">{message}</h1>
        <p className="text-white/60 mb-8">
          If you believe this is an error, please reply to the original email or
          contact support at reports@anthrasite.io
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  )
}

interface HeroProps {
  businessName: string
  domainUrl: string
  impactLow: string
  impactHigh: string
  homepageScreenshotUrl?: string | null
}

function Hero({
  businessName,
  domainUrl,
  impactLow,
  impactHigh,
  homepageScreenshotUrl,
}: HeroProps) {
  return (
    <>
      {/* Fixed Navigation - matches homepage */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-carbon/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5 flex items-center justify-between">
          <div className="logo-container">
            <Link href="/" className="flex flex-col">
              <Logo size="medium" />
              <div className="text-[10px] md:text-[13px] font-light opacity-70 mt-1 flex justify-between">
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
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#assessment"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              Method
            </Link>
            <Link
              href="/#faq"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className="text-[17px] opacity-70 hover:opacity-100 transition-opacity"
            >
              About Us
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content - with top padding to account for fixed nav */}
      <header
        className="pt-28 md:pt-32 pb-10 md:pb-14"
        data-testid="purchase-header"
      >
        <div className="px-6 md:px-10 max-w-[1200px] mx-auto">
          <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] items-start">
            {/* Main hero copy */}
            <div>
              <h1 className="text-[34px] md:text-[44px] font-light mb-4 leading-tight">
                {businessName}, your website audit is complete.
              </h1>
              <p className="text-[18px] md:text-[22px] opacity-80 mb-2">
                We identified{' '}
                <span className="text-accent font-medium">
                  {impactLow} – {impactHigh}
                </span>{' '}
                in monthly revenue at risk on {domainUrl}.
              </p>

              <ul className="mt-6 space-y-2 text-[15px] md:text-[16px] opacity-80">
                <li>
                  • Personalized audit of your live site, not a generic scanner.
                </li>
                <li>
                  • Prioritized issues ranked by estimated monthly revenue at
                  risk.
                </li>
                <li>
                  • Clear, non-technical explanation of why each issue matters.
                </li>
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                <a
                  href="#payment-section"
                  className="inline-flex items-center justify-center bg-accent text-white px-8 py-3 text-[16px] font-medium hover:bg-accent/90 transition-colors"
                >
                  Pay {PURCHASE_PRICE_DISPLAY} for my report
                </a>
                <p className="text-sm text-white/60">
                  Secure payment · Report delivered by email · 14-Day Value
                  Guarantee
                </p>
              </div>
            </div>

            {/* Right column: homepage screenshot when available */}
            <div className="hidden md:block" aria-hidden="true">
              {homepageScreenshotUrl ? (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/80">
                  <img
                    src={homepageScreenshotUrl}
                    alt={`Homepage screenshot of ${domainUrl}`}
                    className="w-full h-64 object-cover object-top"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl h-64 bg-gradient-to-br from-white/5 to-white/0" />
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

interface OutcomeSnapshotProps {
  issues: PurchaseContext['issues']
  impactLow: string
  impactHigh: string
}

function OutcomeSnapshot({
  issues,
  impactLow,
  impactHigh,
}: OutcomeSnapshotProps) {
  if (!issues || issues.length === 0) {
    return null
  }

  return (
    <section className="py-10 md:py-16" aria-label="Outcome snapshot">
      <div className="px-6 md:px-10 max-w-[1200px] mx-auto space-y-8">
        <div className="text-center md:text-left">
          <h2 className="text-[26px] md:text-[32px] font-light mb-3">
            Snapshot of your audit
          </h2>
          <p className="text-[16px] md:text-[18px] opacity-70">
            Monthly revenue at risk:{' '}
            <span className="text-accent font-medium">
              {impactLow} – {impactHigh}
            </span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {issues.slice(0, 3).map((issue, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <h3 className="text-[18px] font-medium mb-3 leading-tight">
                {issue.title}
              </h3>
              <p className="text-[14px] md:text-[15px] opacity-70 mb-4">
                {issue.description}
              </p>
              <div className="pt-3 border-t border-white/10 text-[13px] text-white/70">
                Estimated monthly revenue at risk:{' '}
                <span className="text-accent font-medium">
                  ${issue.impact_low} – ${issue.impact_high}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface PaymentSectionProps {
  token: string
  context: PurchaseContext
  impactLow: string
  impactHigh: string
}

function PaymentSection({
  token,
  context,
  impactLow,
  impactHigh,
}: PaymentSectionProps) {
  return (
    <section
      id="payment-section"
      className="py-12 md:py-16 border-t border-white/10"
      aria-label="Secure payment"
    >
      <div className="px-6 md:px-10 max-w-[800px] mx-auto space-y-6">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-[24px] md:text-[28px] font-light">
            Complete your purchase
          </h2>
          <p className="text-[15px] md:text-[16px] opacity-70">
            {context.businessName}, your report estimates{' '}
            <span className="text-accent font-medium">
              {impactLow} – {impactHigh}
            </span>{' '}
            in monthly revenue at risk. The full audit is available for{' '}
            <span className="font-medium">
              {PURCHASE_PRICE_DISPLAY} (one-time)
            </span>
            .
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 shadow-lg">
          <PaymentElementWrapper
            businessId={String(context.leadId)}
            businessName={context.businessName}
            utm={token}
            tier="basic"
            leadId={String(context.leadId)}
          />
        </div>

        <p className="text-[13px] text-white/60 text-center md:text-left">
          Your payment is processed securely by Stripe. Once payment is
          confirmed, we generate your report and email a secure download link to
          the same address we used for your outreach.
        </p>
      </div>
    </section>
  )
}

function WhatYouGetSection() {
  return (
    <section className="py-12 md:py-16" aria-label="What you get">
      <div className="px-6 md:px-10 max-w-[1200px] mx-auto">
        <h2 className="text-[24px] md:text-[28px] font-light mb-6">
          What you receive
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-[18px] font-medium mb-3">
              Prioritized issue list
            </h3>
            <p className="text-[14px] md:text-[15px] opacity-70">
              A ranked list of issues on your site, ordered by estimated monthly
              revenue at risk so you know what matters most first.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-[18px] font-medium mb-3">
              Single, independent synthesis
            </h3>
            <p className="text-[14px] md:text-[15px] opacity-70">
              We bring together multiple measurements into one coherent view of
              how your site is performing commercially, not just technically.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-[18px] font-medium mb-3">
              Transparent appendix
            </h3>
            <p className="text-[14px] md:text-[15px] opacity-70">
              A clear appendix showing the metrics we looked at, how they
              scored, and how they roll up into the revenue-at-risk range.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function MethodologySection() {
  return (
    <section
      className="py-12 md:py-16 border-t border-white/10"
      aria-label="Methodology"
    >
      <div className="px-6 md:px-10 max-w-[1000px] mx-auto space-y-4">
        <h2 className="text-[22px] md:text-[26px] font-light">
          How we calculate this
        </h2>
        <ul className="list-disc list-inside space-y-2 text-[14px] md:text-[15px] opacity-80">
          <li>
            We start from industry and geography data on typical revenue for
            businesses like yours.
          </li>
          <li>
            We estimate how much that revenue depends on digital channels in
            your segment.
          </li>
          <li>
            We apply conservative, research-backed ranges to estimate how the
            measured issues could affect that revenue.
          </li>
          <li>
            Every number in your range comes directly from our report pipeline;
            nothing is adjusted on this page.
          </li>
        </ul>
      </div>
    </section>
  )
}

function GuaranteeSection() {
  return (
    <section className="py-12 md:py-16" aria-label="Guarantee">
      <div className="px-6 md:px-10 max-w-[900px] mx-auto rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8">
        <h2 className="text-[22px] md:text-[24px] font-light mb-3">
          14-Day Actionable Value Guarantee
        </h2>
        <p className="text-[14px] md:text-[15px] opacity-80 mb-3">
          If this report does not surface specific, fixable issues that justify
          the investment, email us within 14 days. We will ask for one sentence
          on what we missed so we can improve, and then we will refund you 100%.
        </p>
        <p className="text-[13px] text-white/60">
          Limit one refund per domain.
        </p>
      </div>
    </section>
  )
}

function FAQSection() {
  return (
    <section
      className="py-12 md:py-16 border-t border-white/10"
      aria-label="Frequently asked questions"
    >
      <div className="px-6 md:px-10 max-w-[1000px] mx-auto space-y-6">
        <h2 className="text-[22px] md:text-[26px] font-light">
          Questions you might have
        </h2>
        <div className="space-y-4 text-[14px] md:text-[15px] opacity-80">
          <div>
            <h3 className="font-medium mb-1">What exactly is in the report?</h3>
            <p>
              A structured PDF that summarizes your revenue-at-risk range,
              highlights the top issues we found, and explains in plain language
              why they matter commercially.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">
              How is this different from free scanners?
            </h3>
            <p>
              We focus on commercial impact, not just technical checklists. The
              range you see here is grounded in your baseline revenue and
              digital dependence, not a generic score.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">What happens after I pay?</h3>
            <p>
              Stripe processes your payment securely. Once confirmed, we
              generate your report and email a secure download link to the same
              address we used for outreach, typically within a few minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-[60px] border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 text-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px]">
          <a
            href="/legal/privacy"
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            Privacy Policy
          </a>
          <a
            href="/legal/terms"
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            Terms of Service
          </a>
          <a
            href="/legal/do-not-sell"
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            Do Not Sell or Share My Personal Information
          </a>
          <a
            href="mailto:hello@anthrasite.io"
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            Contact
          </a>
        </div>
        <p className="text-[14px] opacity-30 mt-[20px]">
          © {new Date().getFullYear()} Anthrasite. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

async function PurchaseContent({
  token,
  context,
}: {
  token: string
  context: PurchaseContext
}) {
  // Track page view
  await trackEvent('purchase_page.view', {
    lead_id: context.leadId,
    run_id: context.runId,
    business_name: context.businessName,
    domain: context.domainUrl,
    impact_monthly_low: context.impactMonthlyLow,
    impact_monthly_high: context.impactMonthlyHigh,
    issue_count: context.issues.length,
  })

  // Format the impact range for display
  const impactLow = formatCurrency(context.impactMonthlyLow)
  const impactHigh = formatCurrency(context.impactMonthlyHigh)

  return (
    <StripeErrorBoundary>
      <Hero
        businessName={context.businessName}
        domainUrl={context.domainUrl}
        impactLow={impactLow}
        impactHigh={impactHigh}
        homepageScreenshotUrl={context.homepageScreenshotUrl}
      />
      <OutcomeSnapshot
        issues={context.issues}
        impactLow={impactLow}
        impactHigh={impactHigh}
      />
      <PaymentSection
        token={token}
        context={context}
        impactLow={impactLow}
        impactHigh={impactHigh}
      />
      <WhatYouGetSection />
      <MethodologySection />
      <GuaranteeSection />
      <FAQSection />
      <Footer />
    </StripeErrorBoundary>
  )
}

function PurchasePageSkeleton() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6 bg-white/10" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-4 bg-white/10" />
            <Skeleton className="h-5 w-1/2 mx-auto bg-white/10" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl bg-white/10" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl bg-white/10" />
          </div>
        </div>
      </section>
    </>
  )
}

export default async function PurchasePage(props: PurchasePageProps) {
  const searchParams = await props.searchParams
  const sid = searchParams.sid
  const utm = searchParams.utm // Legacy support

  // Prefer sid (JWT), fall back to utm for backward compatibility
  const token = sid || utm

  if (!token) {
    redirect('/')
  }

  // Validate JWT token
  const payload = await validatePurchaseToken(token)

  if (!payload) {
    return <TokenError message="This link has expired or is invalid" />
  }

  // Look up purchase context from database
  const context = await lookupPurchaseContext(payload.leadId, payload.runId)

  if (!context) {
    return <TokenError message="Report not found for this link" />
  }

  return (
    <main
      className="min-h-screen bg-carbon text-white"
      data-testid="purchase-root"
    >
      <Suspense fallback={<PurchasePageSkeleton />}>
        <PurchaseContent token={token} context={context} />
      </Suspense>
    </main>
  )
}
