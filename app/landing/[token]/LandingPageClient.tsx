"use client";

import { useState, useCallback } from "react";
import type { LandingContext, FAQItem } from "@/lib/landing/types";
import { HeroSection } from "@/components/landing/HeroSection";
import { HookSection } from "@/components/landing/HookSection";
import { ValueSection } from "@/components/landing/ValueSection";
import { CTASection } from "@/components/landing/CTASection";
import { FAQSection } from "@/components/landing/FAQSection";
import { MobileStickyCTA } from "@/components/landing/MobileStickyCTA";

interface LandingPageClientProps {
  context: LandingContext;
  token: string;
}

// Static FAQ content
const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Who is Anthrasite?",
    answer:
      "We analyze small business websites using a combination of industry-leading tools, established standards, and our own visual assessment. Then we translate the results into a prioritized list of what's actually affecting your business.",
  },
  {
    question: "Is this legitimate?",
    answer:
      "Yes. We're a real company that helps small businesses understand their web presence. The screenshots and analysis in this report are generated from your actual website. If you have questions, you can reply directly to the email that brought you here.",
  },
  {
    question: "How accurate is the revenue estimate?",
    answer:
      "Our revenue estimates are based on industry benchmarks and your specific traffic patterns. While individual results vary, we use conservative assumptions and clearly show the methodology in your report. The estimate represents potential monthly impact if issues are addressed.",
  },
  {
    question: "What happens after I purchase?",
    answer:
      "You'll receive your full report via email within minutes. The report includes all identified issues, prioritized by business impact, with difficulty ratings and the underlying measurements. It's a PDF you can share with your team or developer.",
  },
];

export function LandingPageClient({ context, token }: LandingPageClientProps) {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    if (isCheckoutLoading) return;

    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId: context.businessId,
          leadId: context.leadId,
          token,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError("Unable to start checkout. Please try again.");
      setIsCheckoutLoading(false);
    }
  }, [context.businessId, context.leadId, token, isCheckoutLoading]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)]">
      <div className="max-w-[760px] mx-auto px-[var(--spacing-section-md)] py-[var(--spacing-section-lg)]">
        <div className="space-y-[var(--spacing-section-lg)]">
          {/* Section 1: Hero */}
          <section aria-labelledby="hero-heading">
            <HeroSection
              company={context.company}
              domainUrl={context.domainUrl}
              score={context.score}
              issueCount={context.issueCount}
              desktopScreenshotUrl={context.desktopScreenshotUrl}
              mobileScreenshotUrl={context.mobileScreenshotUrl}
            />
          </section>

          {/* Section 2: The Hook */}
          <section aria-labelledby="hook-heading">
            <HookSection
              hookOpportunity={context.hookOpportunity}
              impactLow={context.impactLow}
              impactHigh={context.impactHigh}
            />
          </section>

          {/* Section 3: What You Get */}
          <section aria-labelledby="value-heading">
            <ValueSection
              company={context.company}
              issueCount={context.issueCount}
            />
          </section>

          {/* Section 4: Why Trust Us - Simple text, inline here */}
          <section
            aria-labelledby="trust-heading"
            className="py-[var(--spacing-section-sm)] text-center"
          >
            <h2 id="trust-heading" className="sr-only">
              Why Trust Us
            </h2>
            <p className="text-[var(--color-text-secondary)] text-[length:var(--font-size-base)] leading-[var(--leading-relaxed)] max-w-xl mx-auto">
              We&apos;ve helped hundreds of small businesses understand what&apos;s
              holding back their website. Our reports translate technical metrics
              into business impact—so you know exactly where to focus.
            </p>
          </section>

          {/* Section 5: CTA + Guarantee */}
          <section aria-labelledby="cta-heading">
            <CTASection
              company={context.company}
              issueCount={context.issueCount}
              impactLow={context.impactLow}
              impactHigh={context.impactHigh}
              price={context.price}
              isLoading={isCheckoutLoading}
              onCheckout={handleCheckout}
              error={checkoutError}
            />
          </section>

          {/* Section 6: FAQ */}
          <section aria-labelledby="faq-heading">
            <FAQSection items={FAQ_ITEMS} />
          </section>
        </div>
      </div>

      {/* Section 7: Mobile Sticky CTA */}
      <MobileStickyCTA
        price={context.price}
        isLoading={isCheckoutLoading}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
