'use client'

interface ReferralPricingBadgeProps {
  originalPrice: number
  discountedPrice: number
  discountDisplay: string
  onRemove: () => void
}

/**
 * ReferralPricingBadge - Shows strikethrough pricing when referral is applied
 *
 * Displays: ~~$199~~ $99 — $100 off (remove)
 */
export function ReferralPricingBadge({
  originalPrice,
  discountedPrice,
  discountDisplay,
  onRemove,
}: ReferralPricingBadgeProps) {
  return (
    <div className="flex items-center gap-3 text-white/80">
      <span className="line-through opacity-50 text-[18px] min-[800px]:text-[20px]">
        ${originalPrice}
      </span>
      <span className="text-[24px] min-[800px]:text-[28px] font-bold text-white">
        ${discountedPrice}
      </span>
      <span className="text-[14px] min-[800px]:text-[16px] text-green-400">
        — {discountDisplay}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        className="text-[12px] min-[800px]:text-[14px] underline opacity-60 hover:opacity-100 transition-opacity"
      >
        (remove)
      </button>
    </div>
  )
}
