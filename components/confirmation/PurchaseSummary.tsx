'use client'

interface PurchaseSummaryProps {
  company: string | null
  domain: string | null
  price: number
}

/**
 * Shows what the customer purchased.
 * Displays product name, price, and personalized company/domain if available.
 */
export function PurchaseSummary({
  company,
  domain,
  price,
}: PurchaseSummaryProps) {
  const formattedPrice = `$${price.toLocaleString()}`
  const hasPersonalization = company || domain

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 min-[800px]:p-8">
      {/* Product Line */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[18px] min-[800px]:text-[20px] font-semibold tracking-[0.02em]">
          Website Performance Report
        </span>
        <span className="text-[18px] min-[800px]:text-[20px] text-white/60">
          — {formattedPrice}
        </span>
      </div>

      {/* Personalization */}
      {hasPersonalization && (
        <p className="text-white/60 text-[16px] tracking-[0.02em] mt-2">
          For: <span className="text-white">{company || 'Your business'}</span>
          {domain && <span className="text-white/40"> ({domain})</span>}
        </p>
      )}
    </div>
  )
}
