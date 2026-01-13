'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Search, Plus, X } from 'lucide-react'
import { CreateCodeModal } from './CreateCodeModal'
import type { ReferralConfigMap } from '@/types/referral-admin'

interface CodesToolbarProps {
  currentSearch: string
  currentTier?: string
  currentStatus?: string
  config: ReferralConfigMap
}

export function CodesToolbar({
  currentSearch,
  currentTier,
  currentStatus,
  config,
}: CodesToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchValue, setSearchValue] = useState(currentSearch)

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParams('q', value || null)
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    debouncedSearch(value)
  }

  const clearSearch = () => {
    setSearchValue('')
    updateParams('q', null)
  }

  const hasFilters = currentTier || currentStatus || currentSearch

  const clearAllFilters = () => {
    setSearchValue('')
    const params = new URLSearchParams()
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search codes..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-8 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
            >
              <X className="w-3 h-3 text-white/40" />
            </button>
          )}
        </div>

        {/* Tier Filter */}
        <select
          value={currentTier || ''}
          onChange={(e) => updateParams('tier', e.target.value || null)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">All Tiers</option>
          <option value="standard">Standard</option>
          <option value="friends_family">Friends & Family</option>
          <option value="affiliate">Affiliate</option>
        </select>

        {/* Status Filter */}
        <select
          value={currentStatus || ''}
          onChange={(e) => updateParams('status', e.target.value || null)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-white/50 hover:text-white px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Code
        </button>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="mb-4 text-xs text-white/50">Loading...</div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCodeModal
          onClose={() => setShowCreateModal(false)}
          config={config}
        />
      )}
    </>
  )
}
