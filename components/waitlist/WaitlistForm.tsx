'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/Button/Button'
import { Input } from '@/components/Input/Input'
import { Card } from '@/components/Card/Card'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/analytics-client'
import { useRenderTracking } from '@/lib/monitoring/hooks'

interface WaitlistPosition {
  position: number
  totalCount: number
  estimatedDate?: string
}

export function WaitlistForm() {
  useRenderTracking('WaitlistForm')
  
  const [step, setStep] = useState<'domain' | 'email' | 'success'>('domain')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [normalizedDomain, setNormalizedDomain] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [position, setPosition] = useState<WaitlistPosition | null>(null)
  
  // Debounce domain validation
  useEffect(() => {
    if (!domain) {
      setError(null)
      setSuggestion(null)
      return
    }
    
    const timer = setTimeout(() => {
      validateDomainField(domain)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [domain])
  
  const validateDomainField = async (value: string) => {
    setIsValidating(true)
    setError(null)
    setSuggestion(null)
    
    try {
      const response = await fetch('/api/waitlist/validate-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: value }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error)
        if (data.suggestion) {
          setSuggestion(data.suggestion)
        }
      } else {
        setNormalizedDomain(data.normalizedDomain)
        trackEvent(ANALYTICS_EVENTS.WAITLIST_DOMAIN_VALIDATED, {
          domain: data.normalizedDomain,
          original_domain: value,
        })
      }
    } catch (err) {
      setError('Unable to validate domain')
    } finally {
      setIsValidating(false)
    }
  }
  
  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domain || isValidating || error) {
      return
    }
    
    trackEvent('waitlist.domain_submitted', { domain: normalizedDomain })
    setStep('email')
  }
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || isSubmitting) {
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: normalizedDomain || domain,
          email,
          referralSource: getReferralSource(),
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error)
      } else {
        setPosition(data.position)
        setStep('success')
        trackEvent(ANALYTICS_EVENTS.WAITLIST_SIGNUP, {
          domain: data.normalizedDomain,
          position: data.position?.position,
          variant: 'default', // This would come from A/B test context
        })
      }
    } catch (err) {
      setError('Unable to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getReferralSource = () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('ref') || 'organic'
  }
  
  const handleUseSuggestion = () => {
    if (suggestion) {
      setDomain(suggestion)
      setSuggestion(null)
      setError(null)
    }
  }
  
  const formatEstimatedDate = (dateString?: string) => {
    if (!dateString) return null
    
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }
  
  if (step === 'success' && position) {
    return (
      <Card variant="elevated" className="mx-auto max-w-md p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-anthracite-blue/10 flex items-center justify-center">
            <CheckIcon className="h-8 w-8 text-anthracite-blue" />
          </div>
          
          <h3 className="text-2xl font-bold text-anthracite-black">
            You're on the list!
          </h3>
          
          <div className="space-y-2">
            <p className="text-lg text-anthracite-black/80">
              You're number <strong className="text-anthracite-blue">#{position.position}</strong> out of {position.totalCount}
            </p>
            
            {position.estimatedDate && (
              <p className="text-sm text-anthracite-black/60">
                Estimated access: {formatEstimatedDate(position.estimatedDate)}
              </p>
            )}
          </div>
          
          <div className="pt-4 border-t border-anthracite-gray-100">
            <p className="text-sm text-anthracite-black/60">
              We'll email you at <strong>{email}</strong> when Anthrasite is ready for {normalizedDomain || domain}
            </p>
          </div>
        </div>
      </Card>
    )
  }
  
  return (
    <Card variant="bordered" className="mx-auto max-w-md">
      <form onSubmit={step === 'domain' ? handleDomainSubmit : handleEmailSubmit} className="space-y-4">
        {step === 'domain' ? (
          <>
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-anthracite-black mb-2">
                Enter your website domain
              </label>
              <Input
                id="domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                error={error || undefined}
                disabled={isValidating}
                className="w-full"
                autoFocus
              />
              
              {error && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-anthracite-error">{error}</p>
                  
                  {suggestion && (
                    <p className="text-sm text-anthracite-black/60">
                      Did you mean{' '}
                      <button
                        type="button"
                        onClick={handleUseSuggestion}
                        className="text-anthracite-blue underline hover:no-underline"
                      >
                        {suggestion}
                      </button>
                      ?
                    </p>
                  )}
                </div>
              )}
              
              {isValidating && (
                <p className="mt-2 text-sm text-anthracite-black/60">
                  Validating domain...
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!domain || isValidating || !!error}
              loading={isValidating}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-anthracite-black/60">
                Great! We'll analyze <strong>{normalizedDomain || domain}</strong>
              </p>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-anthracite-black mb-2">
                Enter your email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error || undefined}
                disabled={isSubmitting}
                className="w-full"
                autoFocus
              />
              
              {error && (
                <p className="mt-2 text-sm text-anthracite-error">{error}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={!email || isSubmitting}
                loading={isSubmitting}
              >
                Join Waitlist
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('domain')
                  setError(null)
                }}
                disabled={isSubmitting}
              >
                Back
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}