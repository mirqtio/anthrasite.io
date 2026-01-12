'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateReferralConfig } from '@/app/admin/actions/referrals'
import type { ReferralConfigMap } from '@/types/referral-admin'

interface SettingsFormProps {
  config: ReferralConfigMap
}

export function SettingsForm({ config }: SettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Local state for form values
  const [ffEnabled, setFfEnabled] = useState(config.ff_enabled)
  const [standardDiscount, setStandardDiscount] = useState(
    (config.default_standard_discount_cents / 100).toString()
  )
  const [standardReward, setStandardReward] = useState(
    (config.default_standard_reward_cents / 100).toString()
  )
  const [ffDiscount, setFfDiscount] = useState(
    (config.default_ff_discount_cents / 100).toString()
  )
  const [affiliateDiscount, setAffiliateDiscount] = useState(
    (config.default_affiliate_discount_cents / 100).toString()
  )
  const [affiliateRewardPercent, setAffiliateRewardPercent] = useState(
    config.default_affiliate_reward_percent.toString()
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await updateReferralConfig({
        ff_enabled: ffEnabled,
        default_standard_discount_cents: Math.round(
          parseFloat(standardDiscount) * 100
        ),
        default_standard_reward_cents: Math.round(
          parseFloat(standardReward) * 100
        ),
        default_ff_discount_cents: Math.round(parseFloat(ffDiscount) * 100),
        default_affiliate_discount_cents: Math.round(
          parseFloat(affiliateDiscount) * 100
        ),
        default_affiliate_reward_percent: parseInt(affiliateRewardPercent),
      })

      if (result.success) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to save settings')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Friends & Family Toggle */}
      <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Friends & Family Codes</h3>
            <p className="text-white/40 text-sm mt-1">
              Enable or disable all F&F codes globally
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFfEnabled(!ffEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              ffEnabled ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                ffEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Standard Tier Defaults */}
      <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium">Standard Tier Defaults</h3>
          <p className="text-white/40 text-sm mt-1">
            Default values for customer referral codes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Default Discount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                $
              </span>
              <input
                type="number"
                value={standardDiscount}
                onChange={(e) => setStandardDiscount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                min="1"
                max="199"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Default Reward
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                $
              </span>
              <input
                type="number"
                value={standardReward}
                onChange={(e) => setStandardReward(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                min="1"
                max="199"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Friends & Family Tier Defaults */}
      <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium">Friends & Family Defaults</h3>
          <p className="text-white/40 text-sm mt-1">
            Default values for F&F codes (no reward payout)
          </p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
            Default Discount
          </label>
          <div className="relative w-1/2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              $
            </span>
            <input
              type="number"
              value={ffDiscount}
              onChange={(e) => setFfDiscount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              min="1"
              max="199"
            />
          </div>
        </div>
      </div>

      {/* Affiliate Tier Defaults */}
      <div className="bg-[#1A1A1A] rounded-xl border border-white/10 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium">Affiliate Defaults</h3>
          <p className="text-white/40 text-sm mt-1">
            Default values for partner/influencer codes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Default Discount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                $
              </span>
              <input
                type="number"
                value={affiliateDiscount}
                onChange={(e) => setAffiliateDiscount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                min="1"
                max="199"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
              Default Reward (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={affiliateRewardPercent}
                onChange={(e) => setAffiliateRewardPercent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                min="1"
                max="50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
          Settings saved successfully
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
