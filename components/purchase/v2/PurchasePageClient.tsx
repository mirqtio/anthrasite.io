'use client'

import React, { useRef } from 'react'
import { PurchaseContext } from '@/lib/purchase/types'
import { HeroV2 } from './HeroV2'
import { PriorityDetailV2 } from './PriorityDetailV2'
import { WhatsInsideV2 } from './WhatsInsideV2'
import { FinalCloseV2 } from './FinalCloseV2'
import { FooterV2 } from './FooterV2'
import { PaymentElementWrapper } from '@/components/purchase/PaymentElementWrapper'
import { PricingCard } from '@/components/purchase/PricingCard'

interface PurchasePageClientProps {
  context: PurchaseContext
  token: string
  useEmbeddedPayment: boolean
}

export function PurchasePageClient({
  context,
  token,
  useEmbeddedPayment,
}: PurchasePageClientProps) {
  const checkoutRef = useRef<HTMLElement>(null)

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-anthracite-black min-h-screen text-white font-sans">
      {/* 1. Hero */}
      <HeroV2
        issueCount={context.totalIssues || context.issues.length} // Fallback logic
        revenueImpact={context.impactMonthlyHigh}
        mobileScreenshotUrl={context.mobileScreenshotUrl || null}
        onCtaClick={scrollToCheckout}
      />

      {/* 2. Top Priority */}
      {context.issues && context.issues.length > 0 && (
        <PriorityDetailV2
          issue={context.issues[0]}
          desktopScreenshotUrl={context.homepageScreenshotUrl || null}
          onCtaClick={scrollToCheckout}
        />
      )}

      {/* 3. What's Inside */}
      <WhatsInsideV2 onCtaClick={scrollToCheckout} />

      {/* 4. Final Close */}
      <FinalCloseV2
        desktopScreenshotUrl={context.homepageScreenshotUrl || null}
        onCtaClick={scrollToCheckout}
      />

      {/* Footer */}
      <FooterV2 />

      {/* Hidden internal Checkout/Payment Section */}
      {/* This section matches the V2 design specs indirectly by being a functional destination */}
      <section
        ref={checkoutRef}
        id="checkout-target"
        className="py-24 border-t border-white/5 bg-anthracite-black flex justify-center"
      >
        <div className="w-full max-w-[32rem] px-6">
          <div className="bg-[#121212] border border-white/10 p-8 rounded-xl shadow-2xl">
            <h3 className="text-xl font-medium mb-6 text-center text-white">
              Secure Checkout
            </h3>
            {useEmbeddedPayment ? (
              <PaymentElementWrapper
                businessId={context.businessId || context.leadId.toString()}
                businessName={context.businessName}
                utm={token}
                tier="basic"
                leadId={String(context.leadId)}
              />
            ) : (
              <PricingCard
                businessName={context.businessName}
                utm={token}
                onCheckout={async () => {}}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
