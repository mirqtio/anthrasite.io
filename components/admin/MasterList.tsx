'use client'

import { LeadRow } from '@/types/admin'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ColumnHeader } from './ColumnHeader'
import LeadActionsMenu from './LeadActionsMenu'
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger'
import { DeleteLeadModal } from './DeleteLeadModal'
import { deleteLead } from '@/app/admin/actions/delete'

interface MasterListProps {
  leads: LeadRow[]
  currentSort: string
  currentOrder: 'asc' | 'desc'
  currentLimit: number
}

export function MasterList({
  leads,
  currentSort,
  currentOrder,
  currentLimit,
}: MasterListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<number[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [leadsToDelete, setLeadsToDelete] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // View Options State
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    company: true,
    status: true,
    revenue: false,
    city: true,
    state: true,
    zip: true,
    naics6: true,
    naics4: false,
    naics2: false,
    actions: true,
  })
  const [showViewOptions, setShowViewOptions] = useState(false)

  const toggleSelectAll = () => {
    if (selected.length === leads.length && leads.length > 0) {
      setSelected([])
    } else {
      setSelected(leads.map((l) => l.id))
    }
  }

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((l) => l !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', (currentLimit + 50).toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      for (const id of leadsToDelete) {
        await deleteLead(id)
      }
      setSelected(selected.filter((id) => !leadsToDelete.includes(id)))
      setLeadsToDelete([])
      router.refresh()
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    setIsLoadingMore(false)
  }, [leads.length]) // Reset loading when new leads are loaded

  // ... (inside component)

  // Removed handleSort and SortIcon as they are now handled by ColumnHeader

  return (
    <div className="w-full relative">
      {/* View Options & Batch Actions */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-4">
          <div className="text-sm text-white/40">
            {leads.length} leads
            {selected.length > 0 && (
              <span className="text-blue-400 ml-2">
                ({selected.length} selected)
              </span>
            )}
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-200">
              <div className="h-4 w-px bg-white/10 mx-2" />
              <LeadActionsMenu
                selectedLeadIds={selected}
                onActionComplete={() => {
                  setSelected([])
                  router.refresh()
                }}
                onDelete={(ids) => setLeadsToDelete(ids)}
                variant="button"
              />
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowViewOptions(!showViewOptions)}
            className="text-xs text-white/50 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/5 transition-colors"
          >
            <span>View Options</span>
            <svg
              className={`w-3 h-3 transition-transform ${showViewOptions ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showViewOptions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowViewOptions(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-20 p-2">
                <div className="text-xs font-medium text-white/40 px-2 py-1 mb-1 uppercase tracking-wider">
                  Columns
                </div>
                {Object.entries(visibleColumns).map(([key, isVisible]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof visibleColumns],
                        }))
                      }
                      className="accent-blue-600 rounded"
                    />
                    <span className="text-sm text-white/80 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pb-20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selected.length === leads.length && leads.length > 0}
                  className="accent-blue-600"
                />
              </th>
              {visibleColumns.id && (
                <th className="p-4">
                  <ColumnHeader
                    column="id"
                    label="ID"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                  />
                </th>
              )}
              {visibleColumns.company && (
                <th className="p-4">
                  <ColumnHeader
                    column="company"
                    label="Company"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    filterKey="q"
                  />
                </th>
              )}
              {visibleColumns.status && (
                <th className="p-4">
                  <ColumnHeader
                    column="status"
                    label="Status"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    filterKey="status"
                    filterType="select"
                    filterOptions={[
                      { label: 'New', value: 'NEW' },
                      { label: 'Running', value: 'RUNNING' },
                      { label: 'Completed', value: 'COMPLETED' },
                      { label: 'Failed', value: 'FAILED' },
                    ]}
                  />
                </th>
              )}
              {visibleColumns.revenue && (
                <th className="p-4 text-right">
                  <div className="flex justify-end">
                    <ColumnHeader
                      column="baseline_monthly_revenue"
                      label="Revenue"
                      currentSort={currentSort}
                      currentOrder={currentOrder}
                    />
                  </div>
                </th>
              )}
              {visibleColumns.city && (
                <th className="p-4">
                  <ColumnHeader
                    column="city"
                    label="City"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    filterKey="city"
                  />
                </th>
              )}
              {visibleColumns.state && (
                <th className="p-4">
                  <ColumnHeader
                    column="state"
                    label="State"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    filterKey="state"
                  />
                </th>
              )}
              {visibleColumns.zip && (
                <th className="p-4">
                  <ColumnHeader
                    column="zip"
                    label="Zip"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    filterKey="zip"
                  />
                </th>
              )}
              {visibleColumns.naics6 && (
                <th className="p-4">
                  <ColumnHeader
                    column="naics_code"
                    label="NAICS (6)"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    filterKey="naics"
                  />
                </th>
              )}
              {visibleColumns.naics4 && <th className="p-4">NAICS (4)</th>}
              {visibleColumns.naics2 && <th className="p-4">NAICS (2)</th>}
              {visibleColumns.actions && (
                <th className="p-4 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`group hover:bg-white/5 transition-colors ${selected.includes(lead.id) ? 'bg-blue-900/20' : ''}`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                    className="accent-blue-600"
                  />
                </td>
                {visibleColumns.id && (
                  <td className="p-4 font-mono text-white/50 text-xs">
                    {lead.id}
                  </td>
                )}
                {visibleColumns.company && (
                  <td className="p-4">
                    <Link href={`/admin/leads/${lead.id}`} className="block">
                      <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                        {lead.company || lead.url}
                      </div>
                      <div className="text-xs text-white/40 font-mono">
                        {lead.domain}
                      </div>
                    </Link>
                  </td>
                )}
                {visibleColumns.status && (
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          lead.status === 'COMPLETED'
                            ? 'bg-emerald-500'
                            : lead.status === 'RUNNING'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-white/20'
                        }`}
                      ></span>
                      <span className="text-xs text-white/50 uppercase">
                        {lead.status || 'NEW'}
                      </span>
                    </div>
                  </td>
                )}
                {visibleColumns.revenue && (
                  <td className="p-4 text-right font-mono text-white/70">
                    {lead.baseline_monthly_revenue
                      ? `$${(lead.baseline_monthly_revenue / 100 / 1000).toFixed(1)}k`
                      : '-'}
                  </td>
                )}
                {visibleColumns.city && (
                  <td className="p-4 text-sm text-white/60">
                    {lead.city || '-'}
                  </td>
                )}
                {visibleColumns.state && (
                  <td className="p-4 text-sm text-white/60">
                    {lead.state || '-'}
                  </td>
                )}
                {visibleColumns.zip && (
                  <td className="p-4 text-sm text-white/60">
                    {lead.zip_code ? lead.zip_code.substring(0, 5) : '-'}
                  </td>
                )}
                {visibleColumns.naics6 && (
                  <td className="p-4 text-xs font-mono text-white/50">
                    {lead.naics_code || '-'}
                  </td>
                )}
                {visibleColumns.naics4 && (
                  <td className="p-4 text-xs font-mono text-white/50">
                    {lead.naics_code ? lead.naics_code.substring(0, 4) : '-'}
                  </td>
                )}
                {visibleColumns.naics2 && (
                  <td className="p-4 text-xs font-mono text-white/50">
                    {lead.naics_code ? lead.naics_code.substring(0, 2) : '-'}
                  </td>
                )}
                {visibleColumns.actions && (
                  <td className="p-4 text-right flex justify-end gap-3 items-center">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-xs text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </Link>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <LeadActionsMenu
                        selectedLeadIds={[lead.id]}
                        onActionComplete={() => router.refresh()}
                        onDelete={(ids) => setLeadsToDelete(ids)}
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More / Infinite Scroll */}
      <InfiniteScrollTrigger
        onLoadMore={handleLoadMore}
        isLoading={isLoadingMore}
        hasMore={true}
      />

      <DeleteLeadModal
        isOpen={leadsToDelete.length > 0}
        onClose={() => setLeadsToDelete([])}
        onConfirm={handleConfirmDelete}
        count={leadsToDelete.length}
        loading={isDeleting}
      />
    </div>
  )
}
