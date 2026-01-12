'use client'

interface PayoutStatusBadgeProps {
  status: 'pending' | 'paid' | 'failed' | 'skipped'
}

const statusConfig: Record<
  PayoutStatusBadgeProps['status'],
  { label: string; bgClass: string; dotClass: string }
> = {
  pending: {
    label: 'Pending',
    bgClass: 'bg-yellow-500/10',
    dotClass: 'bg-yellow-400',
  },
  paid: {
    label: 'Paid',
    bgClass: 'bg-green-500/10',
    dotClass: 'bg-green-400',
  },
  failed: {
    label: 'Failed',
    bgClass: 'bg-red-500/10',
    dotClass: 'bg-red-400',
  },
  skipped: {
    label: 'Skipped',
    bgClass: 'bg-gray-500/10',
    dotClass: 'bg-gray-400',
  },
}

export function PayoutStatusBadge({ status }: PayoutStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.bgClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  )
}
