'use client'

import { useState, useEffect } from 'react'
import { Loader2, ArrowRight, X } from 'lucide-react'

// Industry options (2-digit NAICS)
const INDUSTRY_OPTIONS = [
  { label: 'Agriculture & Natural Resources', value: '11' },
  { label: 'Mining & Energy', value: '21' },
  { label: 'Utilities', value: '22' },
  { label: 'Construction', value: '23' },
  { label: 'Manufacturing', value: '31' },
  { label: 'Wholesale & Distribution', value: '42' },
  { label: 'Retail', value: '44' },
  { label: 'Transportation & Logistics', value: '48' },
  { label: 'Technology & Information', value: '51' },
  { label: 'Finance & Insurance', value: '52' },
  { label: 'Real Estate', value: '53' },
  { label: 'Professional Services', value: '54' },
  { label: 'Management & Holding', value: '55' },
  { label: 'Administrative Services', value: '56' },
  { label: 'Education', value: '61' },
  { label: 'Healthcare', value: '62' },
  { label: 'Arts & Entertainment', value: '71' },
  { label: 'Restaurants & Hospitality', value: '72' },
  { label: 'Personal & Other Services', value: '81' },
]

const REVENUE_OPTIONS = [
  { label: 'Under $10k', value: 'under-10k' },
  { label: '$10k-$25k', value: '10k-25k' },
  { label: '$25k-$75k', value: '25k-75k' },
  { label: '$75k-$125k', value: '75k-125k' },
  { label: '$125k-$200k', value: '125k-200k' },
  { label: 'Over $200k', value: 'over-200k' },
]

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
]

interface PrefillData {
  company?: { value: string; confidence: number }
  city?: { value: string; confidence: number }
  state?: { value: string; confidence: number }
  zip?: { value: string; confidence: number }
  industry?: { value: string; confidence: number }
}

interface IntakeModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  email: string
  onSubmitSuccess: (requestId: string) => void
}

type ModalState = 'loading' | 'form' | 'submitting' | 'error'

export function IntakeModal({
  isOpen,
  onClose,
  url,
  email,
  onSubmitSuccess,
}: IntakeModalProps) {
  const [state, setState] = useState<ModalState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [prefill, setPrefill] = useState<PrefillData | null>(null)
  const [cacheKey, setCacheKey] = useState<string | null>(null)
  const [canonicalUrl, setCanonicalUrl] = useState<string>(url)

  // Form state
  const [company, setCompany] = useState('')
  const [city, setCity] = useState('')
  const [formState, setFormState] = useState('')
  const [zip, setZip] = useState('')
  const [industry, setIndustry] = useState('')
  const [revenueRange, setRevenueRange] = useState('25k-75k')
  const [acceptedTerms, setAcceptedTerms] = useState(true)
  const [marketingOptIn, setMarketingOptIn] = useState(true)

  // Call validate endpoint when modal opens
  useEffect(() => {
    if (!isOpen) return

    const validateUrl = async () => {
      setState('loading')
      setError(null)

      try {
        const response = await fetch('/api/self-serve/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, email }),
        })

        const data = await response.json()

        if (!response.ok || data.status === 'error') {
          setError(
            data.message ||
              "We couldn't reach that website. Please check the URL."
          )
          setState('error')
          return
        }

        // Store prefill data
        setPrefill(data.prefill || null)
        setCacheKey(data.cache_key || null)
        setCanonicalUrl(data.canonical_url || url)

        // Populate form with prefill data
        if (data.prefill) {
          const p = data.prefill
          if (p.company?.value) setCompany(p.company.value)
          if (p.city?.value) setCity(p.city.value)
          if (p.state?.value) setFormState(p.state.value)
          if (p.zip?.value) setZip(p.zip.value)
          if (p.industry?.value) setIndustry(p.industry.value)
        }

        setState('form')
      } catch (err) {
        console.error('Validate error:', err)
        setError('Something went wrong. Please try again.')
        setState('error')
      }
    }

    validateUrl()
  }, [isOpen, url, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.')
      return
    }

    if (!company.trim()) {
      setError('Please enter your company name.')
      return
    }

    setState('submitting')
    setError(null)

    try {
      const response = await fetch('/api/self-serve/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: canonicalUrl,
          email,
          cache_key: cacheKey,
          company: company.trim(),
          city: city.trim() || undefined,
          state: formState || undefined,
          zip: zip.trim() || undefined,
          industry: industry || undefined,
          revenue_range: revenueRange,
          accepted_terms: acceptedTerms,
          marketing_opt_in: marketingOptIn,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.status !== 'ok') {
        setError(
          data.detail ||
            data.message ||
            'Something went wrong. Please try again.'
        )
        setState('form')
        return
      }

      // Success - pass request ID to parent
      onSubmitSuccess(data.request_id)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Something went wrong. Please try again.')
      setState('form')
    }
  }

  const getConfidenceClass = (confidence?: number) => {
    if (!confidence) return 'border-gray-300'
    return confidence >= 0.7 ? 'border-green-500' : 'border-yellow-500'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Loading State */}
        {state === 'loading' && (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[18px]">Analyzing your website...</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              This takes about 4 seconds
            </p>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="p-8 text-center">
            <p className="text-red-600 text-[18px] mb-4">{error}</p>
            <button
              onClick={onClose}
              className="text-[#0066FF] hover:underline"
            >
              Try a different URL
            </button>
          </div>
        )}

        {/* Form State */}
        {(state === 'form' || state === 'submitting') && (
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-gray-900 text-[24px] font-semibold mb-6">
              Confirm Your Details
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Company name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11 ${getConfidenceClass(prefill?.company?.confidence)}`}
                  required
                />
                {prefill?.company?.confidence &&
                  prefill.company.confidence < 0.7 && (
                    <p className="text-yellow-600 text-xs mt-1">
                      Please verify
                    </p>
                  )}
              </div>

              {/* City, State, ZIP row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11 ${getConfidenceClass(prefill?.city?.confidence)}`}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    State
                  </label>
                  <select
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11 bg-white ${getConfidenceClass(prefill?.state?.confidence)}`}
                  >
                    <option value="">--</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11 ${getConfidenceClass(prefill?.zip?.confidence)}`}
                    maxLength={5}
                  />
                  {prefill?.zip?.confidence && prefill.zip.confidence < 0.7 && (
                    <p className="text-yellow-600 text-xs mt-1">
                      Please verify
                    </p>
                  )}
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 text-gray-900 h-11 bg-white ${getConfidenceClass(prefill?.industry?.confidence)}`}
                >
                  <option value="">Select industry...</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {prefill?.industry?.confidence &&
                  prefill.industry.confidence < 0.7 && (
                    <p className="text-yellow-600 text-xs mt-1">
                      Please verify
                    </p>
                  )}
              </div>

              <hr className="my-6" />

              {/* Revenue */}
              <div>
                <label className="block text-gray-900 font-medium mb-3">
                  Monthly Revenue{' '}
                  <span className="text-gray-500 font-normal">
                    (estimate is fine)
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {REVENUE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all ${
                        revenueRange === option.value
                          ? 'border-[#0066FF] border-2 bg-blue-50 text-[#0066FF]'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="revenue"
                        value={option.value}
                        className="sr-only"
                        checked={revenueRange === option.value}
                        onChange={() => setRevenueRange(option.value)}
                      />
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="my-6" />

              {/* Terms */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">
                    I accept the{' '}
                    <a
                      href="/legal/terms"
                      target="_blank"
                      className="text-[#0066FF] hover:underline"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/legal/privacy"
                      target="_blank"
                      className="text-[#0066FF] hover:underline"
                    >
                      Privacy Policy
                    </a>{' '}
                    <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">
                    Send me tips and updates
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 text-white text-[16px] font-semibold rounded-md shadow-[0_4px_14px_rgba(0,102,255,0.4)] transition-all duration-200 mt-4"
              >
                {state === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Starting analysis...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Website</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
