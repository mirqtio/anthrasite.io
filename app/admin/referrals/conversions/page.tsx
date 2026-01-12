import Link from 'next/link'
import {
  fetchConversions,
  fetchReferralCodes,
} from '@/app/admin/actions/referrals'
import { ConversionsTable } from '@/components/admin/referrals/ConversionsTable'
import { ConversionsToolbar } from '@/components/admin/referrals/ConversionsToolbar'
import { formatCents } from '@/types/referral-admin'

export const dynamic = 'force-dynamic'

interface ConversionsPageProps {
  searchParams: Promise<{
    codeId?: string
    status?: string
    limit?: string
  }>
}

export default async function ConversionsPage({
  searchParams,
}: ConversionsPageProps) {
  const params = await searchParams
  const limit = parseInt(params.limit || '50')

  // Fetch conversions and codes for filter
  const [conversions, codes] = await Promise.all([
    fetchConversions({
      codeId: params.codeId,
      status: params.status,
      limit,
    }),
    fetchReferralCodes({ limit: 1000 }), // Get all codes for dropdown
  ])

  // Calculate summary stats
  const totalDiscount = conversions.reduce(
    (sum, c) => sum + c.discount_applied_cents,
    0
  )
  const totalRewardEarned = conversions.reduce(
    (sum, c) => sum + c.reward_earned_cents,
    0
  )
  const totalRewardPaid = conversions.reduce(
    (sum, c) => sum + c.reward_paid_cents,
    0
  )
  const pendingCount = conversions.filter(
    (c) => c.payout_status === 'pending'
  ).length

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Referral Program</h1>
          <p className="text-white/40 text-sm mt-1">
            Track conversions and payouts
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-4 border-b border-white/10">
        <Link
          href="/admin/referrals"
          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors border-b-2 border-transparent"
        >
          Codes
        </Link>
        <Link
          href="/admin/referrals/conversions"
          className="px-4 py-2 text-sm text-white border-b-2 border-white"
        >
          Conversions
        </Link>
        <Link
          href="/admin/referrals/settings"
          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors border-b-2 border-transparent"
        >
          Settings
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
            Total Conversions
          </p>
          <p className="text-2xl font-semibold">{conversions.length}</p>
        </div>
        <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
            Discounts Given
          </p>
          <p className="text-2xl font-semibold">{formatCents(totalDiscount)}</p>
        </div>
        <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
            Rewards Paid
          </p>
          <p className="text-2xl font-semibold">
            {formatCents(totalRewardPaid)}
            {totalRewardEarned > totalRewardPaid && (
              <span className="text-sm text-white/40 ml-2">
                / {formatCents(totalRewardEarned)} earned
              </span>
            )}
          </p>
        </div>
        <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
            Pending Payouts
          </p>
          <p className="text-2xl font-semibold">
            {pendingCount}
            {pendingCount > 0 && (
              <span className="text-yellow-400 text-sm ml-2">awaiting</span>
            )}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <ConversionsToolbar
        codes={codes.map((c) => ({ id: c.id, code: c.code }))}
      />

      {/* Table */}
      <ConversionsTable conversions={conversions} initialLimit={limit} />
    </div>
  )
}
