'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ValidateUTMResponse } from '@/app/api/validate-utm/route'

export interface ReportIssue {
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
}

export interface ReportData {
  issueCount?: number
  overallScore?: number
  performanceScore?: number
  securityScore?: number
  topIssues?: ReportIssue[]
}

export interface UTMValidationState {
  loading: boolean
  valid: boolean
  error?: string
  businessId?: string
  businessName?: string
  reportData?: ReportData
}

export function useUTMValidation(): UTMValidationState {
  const searchParams = useSearchParams()
  const [state, setState] = useState<UTMValidationState>({
    loading: true,
    valid: false,
  })

  useEffect(() => {
    const utm = searchParams.get('utm')

    if (!utm) {
      setState({
        loading: false,
        valid: false,
        error: 'No UTM parameter found',
      })
      return
    }

    // Validate UTM
    const validateUTM = async () => {
      try {
        const response = await fetch(
          `/api/validate-utm?utm=${encodeURIComponent(utm)}`
        )
        const data: ValidateUTMResponse = await response.json()

        if (data.valid) {
          setState({
            loading: false,
            valid: true,
            businessId: data.businessId,
            businessName: data.businessName,
            reportData: data.reportData,
          })
        } else {
          setState({
            loading: false,
            valid: false,
            error: data.error || 'Invalid UTM',
          })
        }
      } catch (error) {
        setState({
          loading: false,
          valid: false,
          error: 'Failed to validate UTM',
        })
      }
    }

    validateUTM()
  }, [searchParams])

  return state
}

// Hook to check if we're in purchase mode
export function usePurchaseMode(): boolean {
  const [isPurchaseMode, setIsPurchaseMode] = useState(false)

  useEffect(() => {
    // Check cookies on client side
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      },
      {} as Record<string, string>
    )

    setIsPurchaseMode(cookies.site_mode === 'purchase')
  }, [])

  return isPurchaseMode
}

// Hook to get business ID from cookie
export function useBusinessId(): string | null {
  const [businessId, setBusinessId] = useState<string | null>(null)

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      },
      {} as Record<string, string>
    )

    setBusinessId(cookies.business_id || null)
  }, [])

  return businessId
}
