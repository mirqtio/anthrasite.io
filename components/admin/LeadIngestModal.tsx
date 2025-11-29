'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ingestManualLead } from '@/app/admin/actions/ingest'
import { leadSchema, LeadFormData } from '@/lib/schemas/lead'

export function LeadIngestModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      source: 'manual',
      contacts: [
        {
          first_name: '',
          last_name: '',
          email: '',
          is_primary: true,
          source: 'manual',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  })

  const [serverError, setServerError] = useState<string | null>(null)

  if (!isOpen) return null

  const onSingleSubmit = async (data: LeadFormData) => {
    setServerError(null)
    try {
      await ingestManualLead(data)
      reset()
      onClose()
    } catch (err: any) {
      setServerError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl min-w-[600px] bg-[#111] border border-white/10 rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light text-white">Ingest Lead</h2>
        </div>

        <form onSubmit={handleSubmit(onSingleSubmit)} className="space-y-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/70 border-b border-white/10 pb-2">
              Company Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('company')}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Acme Corp"
                />
                {errors.company && (
                  <span className="text-red-500 text-xs">
                    {errors.company.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('domain')}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="acme.com"
                />
                {errors.domain && (
                  <span className="text-red-500 text-xs">
                    {errors.domain.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  Website URL
                </label>
                <input
                  {...register('url')}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://acme.com"
                />
                {errors.url && (
                  <span className="text-red-500 text-xs">
                    {errors.url.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  Est. Monthly Revenue <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('baseline_monthly_revenue', {
                    valueAsNumber: true,
                  })}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="50000"
                />
                {errors.baseline_monthly_revenue && (
                  <span className="text-red-500 text-xs">
                    {errors.baseline_monthly_revenue.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  Employee Count
                </label>
                <input
                  type="number"
                  {...register('employee_size', { valueAsNumber: true })}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="100"
                />
                {errors.employee_size && (
                  <span className="text-red-500 text-xs">
                    {errors.employee_size.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  NAICS Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('naics_code')}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="541511"
                />
                {errors.naics_code && (
                  <span className="text-red-500 text-xs">
                    {errors.naics_code.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/70 border-b border-white/10 pb-2">
              Location
            </h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  Address
                </label>
                <input
                  {...register('address')}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="123 Main St"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  City
                </label>
                <input
                  {...register('city')}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  State
                </label>
                <input
                  {...register('state')}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
                  Zip Code
                </label>
                <input
                  {...register('zip_code')}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-sm font-medium text-white/70">Contacts</h3>
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
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                + Add Contact
              </button>
            </div>
            {errors.contacts && (
              <span className="text-red-500 text-xs block">
                {errors.contacts.message}
              </span>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-white/5 rounded border border-white/10 relative group"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <div className="grid grid-cols-2 gap-4 mb-2">
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
                <div className="grid grid-cols-2 gap-4 mb-2">
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
                      Job Title
                    </label>
                    <input
                      {...register(`contacts.${index}.title`)}
                      className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 text-white text-sm py-1 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register(`contacts.${index}.is_primary`)}
                        className="accent-blue-600"
                      />
                      <span className="text-xs text-white/50">
                        Primary Contact
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {serverError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Ingest Lead' : 'Ingest Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
