'use client'

interface TierBadgeProps {
  tier: 'standard' | 'friends_family' | 'affiliate'
}

const tierConfig = {
  standard: {
    label: 'Standard',
    className: 'bg-blue-500/20 text-blue-400',
  },
  friends_family: {
    label: 'F&F',
    className: 'bg-purple-500/20 text-purple-400',
  },
  affiliate: {
    label: 'Affiliate',
    className: 'bg-green-500/20 text-green-400',
  },
}

export function TierBadge({ tier }: TierBadgeProps) {
  const config = tierConfig[tier]
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
