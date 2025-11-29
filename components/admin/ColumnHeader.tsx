'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUp, ArrowDown, Filter, X, Check } from 'lucide-react'

interface ColumnHeaderProps {
  column: string
  label: string
  currentSort: string
  currentOrder: 'asc' | 'desc'
  filterKey?: string // If provided, enables filtering
  filterType?: 'text' | 'select'
  filterOptions?: { label: string; value: string }[]
}

export function ColumnHeader({
  column,
  label,
  currentSort,
  currentOrder,
  filterKey,
  filterType = 'text',
  filterOptions = [],
}: ColumnHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Filter State
  const currentFilterValue = filterKey ? searchParams.get(filterKey) || '' : ''
  const [tempFilter, setTempFilter] = useState(currentFilterValue)

  useEffect(() => {
    setTempFilter(currentFilterValue)
  }, [currentFilterValue, isOpen])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSort = (order: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', column)
    params.set('order', order)
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  const handleApplyFilter = () => {
    if (!filterKey) return
    const params = new URLSearchParams(searchParams.toString())
    if (tempFilter) {
      params.set(filterKey, tempFilter)
    } else {
      params.delete(filterKey)
    }
    // Reset page to 1 (or remove limit offset if implemented)
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  const handleClearFilter = () => {
    if (!filterKey) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete(filterKey)
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  const isSorted = currentSort === column
  const isFiltered = !!currentFilterValue

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 hover:text-white transition-colors py-2 ${isFiltered ? 'text-blue-400 font-medium' : ''}`}
      >
        {label}
        {isSorted && (
          <span className="text-blue-400">
            {currentOrder === 'asc' ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
          </span>
        )}
        {isFiltered && !isSorted && (
          <Filter className="w-3 h-3 text-blue-400" />
        )}
        {!isSorted && !isFiltered && (
          <span className="opacity-0 group-hover:opacity-100 text-white/20">
            ▼
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Sort Options */}
          <div className="p-1 border-b border-white/10">
            <button
              onClick={() => handleSort('asc')}
              className={`w-full text-left px-3 py-2 text-xs rounded flex items-center gap-2 ${isSorted && currentOrder === 'asc' ? 'bg-blue-600/20 text-blue-400' : 'text-white/80 hover:bg-white/5'}`}
            >
              <ArrowUp className="w-3 h-3" /> Sort Ascending
            </button>
            <button
              onClick={() => handleSort('desc')}
              className={`w-full text-left px-3 py-2 text-xs rounded flex items-center gap-2 ${isSorted && currentOrder === 'desc' ? 'bg-blue-600/20 text-blue-400' : 'text-white/80 hover:bg-white/5'}`}
            >
              <ArrowDown className="w-3 h-3" /> Sort Descending
            </button>
          </div>

          {/* Filter Options */}
          {filterKey && (
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">
                Filter by {label}
              </div>

              {filterType === 'select' ? (
                <div className="space-y-1">
                  <button
                    onClick={() => setTempFilter('')}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded flex items-center gap-2 ${!tempFilter ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}
                  >
                    {tempFilter === '' && <Check className="w-3 h-3" />}
                    <span className={tempFilter === '' ? 'ml-0' : 'ml-5'}>
                      All
                    </span>
                  </button>
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTempFilter(opt.value)}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded flex items-center gap-2 ${tempFilter === opt.value ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      {tempFilter === opt.value && (
                        <Check className="w-3 h-3" />
                      )}
                      <span
                        className={tempFilter === opt.value ? 'ml-0' : 'ml-5'}
                      >
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={tempFilter}
                  onChange={(e) => setTempFilter(e.target.value)}
                  placeholder={`Search ${label}...`}
                  className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 mb-3"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                />
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={handleClearFilter}
                  className="flex-1 px-2 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilter}
                  className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
