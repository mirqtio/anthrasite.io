'use client'

interface StatusBadgeProps {
  isActive: boolean
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
        isActive
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-white/10 text-white/40'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-400' : 'bg-white/40'
        }`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
