'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

interface ConversionsToolbarProps {
  codes: Array<{ id: string; code: string }>
}

export function ConversionsToolbar({ codes }: ConversionsToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCode = searchParams.get('codeId') || ''
  const currentStatus = searchParams.get('status') || ''

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/referrals/conversions?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Code filter */}
      <div className="relative">
        <select
          value={currentCode}
          onChange={(e) => updateParam('codeId', e.target.value)}
          className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          <option value="">All Codes</option>
          {codes.map((code) => (
            <option key={code.id} value={code.id}>
              {code.code}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={currentStatus}
          onChange={(e) => updateParam('status', e.target.value)}
          className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      </div>

      {/* Clear filters */}
      {(currentCode || currentStatus) && (
        <button
          onClick={() => router.push('/admin/referrals/conversions')}
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
