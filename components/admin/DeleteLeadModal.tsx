import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface DeleteLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  count: number
  loading?: boolean
}

export function DeleteLeadModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  loading,
}: DeleteLeadModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="bg-[#111] border border-white/10 p-6 rounded shadow-2xl"
        style={{ width: '90vw', maxWidth: '28rem', minWidth: '300px' }}
      >
        <h3 className="text-lg font-medium text-white mb-2 whitespace-normal">
          Delete {count} Lead{count !== 1 ? 's' : ''}?
        </h3>
        <p className="text-sm text-white/70 mb-6">
          Are you sure you want to delete{' '}
          {count === 1 ? 'this lead' : 'these leads'}? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete Forever
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
