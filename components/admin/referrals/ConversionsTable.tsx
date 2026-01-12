'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PayoutStatusBadge } from './PayoutStatusBadge'
import { formatCents } from '@/types/referral-admin'
import type { ConversionRow } from '@/types/referral-admin'

interface ConversionsTableProps {
  conversions: ConversionRow[]
  initialLimit: number
}

export function ConversionsTable({
  conversions,
  initialLimit,
}: ConversionsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [limit, setLimit] = useState(initialLimit)
  const [isPending, startTransition] = useTransition()

  const loadMore = () => {
    const newLimit = limit + 50
    setLimit(newLimit)
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', newLimit.toString())
    startTransition(() => {
      router.push(`/admin/referrals/conversions?${params.toString()}`, {
        scroll: false,
      })
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (conversions.length === 0) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-12 text-center">
        <p className="text-white/40">No conversions found</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="text-left px-4 py-3 font-medium text-white/60">
              Date
            </th>
            <th className="text-left px-4 py-3 font-medium text-white/60">
              Code
            </th>
            <th className="text-left px-4 py-3 font-medium text-white/60">
              Referee
            </th>
            <th className="text-right px-4 py-3 font-medium text-white/60">
              Discount
            </th>
            <th className="text-right px-4 py-3 font-medium text-white/60">
              Reward
            </th>
            <th className="text-center px-4 py-3 font-medium text-white/60">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {conversions.map((conversion) => (
            <tr
              key={conversion.id}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="px-4 py-3 text-white/60">
                {formatDate(conversion.created_at)}
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-white">
                  {conversion.referrer_code}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-white">
                    {conversion.referee_company || 'Unknown'}
                  </span>
                  {conversion.referee_email && (
                    <span className="text-white/40 text-xs">
                      {conversion.referee_email}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right text-white/60">
                {formatCents(conversion.discount_applied_cents)}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-white">
                  {formatCents(conversion.reward_earned_cents)}
                </span>
                {conversion.reward_paid_cents > 0 && (
                  <span className="text-white/40 text-xs ml-1">
                    (paid: {formatCents(conversion.reward_paid_cents)})
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <PayoutStatusBadge status={conversion.payout_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {conversions.length >= limit && (
        <div className="p-4 text-center border-t border-white/10">
          <button
            onClick={loadMore}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Load more...
          </button>
        </div>
      )}
    </div>
  )
}
