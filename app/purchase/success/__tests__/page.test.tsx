import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PurchaseSuccessPage from '../page'
import { useSearchParams } from 'next/navigation'
import { trackEvent } from '@/lib/analytics/analytics-client'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn()
}))

jest.mock('@/lib/analytics/analytics-client', () => ({
  trackEvent: jest.fn()
}))

jest.mock('@/lib/stripe/client', () => ({
  loadStripe: jest.fn().mockResolvedValue({
    redirectToCheckout: jest.fn()
  })
}))

// Mock fetch
global.fetch = jest.fn()

describe('PurchaseSuccessPage', () => {
  const mockSessionId = 'cs_test_123'
  const mockPurchaseData = {
    success: true,
    businessName: 'Test Business',
    domain: 'testbusiness.com',
    email: 'test@example.com',
    amount: 9900,
    reportUrl: 'https://example.com/report.pdf'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default search params
    const searchParams = new URLSearchParams()
    searchParams.set('session_id', mockSessionId)
    ;(useSearchParams as jest.Mock).mockReturnValue(searchParams)
    
    // Mock successful purchase data fetch
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPurchaseData
    })
  })

  it('should render loading state initially', () => {
    render(<PurchaseSuccessPage />)
    
    expect(screen.getByText(/finalizing your purchase/i)).toBeInTheDocument()
  })

  it('should fetch and display purchase details on success', async () => {
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/purchase successful/i)).toBeInTheDocument()
    })
    
    expect(screen.getByText(/test business/i)).toBeInTheDocument()
    expect(screen.getByText(/testbusiness\.com/i)).toBeInTheDocument()
    expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument()
    expect(screen.getByText(/\$99\.00/i)).toBeInTheDocument()
    
    // Check analytics tracking
    expect(trackEvent).toHaveBeenCalledWith('purchase_success_viewed', {
      session_id: mockSessionId,
      amount: 9900,
      domain: 'testbusiness.com'
    })
  })

  it('should show download button when report URL is available', async () => {
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      const downloadButton = screen.getByRole('link', { name: /download your report/i })
      expect(downloadButton).toBeInTheDocument()
      expect(downloadButton).toHaveAttribute('href', mockPurchaseData.reportUrl)
    })
  })

  it('should show report pending message when report URL is not available', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockPurchaseData,
        reportUrl: null
      })
    })
    
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/your report is being generated/i)).toBeInTheDocument()
      expect(screen.getByText(/we'll email it to you shortly/i)).toBeInTheDocument()
    })
  })

  it('should handle missing session ID', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
    
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/missing session id/i)).toBeInTheDocument()
    })
    
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should handle failed purchase verification', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'Payment not found' })
    })
    
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/payment not found/i)).toBeInTheDocument()
    })
  })

  it('should handle network errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/unable to verify your purchase/i)).toBeInTheDocument()
      expect(screen.getByText(/please check your email/i)).toBeInTheDocument()
    })
  })

  it('should handle API errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })
    
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/unable to verify your purchase/i)).toBeInTheDocument()
    })
  })

  it('should make correct API call', async () => {
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/stripe/recover-session?session_id=${mockSessionId}`
      )
    })
  })

  it('should show what happens next section', async () => {
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/what happens next/i)).toBeInTheDocument()
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      expect(screen.getByText(/review your report/i)).toBeInTheDocument()
      expect(screen.getByText(/implement recommendations/i)).toBeInTheDocument()
    })
  })

  it('should show contact support message', async () => {
    render(<PurchaseSuccessPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/if you have any questions/i)).toBeInTheDocument()
      expect(screen.getByText(/support@anthrasite\.io/i)).toBeInTheDocument()
    })
  })
})