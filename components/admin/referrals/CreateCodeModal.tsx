'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createReferralCode } from '@/app/admin/actions/referrals'
import type {
  TierType,
  DiscountType,
  RewardType,
  ReferralConfigMap,
} from '@/types/referral-admin'

interface CreateCodeModalProps {
  onClose: () => void
  config: ReferralConfigMap
}

export function CreateCodeModal({ onClose, config }: CreateCodeModalProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state - initialize with config defaults
  const [step, setStep] = useState<1 | 2>(1)
  const [tier, setTier] = useState<TierType | null>(null)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<DiscountType>('fixed')
  const [discountAmount, setDiscountAmount] = useState(
    (config.default_standard_discount_cents / 100).toString()
  )
  const [discountPercent, setDiscountPercent] = useState('10')
  const [rewardType, setRewardType] = useState<RewardType>('fixed')
  const [rewardAmount, setRewardAmount] = useState(
    (config.default_standard_reward_cents / 100).toString()
  )
  const [rewardPercent, setRewardPercent] = useState(
    config.default_affiliate_reward_percent.toString()
  )
  const [maxRedemptions, setMaxRedemptions] = useState('')
  const [maxRewardTotal, setMaxRewardTotal] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Set defaults based on tier selection
  useEffect(() => {
    if (tier === 'friends_family') {
      setRewardType('none')
      setDiscountAmount((config.default_ff_discount_cents / 100).toString())
    } else if (tier === 'standard') {
      setRewardType('fixed')
      setDiscountAmount(
        (config.default_standard_discount_cents / 100).toString()
      )
      setRewardAmount((config.default_standard_reward_cents / 100).toString())
    } else if (tier === 'affiliate') {
      setRewardType('percent')
      setDiscountType('fixed')
      setDiscountAmount(
        (config.default_affiliate_discount_cents / 100).toString()
      )
      setRewardPercent(config.default_affiliate_reward_percent.toString())
    }
  }, [tier, config])

  const handleSubmit = async () => {
    if (!tier) return

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = {
        code: code.toUpperCase(),
        tier,
        discount_type: discountType,
        discount_amount_cents:
          discountType === 'fixed'
            ? Math.round(parseFloat(discountAmount) * 100)
            : undefined,
        discount_percent:
          discountType === 'percent' ? parseInt(discountPercent) : undefined,
        reward_type: rewardType,
        reward_amount_cents:
          rewardType === 'fixed'
            ? Math.round(parseFloat(rewardAmount) * 100)
            : undefined,
        reward_percent:
          rewardType === 'percent' ? parseInt(rewardPercent) : undefined,
        reward_trigger: (tier === 'affiliate' ? 'every' : 'first') as
          | 'first'
          | 'every',
        max_redemptions: maxRedemptions ? parseInt(maxRedemptions) : undefined,
        max_reward_total_cents: maxRewardTotal
          ? Math.round(parseFloat(maxRewardTotal) * 100)
          : undefined,
        notes: notes || undefined,
      }

      const result = await createReferralCode(formData)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error || 'Failed to create code')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[#1A1A1A] rounded-xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold">Create Referral Code</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-white/60 text-sm mb-6">
                Select the type of referral code you want to create:
              </p>

              <button
                onClick={() => {
                  setTier('friends_family')
                  setStep(2)
                }}
                className="w-full text-left p-4 rounded-lg border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                    F&F
                  </span>
                  <span className="font-medium">Friends & Family</span>
                </div>
                <p className="text-white/50 text-sm mt-2">
                  Discount-only code for manual distribution. No rewards paid
                  out.
                </p>
              </button>

              <button
                onClick={() => {
                  setTier('affiliate')
                  setStep(2)
                }}
                className="w-full text-left p-4 rounded-lg border border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                    Affiliate
                  </span>
                  <span className="font-medium">Affiliate</span>
                </div>
                <p className="text-white/50 text-sm mt-2">
                  For partners/influencers. Earns percentage or fixed reward on
                  each conversion.
                </p>
              </button>

              <button
                onClick={() => {
                  setTier('standard')
                  setStep(2)
                }}
                className="w-full text-left p-4 rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                    Standard
                  </span>
                  <span className="font-medium">Standard</span>
                </div>
                <p className="text-white/50 text-sm mt-2">
                  Customer referral code. Earns reward on first conversion only.
                </p>
              </button>
            </div>
          )}

          {step === 2 && tier && (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={() => setStep(1)}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                &larr; Back to tier selection
              </button>

              {/* Code */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                    )
                  }
                  placeholder="e.g., ACMECORP"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  maxLength={20}
                />
                <p className="text-xs text-white/40 mt-1">
                  3-20 characters, letters and numbers only
                </p>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Discount
                </label>
                <div className="flex gap-2">
                  <select
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as DiscountType)
                    }
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="fixed">Fixed ($)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                      {discountType === 'fixed' ? '$' : ''}
                    </span>
                    <input
                      type="number"
                      value={
                        discountType === 'fixed'
                          ? discountAmount
                          : discountPercent
                      }
                      onChange={(e) =>
                        discountType === 'fixed'
                          ? setDiscountAmount(e.target.value)
                          : setDiscountPercent(e.target.value)
                      }
                      className={`w-full bg-white/5 border border-white/10 rounded-lg py-2 text-white focus:outline-none focus:border-blue-500 transition-colors ${
                        discountType === 'fixed' ? 'pl-7 pr-3' : 'px-3'
                      }`}
                      min="1"
                      max={discountType === 'fixed' ? '199' : '100'}
                    />
                    {discountType === 'percent' && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reward (not for F&F) */}
              {tier !== 'friends_family' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                    Reward ({tier === 'standard' ? 'first only' : 'every'})
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={rewardType}
                      onChange={(e) =>
                        setRewardType(e.target.value as RewardType)
                      }
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="fixed">Fixed ($)</option>
                      <option value="percent">Percent (%)</option>
                      <option value="none">None</option>
                    </select>
                    {rewardType !== 'none' && (
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                          {rewardType === 'fixed' ? '$' : ''}
                        </span>
                        <input
                          type="number"
                          value={
                            rewardType === 'fixed'
                              ? rewardAmount
                              : rewardPercent
                          }
                          onChange={(e) =>
                            rewardType === 'fixed'
                              ? setRewardAmount(e.target.value)
                              : setRewardPercent(e.target.value)
                          }
                          className={`w-full bg-white/5 border border-white/10 rounded-lg py-2 text-white focus:outline-none focus:border-blue-500 transition-colors ${
                            rewardType === 'fixed' ? 'pl-7 pr-3' : 'px-3'
                          }`}
                          min="1"
                          max={rewardType === 'fixed' ? '500' : '50'}
                        />
                        {rewardType === 'percent' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                            %
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Max Redemptions */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Max Redemptions (optional)
                </label>
                <input
                  type="number"
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  min="1"
                  max="10000"
                />
              </div>

              {/* Lifetime Reward Cap (for affiliates) */}
              {tier === 'affiliate' && rewardType !== 'none' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                    Lifetime Reward Cap (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                      $
                    </span>
                    <input
                      type="number"
                      value={maxRewardTotal}
                      onChange={(e) => setMaxRewardTotal(e.target.value)}
                      placeholder="Unlimited"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      min="1"
                      max="100000"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes about this code..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  rows={2}
                  maxLength={500}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="flex justify-end gap-3 p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !code || code.length < 3}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Code'}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
