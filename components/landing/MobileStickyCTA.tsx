"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

interface MobileStickyCTAProps {
  price: number;
  isLoading: boolean;
  onCheckout: () => void;
}

export function MobileStickyCTA({
  price,
  isLoading,
  onCheckout,
}: MobileStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Find the main CTA section to observe
    const ctaSection = document.querySelector('[aria-labelledby="cta-heading"]');

    if (!ctaSection) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Show sticky CTA when the main CTA is NOT in viewport
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-100px 0px 0px 0px", // Some buffer at top
      }
    );

    observerRef.current.observe(ctaSection);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[1100] md:hidden transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        // Blur backdrop
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      role="complementary"
      aria-label="Quick checkout"
    >
      <div className="bg-[var(--color-bg-surface)]/95 border-t border-[var(--color-border-default)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] safe-area-inset-bottom">
        <button
          onClick={onCheckout}
          disabled={isLoading}
          className="w-full flex items-center justify-between gap-[var(--spacing-gap-sm)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] bg-[var(--color-interactive-cta-default)] hover:bg-[var(--color-interactive-cta-hover)] active:bg-[var(--color-interactive-cta-active)] disabled:bg-[var(--color-interactive-cta-disabled)] text-[var(--color-interactive-cta-text)] rounded-[var(--radius-md)] shadow-[var(--shadow-cta)] transition-colors duration-[var(--duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-[var(--spacing-gap-xs)]">
            <Lock
              className="w-4 h-4"
              aria-hidden="true"
            />
            <span className="text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)]">
              Get Your Report — ${price}
            </span>
          </div>

          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
