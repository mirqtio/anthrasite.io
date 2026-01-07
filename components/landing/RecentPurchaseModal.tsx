'use client'

interface RecentPurchase {
  saleId: number
  purchasedAt: string
  email: string
}

interface RecentPurchaseModalProps {
  purchase: RecentPurchase
  onResendEmail: () => void
  onBuyAgain: () => void
  onClose: () => void
}

/**
 * Modal shown when a user tries to purchase a report they recently bought.
 * Offers options to resend the email or buy again anyway.
 */
export function RecentPurchaseModal({
  purchase,
  onResendEmail,
  onBuyAgain,
  onClose,
}: RecentPurchaseModalProps) {
  // Format purchase time as relative (e.g., "5 minutes ago")
  const purchaseTime = new Date(purchase.purchasedAt)
  const minutesAgo = Math.round((Date.now() - purchaseTime.getTime()) / 60000)
  const timeAgo =
    minutesAgo < 1
      ? 'just now'
      : minutesAgo === 1
        ? '1 minute ago'
        : `${minutesAgo} minutes ago`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-slate-900 text-center mb-3">
          You already purchased this report
        </h2>

        {/* Description */}
        <p className="text-slate-600 text-center mb-6">
          A copy was sent to{' '}
          <span className="font-medium">{purchase.email}</span> {timeAgo}. Would
          you like us to resend it?
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onResendEmail}
            className="w-full px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-lg transition-colors"
          >
            Resend to my email
          </button>
          <button
            onClick={onBuyAgain}
            className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Purchase again anyway
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
