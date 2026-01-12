'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { X, Copy, Check, ExternalLink } from 'lucide-react'
import { TierBadge } from './TierBadge'
import { StatusBadge } from './StatusBadge'
import {
  updateReferralCode,
  toggleCodeStatus,
  fetchConversions,
} from '@/app/admin/actions/referrals'
import type { ReferralCodeRow, ConversionRow } from '@/types/referral-admin'
import {
  formatDiscountDisplay,
  formatRewardDisplay,
  formatCents,
} from '@/types/referral-admin'

interface CodeDetailPanelProps {
  code: ReferralCodeRow
  onClose: () => void
}

export function CodeDetailPanel({ code, onClose }: CodeDetailPanelProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [conversions, setConversions] = useState<ConversionRow[]>([])
  const [loadingConversions, setLoadingConversions] = useState(true)

  // Edit state
  const [maxRedemptions, setMaxRedemptions] = useState(
    code.max_redemptions?.toString() || ''
  )
  const [notes, setNotes] = useState(code.notes || '')

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Load conversions
  useEffect(() => {
    async function loadConversions() {
      setLoadingConversions(true)
      try {
        const data = await fetchConversions({ codeId: code.id, limit: 10 })
        setConversions(data)
      } catch (error) {
        console.error('Failed to load conversions:', error)
      } finally {
        setLoadingConversions(false)
      }
    }
    loadConversions()
  }, [code.id])

  const shareUrl = `https://www.anthrasite.io/?promo=${code.code}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = async () => {
    const result = await toggleCodeStatus(code.id, !code.is_active)
    if (result.success) {
      if (result.warning) {
        alert(`Status updated, but: ${result.warning}`)
      }
      router.refresh()
    } else {
      alert(result.error || 'Failed to toggle status')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateReferralCode(code.id, {
        max_redemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
        notes: notes || undefined,
      })
      if (result.success) {
        router.refresh()
        setIsEditing(false)
      } else {
        alert(result.error || 'Failed to save')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!mounted) return null

  const content = (
    <div className="fixed inset-0 z-[9998]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-[#1A1A1A] border-l border-white/10 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-2xl font-bold">
                  {code.code}
                </span>
                <TierBadge tier={code.tier} />
                <StatusBadge isActive={code.is_active} />
              </div>
              {code.company_name && (
                <p className="text-white/50 text-sm">{code.company_name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Share URL */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 font-mono"
            />
            <button
              onClick={handleCopy}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                code.is_active
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              }`}
            >
              {code.is_active ? 'Disable Code' : 'Enable Code'}
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                Discount
              </p>
              <p className="text-lg font-medium">
                {formatDiscountDisplay(code)}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                Reward
              </p>
              <p className="text-lg font-medium">{formatRewardDisplay(code)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                Redemptions
              </p>
              <p className="text-lg font-medium">
                {code.redemption_count}
                {code.max_redemptions && (
                  <span className="text-white/50">
                    {' '}
                    / {code.max_redemptions}
                  </span>
                )}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                Total Paid
              </p>
              <p className="text-lg font-medium">
                {formatCents(code.total_reward_paid_cents)}
                {code.max_reward_total_cents && (
                  <span className="text-white/50">
                    {' '}
                    / {formatCents(code.max_reward_total_cents)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          {isEditing && (
            <div className="space-y-4 p-4 bg-white/5 rounded-lg">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Max Redemptions
                </label>
                <input
                  type="number"
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  rows={3}
                />
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-white/50 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Created</span>
              <span>{new Date(code.created_at).toLocaleString()}</span>
            </div>
            {code.expires_at && (
              <div className="flex justify-between">
                <span className="text-white/50">Expires</span>
                <span>{new Date(code.expires_at).toLocaleString()}</span>
              </div>
            )}
            {code.stripe_promotion_code_id && (
              <div className="flex justify-between">
                <span className="text-white/50">Stripe</span>
                <a
                  href={`https://dashboard.stripe.com/promotion_codes/${code.stripe_promotion_code_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1"
                >
                  View in Stripe
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {code.notes && !isEditing && (
              <div className="pt-2 mt-2 border-t border-white/10">
                <span className="text-white/50 block mb-1">Notes</span>
                <p className="text-white/80">{code.notes}</p>
              </div>
            )}
          </div>

          {/* Conversions */}
          <div>
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
              Recent Conversions
            </h3>
            {loadingConversions ? (
              <p className="text-white/40 text-sm">Loading...</p>
            ) : conversions.length === 0 ? (
              <p className="text-white/40 text-sm">No conversions yet</p>
            ) : (
              <div className="space-y-2">
                {conversions.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {conv.referee_company ||
                          conv.referee_email ||
                          'Unknown'}
                      </p>
                      <p className="text-white/50 text-xs">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400">
                        +{formatCents(conv.reward_paid_cents)}
                      </p>
                      <p
                        className={`text-xs ${
                          conv.payout_status === 'paid'
                            ? 'text-green-400'
                            : conv.payout_status === 'pending'
                              ? 'text-yellow-400'
                              : 'text-white/40'
                        }`}
                      >
                        {conv.payout_status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
