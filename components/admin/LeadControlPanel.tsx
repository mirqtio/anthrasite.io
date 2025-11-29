'use client'

import { useState } from 'react'
import {
  triggerAssessment,
  triggerBatchAssessment,
  triggerBatchPhaseD,
  repairLead,
} from '@/app/admin/actions/pipeline'
import { LeadRow, RunRow } from '@/types/admin'

export function LeadControlPanel({
  lead,
  runs,
}: {
  lead: LeadRow
  runs: RunRow[]
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const latestRun = runs[0]

  // Determine primary action state
  const hasMemo = latestRun?.reasoning_memo_s3_key
  const isRunning = latestRun?.phase_d_status === 'RUNNING'
  const isComplete = latestRun?.phase_d_status === 'COMPLETED'

  const handleGenerate = async () => {
    if (!confirm('Start Phase D (Premium Report Generation)?')) return
    setLoadingAction('GENERATE')
    setError(null)
    try {
      await triggerBatchPhaseD([lead.id], `single-run-${Date.now()}`)
      alert('Report generation started.')
    } catch (err: any) {
      setError(`Failed: ${err.message}`)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleRepair = async () => {
    if (!confirm('Regenerate PDF (Skip Synthesis)? This is a repair action.'))
      return
    setLoadingAction('REPAIR')
    setError(null)
    try {
      await repairLead(lead.id, 'REGENERATE_PDF')
      alert('Repair workflow started.')
    } catch (err: any) {
      setError(`Repair failed: ${err.message}`)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
      {/* Assessment Actions (Ops) */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">
          Assessment (Ops)
        </h3>
        <button
          onClick={async () => {
            if (!confirm('Run Assessment (Phase A-C)?')) return
            setLoadingAction('ASSESS')
            setError(null)
            try {
              const results = await triggerBatchAssessment([lead.id])
              const result = results[0]
              if (result.status === 'error') {
                throw new Error(result.reason)
              }
              alert(`Assessment started. Batch ID: ${result.runId}`)
            } catch (err: any) {
              setError(`Failed: ${err.message}`)
            } finally {
              setLoadingAction(null)
            }
          }}
          disabled={!!loadingAction}
          className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left flex justify-between items-center disabled:opacity-30"
        >
          <span>Run Assessment</span>
          <span className="text-xs bg-white/10 px-2 py-1 rounded">
            Phase A-C
          </span>
        </button>
      </div>

      {/* Primary Action */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">
          Primary Action
        </h3>
        <button
          onClick={handleGenerate}
          disabled={!!loadingAction || isRunning}
          className={`w-full py-4 px-6 rounded text-lg font-medium transition-all ${
            isComplete
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loadingAction === 'GENERATE'
            ? 'Starting...'
            : isRunning
              ? 'Generation in Progress...'
              : isComplete
                ? 'View Report (Complete)'
                : 'Generate Premium Report'}
        </button>
        {isComplete && (
          <p className="text-center mt-2 text-xs text-white/40">
            Report is ready. Click to view (mock link).
          </p>
        )}
      </div>

      {/* Repair Actions */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">
          Repair Actions
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleRepair}
            disabled={!hasMemo || !!loadingAction}
            className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left flex justify-between items-center disabled:opacity-30"
          >
            <span>Regenerate PDF Only</span>
            <span className="text-xs bg-white/10 px-2 py-1 rounded">
              Skips Synthesis
            </span>
          </button>

          <button
            disabled={true} // Not implemented yet
            className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded text-sm text-white/30 cursor-not-allowed text-left flex justify-between items-center"
          >
            <span>Resend Email</span>
            <span className="text-xs border border-white/10 px-2 py-1 rounded">
              Coming Soon
            </span>
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-red-900/10 border border-red-500/10 rounded">
        <h4 className="text-red-400 text-xs font-mono mb-2">DEBUG_CONTEXT</h4>
        <pre className="text-[10px] text-red-300/70 overflow-x-auto">
          {JSON.stringify(
            {
              leadId: lead.id,
              latestRunId: latestRun?.id_str,
              status: latestRun?.phase_d_status,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  )
}
