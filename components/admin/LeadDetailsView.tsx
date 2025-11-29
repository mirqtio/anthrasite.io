'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LeadRow, RunRow } from '@/types/admin'
import { PipelineActionsToolbar } from '@/components/admin/PipelineActionsToolbar'
import Link from 'next/link'
import { leadSchema, LeadFormData } from '@/lib/schemas/lead'
import { updateLeadDetails } from '@/app/admin/actions/leads'
import { deleteLead } from '@/app/admin/actions/delete'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'
import { DeleteLeadModal } from './DeleteLeadModal'
import { LeadControlPanel } from './LeadControlPanel'
import { useRouter } from 'next/navigation'

interface LeadDetailsViewProps {
  lead: LeadRow
  contacts: any[]
  displayStatus: string
  displayRun: RunRow | undefined
  reportUrl: string | null
  report: any
  runs: RunRow[]
}

export function LeadDetailsView({
  lead,
  contacts,
  displayStatus,
  displayRun,
  reportUrl,
  report,
  runs,
}: LeadDetailsViewProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      company: lead.company || '',
      domain: lead.domain || '',
      url: lead.url || '',
      baseline_monthly_revenue: lead.baseline_monthly_revenue || 0,
      employee_size: lead.employee_size,
      naics_code: lead.naics_code || '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      zip_code: lead.zip_code || '',
      source: lead.source || 'manual',
      contacts: contacts.map((c) => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone || '',
        title: c.title || c.job_title || '',
        is_primary: c.is_primary,
        source: c.source || 'manual',
      })),
      // Read-only fields for display in form if needed
      latitude: lead.latitude,
      longitude: lead.longitude,
      cbsa_level: lead.cbsa_level,
      google_place_id: lead.google_place_id,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  })

  const onSubmit = async (data: LeadFormData) => {
    setServerError(null)
    try {
      await updateLeadDetails(lead.id, data)
      setIsEditing(false)
    } catch (err: any) {
      setServerError(err.message)
    }
  }

  const toggleEdit = () => {
    if (isEditing) {
      reset() // Cancel changes
    }
    setIsEditing(!isEditing)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteLead(lead.id)
      router.push('/admin/leads')
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {/* Breadcrumb & Edit Toggle */}
      <div className="mb-8 flex justify-between items-center">
        <Link
          href="/admin/leads"
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          &larr; Back to Master List
        </Link>
        <button
          onClick={toggleEdit}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${isEditing ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
        >
          {isEditing ? (
            <>
              <X size={14} /> Cancel Editing
            </>
          ) : (
            <>
              <Pencil size={14} /> Edit Lead
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Col 1: Identity & Details */}
          <div className="space-y-8">
            <div>
              {isEditing ? (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('company')}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.company && (
                      <span className="text-red-500 text-xs">
                        {errors.company.message}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                        Domain <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('domain')}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                      {errors.domain && (
                        <span className="text-red-500 text-xs">
                          {errors.domain.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                        URL
                      </label>
                      <input
                        {...register('url')}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                      {errors.url && (
                        <span className="text-red-500 text-xs">
                          {errors.url.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-5xl font-light text-white mb-2 tracking-tight flex items-baseline gap-4">
                    {lead.company || 'Unknown Company'}
                    <span className="text-2xl text-white/20 font-mono">
                      #{lead.id}
                    </span>
                  </h1>
                  <a
                    href={lead.url}
                    target="_blank"
                    className="text-blue-500 hover:text-blue-400 font-mono text-sm"
                  >
                    {lead.domain || lead.url}
                  </a>
                </>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                  Revenue <span className="text-red-500">*</span>
                </div>
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      {...register('baseline_monthly_revenue', {
                        valueAsNumber: true,
                      })}
                      className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 text-white font-mono text-lg focus:outline-none"
                    />
                    {errors.baseline_monthly_revenue && (
                      <span className="text-red-500 text-xs">
                        {errors.baseline_monthly_revenue.message}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-mono text-white">
                    {lead.baseline_monthly_revenue
                      ? `$${(lead.baseline_monthly_revenue / 1000).toFixed(0)}k`
                      : '-'}
                  </div>
                )}
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                  Status
                </div>
                <div className="text-xl font-mono text-white capitalize">
                  {displayStatus}
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                  Employees
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    {...register('employee_size', { valueAsNumber: true })}
                    className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 text-white font-mono text-lg focus:outline-none"
                  />
                ) : (
                  <div className="text-xl font-mono text-white">
                    {lead.employee_size || '-'}
                  </div>
                )}
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                  Source
                </div>
                {isEditing ? (
                  <input
                    {...register('source')}
                    className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 text-white font-mono text-lg focus:outline-none"
                    readOnly
                  />
                ) : (
                  <div className="text-xl font-mono text-white">
                    {lead.source || 'manual'}
                  </div>
                )}
              </div>
            </div>

            {/* Location Data */}
            <div className="pt-8 border-t border-white/10">
              <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">
                Location Data
              </h3>
              <div className="space-y-2 text-sm text-white/70">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                        Address
                      </label>
                      <input
                        {...register('address')}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                        City
                      </label>
                      <input
                        {...register('city')}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                        State
                      </label>
                      <input
                        {...register('state')}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                        Zip
                      </label>
                      <input
                        {...register('zip_code')}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                        NAICS <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('naics_code')}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                      />
                      {errors.naics_code && (
                        <span className="text-red-500 text-[10px] block">
                          {errors.naics_code.message}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <p>
                      <span className="text-white/30 w-24 inline-block">
                        Address:
                      </span>{' '}
                      {lead.address || '-'}
                    </p>
                    <p>
                      <span className="text-white/30 w-24 inline-block">
                        City:
                      </span>{' '}
                      {lead.city || '-'}
                    </p>
                    <p>
                      <span className="text-white/30 w-24 inline-block">
                        State:
                      </span>{' '}
                      {lead.state || '-'}
                    </p>
                    <p>
                      <span className="text-white/30 w-24 inline-block">
                        Zip:
                      </span>{' '}
                      {lead.zip_code || '-'}
                    </p>
                    <p>
                      <span className="text-white/30 w-24 inline-block">
                        NAICS:
                      </span>{' '}
                      {lead.naics_code || '-'}
                    </p>
                    <p>
                      <span className="text-white/30 w-24 inline-block">
                        Lat/Long:
                      </span>{' '}
                      {lead.latitude && lead.longitude
                        ? `${lead.latitude}, ${lead.longitude}`
                        : '-'}
                    </p>
                    <p>
                      <span className="text-white/30 w-24 inline-block">
                        CBSA:
                      </span>{' '}
                      {lead.cbsa_level || '-'}
                    </p>
                    <p>
                      <span className="text-white/30 w-24 inline-block">
                        Place ID:
                      </span>{' '}
                      {lead.google_place_id || '-'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs uppercase tracking-widest text-white/40">
                  Contact Info
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        first_name: '',
                        last_name: '',
                        email: '',
                        is_primary: false,
                        source: 'manual',
                      })
                    }
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Contact
                  </button>
                )}
              </div>

              {errors.contacts && (
                <span className="text-red-500 text-xs block mb-2">
                  {errors.contacts.message}
                </span>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`text-sm text-white/70 ${isEditing ? 'p-3 bg-white/5 rounded border border-white/10 relative group' : ''}`}
                  >
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-2 right-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...register(`contacts.${index}.first_name`)}
                              className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 text-white text-sm py-1 focus:outline-none"
                            />
                            {errors.contacts?.[index]?.first_name && (
                              <span className="text-red-500 text-[10px]">
                                {errors.contacts[index]?.first_name?.message}
                              </span>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...register(`contacts.${index}.last_name`)}
                              className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 text-white text-sm py-1 focus:outline-none"
                            />
                            {errors.contacts?.[index]?.last_name && (
                              <span className="text-red-500 text-[10px]">
                                {errors.contacts[index]?.last_name?.message}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...register(`contacts.${index}.email`)}
                              className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 text-white text-sm py-1 focus:outline-none"
                            />
                            {errors.contacts?.[index]?.email && (
                              <span className="text-red-500 text-[10px]">
                                {errors.contacts[index]?.email?.message}
                              </span>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
                              Title
                            </label>
                            <input
                              {...register(`contacts.${index}.title`)}
                              className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 text-white text-sm py-1 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center pt-4 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                {...register(`contacts.${index}.is_primary`)}
                                className="accent-blue-600"
                              />
                              <span className="text-xs text-white/50">
                                Primary
                              </span>
                            </label>
                            <div className="text-[10px] text-white/30">
                              Source: {field.source || 'manual'}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-white">
                          {field.first_name} {field.last_name}{' '}
                          {field.is_primary && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded ml-2">
                              PRIMARY
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-white/40 mb-1">
                          {field.title || 'No Title'}
                        </p>
                        {field.email && (
                          <p>
                            <a
                              href={`mailto:${field.email}`}
                              className="text-blue-400 hover:underline"
                            >
                              {field.email}
                            </a>
                          </p>
                        )}
                        <p className="text-[10px] text-white/20 mt-1">
                          Source: {field.source || 'manual'}
                        </p>
                      </>
                    )}
                  </div>
                ))}
                {!isEditing && fields.length === 0 && (
                  <p className="text-sm text-white/30">No contacts found.</p>
                )}
              </div>
            </div>

            {serverError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                {serverError}
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Col 2: Journey (Timeline) - Unchanged */}
          <div className="lg:border-l lg:border-r border-white/10 lg:px-12">
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-8">
              Pipeline Journey
            </h3>
            <div className="text-xs text-white/30 mb-4 font-mono">
              Run ID: {displayRun?.id_str || 'None'}
            </div>

            <div className="relative space-y-12">
              {/* Vertical Line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10 -z-10"></div>

              {/* Phase A */}
              <div className="flex gap-6 items-start">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    (displayRun?.phase_a_status || '').toUpperCase() ===
                    'SUCCEEDED'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                      : 'bg-[#111] border-white/20 text-white/30'
                  }`}
                >
                  A
                </div>
                <div>
                  <div className="text-white font-medium">Validation</div>
                  <div className="text-sm text-white/50">
                    PSI, Security, Visuals
                  </div>
                </div>
              </div>

              {/* Phase B */}
              <div className="flex gap-6 items-start">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    (displayRun?.phase_b_status || '').toUpperCase() ===
                    'SUCCEEDED'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                      : 'bg-[#111] border-white/20 text-white/30'
                  }`}
                >
                  B
                </div>
                <div>
                  <div className="text-white font-medium">Calculations</div>
                  <div className="text-sm text-white/50">Metrics & Scoring</div>
                </div>
              </div>

              {/* Phase C */}
              <div className="flex gap-6 items-start">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    (displayRun?.phase_c_status || '').toUpperCase() ===
                    'SUCCEEDED'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                      : 'bg-[#111] border-white/20 text-white/30'
                  }`}
                >
                  C
                </div>
                <div>
                  <div className="text-white font-medium">Reasoning</div>
                  <div className="text-sm text-white/50">LLM Synthesis</div>
                </div>
              </div>

              {/* Phase D */}
              <div className="flex gap-6 items-start">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    (displayRun?.phase_d_status || '').toUpperCase() ===
                    'COMPLETED'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                      : (displayRun?.phase_d_status || '').toUpperCase() ===
                          'RUNNING'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse'
                        : 'bg-[#111] border-white/20 text-white/30'
                  }`}
                >
                  D
                </div>
                <div>
                  <div className="text-white font-medium">
                    Report Generation
                  </div>
                  <div className="text-sm text-white/50">PDF Assembly</div>
                  {reportUrl && (
                    <div className="mt-4">
                      <a
                        href={reportUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        Download PDF
                      </a>
                      <div className="mt-1 text-[10px] text-white/30">
                        Generated:{' '}
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Col 3: Control Panel */}
          <div className="space-y-8">
            <LeadControlPanel lead={lead} runs={runs} />
          </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="mt-12 border-t border-white/10 pt-8">
        <PipelineActionsToolbar
          leadId={lead.id.toString()}
          status={displayStatus}
          runId={displayRun?.id_str}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      </div>

      <DeleteLeadModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        count={1}
        loading={isDeleting}
      />
    </div>
  )
}
