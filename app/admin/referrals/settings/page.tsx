import Link from 'next/link'
import { fetchReferralConfig } from '@/app/admin/actions/referrals'
import { SettingsForm } from '@/components/admin/referrals/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await fetchReferralConfig()

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Referral Program</h1>
          <p className="text-white/40 text-sm mt-1">
            Configure global referral settings
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
          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors border-b-2 border-transparent"
        >
          Conversions
        </Link>
        <Link
          href="/admin/referrals/settings"
          className="px-4 py-2 text-sm text-white border-b-2 border-white"
        >
          Settings
        </Link>
      </div>

      {/* Settings form */}
      <div className="max-w-2xl">
        <SettingsForm config={config} />
      </div>
    </div>
  )
}
