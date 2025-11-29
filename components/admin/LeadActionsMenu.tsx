'use client'

import { useState } from 'react'
import {
  triggerBatchAssessment,
  triggerBatchPhaseD,
  regenerateReport,
  resendReportEmail,
} from '@/app/admin/actions/pipeline'
import { deleteLead } from '@/app/admin/actions/delete'
import {
  Loader2,
  MoreVertical,
  Trash2,
  RefreshCw,
  FileText,
  Mail,
  Play,
  ChevronDown,
} from 'lucide-react'

interface LeadActionsMenuProps {
  selectedLeadIds: number[]
  onActionComplete?: () => void
  variant?: 'icon' | 'button'
  onDelete?: (ids: number[]) => void
}

export default function LeadActionsMenu({
  selectedLeadIds,
  onActionComplete,
  variant = 'icon',
  onDelete,
}: LeadActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: string) => {
    if (action === 'delete') {
      setIsOpen(false)
      if (onDelete) {
        onDelete(selectedLeadIds)
      }
      return
    }

    setLoading(true)
    setIsOpen(false)
    try {
      if (action === 'assess') {
        await triggerBatchAssessment(selectedLeadIds)
      } else if (action === 'phase_d') {
        await triggerBatchPhaseD(selectedLeadIds)
      } else if (action === 'regenerate') {
        await regenerateReport(selectedLeadIds)
      } else if (action === 'email') {
        await resendReportEmail(selectedLeadIds)
        alert('Email functionality coming soon!')
      }
      onActionComplete?.()
    } catch (err: any) {
      alert(`Action failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-white/50" />

  return (
    <div className="relative">
      {variant === 'icon' ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-white/50" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          Actions ({selectedLeadIds.length})
          <ChevronDown className="w-3 h-3" />
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 w-56 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden ${variant === 'button' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          >
            <div className="p-1">
              <button
                onClick={() => handleAction('assess')}
                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 rounded flex items-center gap-2"
              >
                <Play className="w-3 h-3" /> Run Assessment (A-C)
              </button>
              <button
                onClick={() => handleAction('phase_d')}
                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 rounded flex items-center gap-2"
              >
                <FileText className="w-3 h-3" /> Run Phase D (Report)
              </button>
              <button
                onClick={() => handleAction('regenerate')}
                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 rounded flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" /> Regenerate PDF
              </button>
              <button
                onClick={() => handleAction('email')}
                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 rounded flex items-center gap-2"
              >
                <Mail className="w-3 h-3" /> Resend Email
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => handleAction('delete')}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" /> Delete Lead(s)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
