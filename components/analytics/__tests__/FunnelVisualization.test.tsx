import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FunnelVisualization } from '../FunnelVisualization'

describe('FunnelVisualization', () => {
  const mockFunnelData = {
    name: 'Purchase Funnel',
    steps: [
      {
        name: 'Homepage Visit',
        visitors: 10000,
        conversionRate: 100
      },
      {
        name: 'Purchase Page',
        visitors: 5000,
        conversionRate: 50,
        dropoffRate: 50
      },
      {
        name: 'Checkout Started',
        visitors: 2000,
        conversionRate: 20,
        dropoffRate: 60
      },
      {
        name: 'Purchase Complete',
        visitors: 1000,
        conversionRate: 10,
        dropoffRate: 50
      }
    ],
    totalConversionRate: 10
  }

  it('should render funnel name', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    expect(screen.getByText('Purchase Funnel')).toBeInTheDocument()
  })

  it('should render all funnel steps', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    
    expect(screen.getByText('Homepage Visit')).toBeInTheDocument()
    expect(screen.getByText('Purchase Page')).toBeInTheDocument()
    expect(screen.getByText('Checkout Started')).toBeInTheDocument()
    expect(screen.getByText('Purchase Complete')).toBeInTheDocument()
  })

  it('should display visitor counts', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    
    expect(screen.getByText('10,000 visitors')).toBeInTheDocument()
    expect(screen.getByText('5,000 visitors')).toBeInTheDocument()
    expect(screen.getByText('2,000 visitors')).toBeInTheDocument()
    expect(screen.getByText('1,000 visitors')).toBeInTheDocument()
  })

  it('should display conversion rates', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('should display dropoff rates', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    
    expect(screen.getByText('50% drop-off')).toBeInTheDocument()
    expect(screen.getByText('60% drop-off')).toBeInTheDocument()
  })

  it('should show total conversion rate', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    
    expect(screen.getByText('Overall Conversion: 10%')).toBeInTheDocument()
  })

  it('should highlight steps on hover', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    
    const step = screen.getByTestId('funnel-step-1')
    fireEvent.mouseEnter(step)
    
    expect(step).toHaveClass('funnel-step-highlighted')
  })

  it('should show detailed metrics on step click', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    
    const step = screen.getByText('Purchase Page').closest('[data-testid^="funnel-step"]')
    fireEvent.click(step!)
    
    expect(screen.getByText('Step Details')).toBeInTheDocument()
    expect(screen.getByText('Average Time: 2m 30s')).toBeInTheDocument()
  })

  it('should handle empty funnel data', () => {
    const emptyData = {
      name: 'Empty Funnel',
      steps: [],
      totalConversionRate: 0
    }
    
    render(<FunnelVisualization data={emptyData} />)
    
    expect(screen.getByText('No funnel data available')).toBeInTheDocument()
  })

  it('should apply custom colors', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']
    
    render(<FunnelVisualization data={mockFunnelData} colors={customColors} />)
    
    const firstStep = screen.getByTestId('funnel-step-0')
    expect(firstStep).toHaveStyle('background-color: #FF0000')
  })

  it('should be responsive', () => {
    render(<FunnelVisualization data={mockFunnelData} />)
    
    const container = screen.getByTestId('funnel-container')
    expect(container).toHaveClass('funnel-responsive')
  })

  it('should show comparison mode', () => {
    const comparisonData = {
      ...mockFunnelData,
      previousPeriod: {
        steps: [
          { visitors: 9000 },
          { visitors: 4000 },
          { visitors: 1500 },
          { visitors: 800 }
        ]
      }
    }
    
    render(<FunnelVisualization data={comparisonData} showComparison />)
    
    expect(screen.getByText('+11.1%')).toBeInTheDocument() // (10000-9000)/9000
  })

  it('should export funnel data', () => {
    render(<FunnelVisualization data={mockFunnelData} showExport />)
    
    const exportButton = screen.getByText('Export')
    fireEvent.click(exportButton)
    
    expect(screen.getByText('Export as CSV')).toBeInTheDocument()
    expect(screen.getByText('Export as PNG')).toBeInTheDocument()
  })

  it('should handle orientation prop', () => {
    render(<FunnelVisualization data={mockFunnelData} orientation="horizontal" />)
    
    const container = screen.getByTestId('funnel-container')
    expect(container).toHaveClass('funnel-horizontal')
  })

  it('should show funnel insights', () => {
    const dataWithInsights = {
      ...mockFunnelData,
      insights: [
        'Biggest drop-off at checkout (60%)',
        'Consider simplifying checkout process'
      ]
    }
    
    render(<FunnelVisualization data={dataWithInsights} showInsights />)
    
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByText('Biggest drop-off at checkout (60%)')).toBeInTheDocument()
  })
})