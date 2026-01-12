import Link from 'next/link'
import { fetchReferralCodes } from '@/app/admin/actions/referrals'
import { CodesTable } from '@/components/admin/referrals/CodesTable'
import { CodesToolbar } from '@/components/admin/referrals/CodesToolbar'

export const dynamic = 'force-dynamic'

interface SearchParams {
  q?: string
  tier?: string
  status?: string
  sort?: string
  order?: string
  limit?: string
}

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const codes = await fetchReferralCodes({
    search: params.q || '',
    tier: params.tier,
    status: params.status,
    sort: params.sort || 'created_at',
    order: (params.order as 'asc' | 'desc') || 'desc',
    limit: parseInt(params.limit || '50'),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Referral Program</h1>
        <p className="text-white/40 text-sm mt-1">
          Manage referral codes, discounts, and rewards
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-4 border-b border-white/10">
        <Link
          href="/admin/referrals"
          className="px-4 py-2 text-sm text-white border-b-2 border-white"
        >
          Codes
        </Link>
        <Link
          href="/admin/referrals/conversions"
          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors border-b-2 border-transparent"
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

      <CodesToolbar
        currentSearch={params.q || ''}
        currentTier={params.tier}
        currentStatus={params.status}
      />

      <CodesTable
        codes={codes}
        currentSort={params.sort || 'created_at'}
        currentOrder={(params.order as 'asc' | 'desc') || 'desc'}
        currentLimit={parseInt(params.limit || '50')}
      />
    </div>
  )
}
