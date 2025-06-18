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
        isControl: true,
      },
      {
        id: 'variant_a',
        name: 'Variant A',
        visitors: 1000,
        conversions: 75,
        conversionRate: 7.5,
        improvement: 50,
        confidence: 95,
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
    expect(screen.getByText('5.00%')).toBeInTheDocument()
    expect(screen.getByText('7.50%')).toBeInTheDocument()
  })

  it('should show improvement percentage', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('+50.0%')).toBeInTheDocument()
    })
  })

  it('should show statistical significance', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument()
      expect(screen.getByText('✓')).toBeInTheDocument()
    })
  })

  it('should handle test status indicators', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument()
    })
  })

  it('should handle completed tests', async () => {
    const completedTest = {
      ...mockTestData,
      status: 'completed',
      variants: [
        {
          ...mockTestData.variants[0],
        },
        {
          ...mockTestData.variants[1],
          isWinner: true,
        },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tests: [completedTest] }),
    })

    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('Winner')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })

  it('should allow deploying winning variant', async () => {
    const mockOnDeploy = jest.fn()
    const completedTest = {
      ...mockTestData,
      status: 'completed',
      variants: [
        {
          ...mockTestData.variants[0],
        },
        {
          ...mockTestData.variants[1],
          isWinner: true,
        },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tests: [completedTest] }),
    })

    render(<ABTestResults onDeploy={mockOnDeploy} />)

    await waitFor(() => {
      const deployButton = screen.getByText('Deploy Winner')
      expect(deployButton).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Deploy Winner'))

    expect(mockOnDeploy).toHaveBeenCalledWith('variant_a')
  })

  it('should handle empty results', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ tests: [] }),
    })

    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByTestId('ab-test-empty')).toBeInTheDocument()
      expect(screen.getByText('No A/B tests found')).toBeInTheDocument()
    })
  })

  it('should handle fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByTestId('ab-test-error')).toBeInTheDocument()
      expect(
        screen.getByText('Error loading A/B tests: Network error')
      ).toBeInTheDocument()
    })
  })

  it('should show control variant label', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText('(Control)')).toBeInTheDocument()
    })
  })

  it('should show running test notice', async () => {
    render(<ABTestResults />)

    await waitFor(() => {
      expect(screen.getByText(/Test is still running/)).toBeInTheDocument()
      expect(screen.getByText(/Wait for 95% confidence/)).toBeInTheDocument()
    })
  })
})
