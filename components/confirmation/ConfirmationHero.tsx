'use client'

interface ConfirmationHeroProps {
  orderRef: string
}

/**
 * Hero section for the confirmation page.
 * Shows "Purchase complete" heading and order reference.
 */
export function ConfirmationHero({ orderRef }: ConfirmationHeroProps) {
  return (
    <div className="text-center">
      {/* Heading */}
      <h1 className="text-[32px] min-[800px]:text-[40px] font-semibold tracking-[0.02em] text-green-500 mb-3">
        Purchase complete
      </h1>

      {/* Order Reference */}
      <p className="text-white/60 text-[16px] tracking-[0.02em]">
        Order #{orderRef}
      </p>
    </div>
  )
}
