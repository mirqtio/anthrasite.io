import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ABTestResults } from '../ABTestResults'

// Mock fetch
global.fetch = jest.fn()

describe('ABTestResults', () => {
  const mockTestData = {
    id: 'homepage_v2',
    name: 'Homepage Optimization',
    status: 'running',
    startDate: '2024-01-01',
    variants: [
      {
        id: 'control',
        name: 'Control',
        visitors: 1000,
        conversions: 50,
        conversionRate: 5.0,
      },
      {
        id: 'variant_a',
        name: 'Variant A',
        visitors: 1000,
        conversions: 75,
        conversionRate: 7.5,
        improvement: 50,
        significance: 95,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tests: [mockTestData] }),
    })
  })

  it('should render loading state initially', () => {
    render(<ABTestResults />)
    expect(screen.getByTestId('ab-test-loading')).toBeInTheDocument()
  })

  it('should fetch and display test results', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('Homepage Optimization')).toBeInTheDocument()
    })

    expect(screen.getByText('Control')).toBeInTheDocument()
    expect(screen.getByText('Variant A')).toBeInTheDocument()
    expect(screen.getByText('5.0%')).toBeInTheDocument()
    expect(screen.getByText('7.5%')).toBeInTheDocument()
  })

  it('should show improvement percentage', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('+50%')).toBeInTheDocument()
    })
  })

  it('should show statistical significance', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('95% significant')).toBeInTheDocument()
    })
  })

  it('should handle test status indicators', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      const statusBadge = screen.getByTestId('status-badge')
      expect(statusBadge).toHaveTextContent('running')
      expect(statusBadge).toHaveClass('status-running')
    })
  })

  it('should handle completed tests', async () => {
    const completedTest = {
      ...mockTestData,
      status: 'completed',
      winner: 'variant_a',
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tests: [completedTest] }),
    })

    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('Winner: Variant A')).toBeInTheDocument()
    })
  })

  it('should allow deploying winning variant', async () => {
    const completedTest = {
      ...mockTestData,
      status: 'completed',
      winner: 'variant_a',
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tests: [completedTest] }),
    })

    render(<ABTestResults />)

    await waitFor(() => {
      const deployButton = screen.getByText('Deploy Winner')
      expect(deployButton).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Deploy Winner'))

    expect(fetch).toHaveBeenCalledWith(
      '/api/ab-tests/deploy',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('variant_a'),
      })
    )
  })

  it('should refresh results', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('Homepage Optimization')).toBeInTheDocument()
    })

    const refreshButton = screen.getByLabelText('Refresh results')
    fireEvent.click(refreshButton)

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('should handle empty results', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tests: [] }),
    })

    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('No active A/B tests')).toBeInTheDocument()
    })
  })

  it('should handle fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(<ABTestResults />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load test results')
      ).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('should filter tests by status', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('Homepage Optimization')).toBeInTheDocument()
    })

    const filterSelect = screen.getByLabelText('Filter by status')
    fireEvent.change(filterSelect, { target: { value: 'completed' } })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('status=completed'),
      expect.any(Object)
    )
  })

  it('should display confidence intervals', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('CI: 6.5% - 8.5%')).toBeInTheDocument()
    })
  })

  it('should show visitor distribution chart', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      const chart = screen.getByTestId('visitor-distribution-chart')
      expect(chart).toBeInTheDocument()
    })
  })

  it('should export results as CSV', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('Homepage Optimization')).toBeInTheDocument()
    })

    const exportButton = screen.getByText('Export CSV')
    fireEvent.click(exportButton)

    // Check if download was triggered
    expect(screen.getByTestId('download-link')).toHaveAttribute(
      'download',
      expect.stringContaining('.csv')
    )
  })
})
