'use client'

import { useState } from 'react'
import {
  triggerAssessment,
  triggerBatchPhaseD,
  repairLead,
} from '@/app/admin/actions/pipeline'

interface PipelineActionsToolbarProps {
  leadId: string
  status: string // 'NEW', 'ASSESSED', 'COMPLETED', etc.
  runId?: string
  onDelete?: () => void
}

export function PipelineActionsToolbar({
  leadId,
  status,
  runId,
  onDelete,
}: PipelineActionsToolbarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const normalizedStatus = (status || 'NEW').toUpperCase()
  const numericLeadId = parseInt(leadId)

  const handleAction = async (
    action: () => Promise<any>,
    successMessage: string,
    skipReload = false
  ) => {
    setIsLoading(true)
    setMessage(null)
    try {
      const result = await action()
      // Check for both array results (batch) and object results (single)
      if (
        Array.isArray(result)
          ? result.length > 0 && result[0].status !== 'error'
          : result.success
      ) {
        setMessage(successMessage)
        if (!skipReload) {
          window.location.reload()
        }
      } else {
        setMessage(
          `Error: ${Array.isArray(result) ? result[0]?.reason : result.message}`
        )
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message || 'Unknown error'}`)
      console.error(e)
    } finally {
      if (!skipReload) {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="p-6 bg-[#111] border-t border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
            Pipeline Actions
          </h3>
          {message && (
            <span
              className={`text-xs px-2 py-1 rounded ${
                message.startsWith('Error')
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-green-500/10 text-green-400'
              }`}
            >
              {message}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {/* State Machine Logic */}
          {normalizedStatus === 'NEW' && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                handleAction(
                  () => triggerAssessment(numericLeadId),
                  'Assessment Triggered'
                )
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Starting...' : 'Run Assessment'}
            </button>
          )}

          {(normalizedStatus === 'ASSESSED' ||
            normalizedStatus === 'PHASE_C_COMPLETED') && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                handleAction(
                  () => triggerBatchPhaseD([numericLeadId]),
                  'Report Generation Started'
                )
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Premium Report'}
            </button>
          )}

          {normalizedStatus === 'COMPLETED' && (
            <>
              <a
                href={`/api/reports/${leadId}`} // Assuming this route exists or will exist
                target="_blank"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded transition-colors"
              >
                View Report
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleAction(
                    () => repairLead(numericLeadId, 'REGENERATE_PDF'),
                    'Regeneration Started'
                  )
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-500 text-sm font-medium rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Regenerating...' : 'Regenerate PDF'}
              </button>
            </>
          )}

          {/* Fallback / Debug Actions */}
          <div className="h-8 w-px bg-white/10 mx-2"></div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleAction(
                () => repairLead(numericLeadId, 'REGENERATE_PDF'),
                'Repair Started'
              )
            }}
            disabled={isLoading}
            className="text-xs text-white/30 hover:text-white/50 underline"
            title="Re-runs Phase D with skip_synthesis=true to regenerate the PDF from existing data."
          >
            Force Regenerate PDF
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete?.()
            }}
            disabled={isLoading}
            className="text-xs text-red-500/50 hover:text-red-400 underline ml-2"
          >
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  )
}
