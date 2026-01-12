'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ColumnHeader } from '@/components/admin/ColumnHeader'
import { TierBadge } from './TierBadge'
import { StatusBadge } from './StatusBadge'
import { CodeDetailPanel } from './CodeDetailPanel'
import { toggleCodeStatus } from '@/app/admin/actions/referrals'
import type { ReferralCodeRow } from '@/types/referral-admin'
import {
  formatDiscountDisplay,
  formatRewardDisplay,
  formatUsageDisplay,
  formatPayoutDisplay,
} from '@/types/referral-admin'

interface CodesTableProps {
  codes: ReferralCodeRow[]
  currentSort: string
  currentOrder: 'asc' | 'desc'
  currentLimit: number
}

export function CodesTable({
  codes,
  currentSort,
  currentOrder,
  currentLimit,
}: CodesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const selectedCode = codes.find((c) => c.id === selectedCodeId)

  const handleToggle = async (code: ReferralCodeRow) => {
    setTogglingId(code.id)
    try {
      const result = await toggleCodeStatus(code.id, !code.is_active)
      if (!result.success) {
        alert(result.error || 'Failed to toggle code')
      } else if (result.warning) {
        // Success but with a warning (e.g., Stripe promo not found)
        alert(`Status updated, but: ${result.warning}`)
      }
      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
      alert('Failed to toggle code')
    } finally {
      setTogglingId(null)
    }
  }

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', String(currentLimit + 50))
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  if (codes.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        <p>No referral codes found.</p>
        <p className="text-sm mt-1">
          Create your first code using the button above.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                <ColumnHeader
                  column="code"
                  label="Code"
                  currentSort={currentSort}
                  currentOrder={currentOrder}
                />
              </th>
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                Tier
              </th>
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                Status
              </th>
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                Discount
              </th>
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                Reward
              </th>
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                <ColumnHeader
                  column="redemption_count"
                  label="Uses"
                  currentSort={currentSort}
                  currentOrder={currentOrder}
                />
              </th>
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                <ColumnHeader
                  column="total_reward_paid_cents"
                  label="Paid Out"
                  currentSort={currentSort}
                  currentOrder={currentOrder}
                />
              </th>
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                <ColumnHeader
                  column="created_at"
                  label="Created"
                  currentSort={currentSort}
                  currentOrder={currentOrder}
                />
              </th>
              <th className="text-left py-3 px-4 text-white/50 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr
                key={code.id}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                onClick={() => setSelectedCodeId(code.id)}
              >
                <td className="py-3 px-4">
                  <span className="font-mono font-medium text-white">
                    {code.code}
                  </span>
                  {code.company_name && (
                    <span className="block text-xs text-white/40 mt-0.5">
                      {code.company_name}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <TierBadge tier={code.tier} />
                </td>
                <td className="py-3 px-4">
                  <StatusBadge isActive={code.is_active} />
                </td>
                <td className="py-3 px-4 text-white/80">
                  {formatDiscountDisplay(code)}
                </td>
                <td className="py-3 px-4 text-white/80">
                  {formatRewardDisplay(code)}
                </td>
                <td className="py-3 px-4 text-white/80">
                  {formatUsageDisplay(code)}
                </td>
                <td className="py-3 px-4 text-white/80">
                  {code.tier === 'affiliate' || code.reward_type !== 'none'
                    ? formatPayoutDisplay(code)
                    : '-'}
                </td>
                <td className="py-3 px-4 text-white/60">
                  {new Date(code.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggle(code)}
                    disabled={togglingId === code.id}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      code.is_active
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-green-400 hover:bg-green-500/10'
                    } ${
                      togglingId === code.id
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {togglingId === code.id
                      ? '...'
                      : code.is_active
                        ? 'Disable'
                        : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {codes.length >= currentLimit && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="text-sm text-white/60 hover:text-white px-4 py-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Detail Panel */}
      {selectedCode && (
        <CodeDetailPanel
          code={selectedCode}
          onClose={() => setSelectedCodeId(null)}
        />
      )}
    </>
  )
}
