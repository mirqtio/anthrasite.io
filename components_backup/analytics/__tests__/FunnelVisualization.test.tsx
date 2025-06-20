import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FunnelVisualization } from '../FunnelVisualization'

describe('FunnelVisualization', () => {
  const mockTitle = 'Purchase Funnel'
  const mockSteps = [
    {
      name: 'Homepage Visit',
      count: 10000,
      percentage: 100,
    },
    {
      name: 'Purchase Page',
      count: 5000,
      percentage: 50,
    },
    {
      name: 'Checkout Started',
      count: 2000,
      percentage: 20,
    },
    {
      name: 'Purchase Complete',
      count: 1000,
      percentage: 10,
    },
  ]

  it('should render funnel name', () => {
    render(<FunnelVisualization title={mockTitle} steps={mockSteps} />)
    expect(screen.getByText('Purchase Funnel')).toBeInTheDocument()
  })

  it('should render all funnel steps', () => {
    render(<FunnelVisualization title={mockTitle} steps={mockSteps} />)

    expect(screen.getByText('Homepage Visit')).toBeInTheDocument()
    expect(screen.getByText('Purchase Page')).toBeInTheDocument()
    expect(screen.getByText('Checkout Started')).toBeInTheDocument()
    expect(screen.getByText('Purchase Complete')).toBeInTheDocument()
  })

  it('should display visitor counts', () => {
    render(<FunnelVisualization title={mockTitle} steps={mockSteps} />)

    expect(screen.getByText('10,000')).toBeInTheDocument()
    expect(screen.getByText('5,000')).toBeInTheDocument()
    expect(screen.getByText('2,000')).toBeInTheDocument()
    expect(screen.getByText('1,000')).toBeInTheDocument()
  })

  it('should display conversion rates', () => {
    render(<FunnelVisualization title={mockTitle} steps={mockSteps} />)

    // Check that percentage rates are displayed for each step
    const percentageElements = screen.getAllByText(/\d+\.0%/)
    expect(percentageElements.length).toBeGreaterThan(0)
  })

  it('should display dropoff rates', () => {
    render(<FunnelVisualization title={mockTitle} steps={mockSteps} />)

    // Dropoff between steps: (10000-5000)/10000 = 50%, (5000-2000)/5000 = 60%, (2000-1000)/2000 = 50%
    const fiftyPercentDropoffs = screen.getAllByText('-50.0%')
    expect(fiftyPercentDropoffs).toHaveLength(2) // Step 2 and Step 4 both have 50% dropoff
    expect(screen.getByText('-60.0%')).toBeInTheDocument()
  })

  it('should show total conversion rate', () => {
    render(<FunnelVisualization title={mockTitle} steps={mockSteps} />)

    expect(screen.getByText('Total Conversion')).toBeInTheDocument()
    // The total conversion should be the last step's percentage
    const totalConversionElements = screen.getAllByText('10.0%')
    expect(totalConversionElements.length).toBeGreaterThan(0)
  })

  it('should handle steps with same count', () => {
    const sameCountSteps = [
      { name: 'Step 1', count: 1000, percentage: 100 },
      { name: 'Step 2', count: 1000, percentage: 100 },
    ]

    render(
      <FunnelVisualization title="Same Count Funnel" steps={sameCountSteps} />
    )

    expect(screen.getByText('Same Count Funnel')).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
  })

  it('should render with custom className', () => {
    render(
      <FunnelVisualization
        title={mockTitle}
        steps={mockSteps}
        className="custom-class"
      />
    )

    // Check that the Card component receives the className
    expect(
      screen.getByText('Purchase Funnel').closest('.custom-class')
    ).toBeInTheDocument()
  })
})
