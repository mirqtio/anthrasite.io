import React from 'react'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MonitoringProvider } from '../MonitoringProvider'
import { initializeMonitoring } from '@/lib/monitoring'

// Mock monitoring library
jest.mock('@/lib/monitoring', () => ({
  initializeMonitoring: jest.fn(),
}))

// Mock console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
}

describe('MonitoringProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.error = jest.fn()
    console.warn = jest.fn()
  })

  afterEach(() => {
    console.error = originalConsole.error
    console.warn = originalConsole.warn
  })

  it('should render children', () => {
    const { getByText } = render(
      <MonitoringProvider>
        <div>Test Child</div>
      </MonitoringProvider>
    )

    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('should initialize monitoring on mount', async () => {
    render(
      <MonitoringProvider>
        <div>Test</div>
      </MonitoringProvider>
    )

    await waitFor(() => {
      expect(initializeMonitoring).toHaveBeenCalled()
    })
  })

  it('should only initialize monitoring once', async () => {
    const { rerender } = render(
      <MonitoringProvider>
        <div>Test</div>
      </MonitoringProvider>
    )

    await waitFor(() => {
      expect(initializeMonitoring).toHaveBeenCalledTimes(1)
    })

    // Re-render with different children
    rerender(
      <MonitoringProvider>
        <div>Different Child</div>
      </MonitoringProvider>
    )

    // Should still only be called once
    expect(initializeMonitoring).toHaveBeenCalledTimes(1)
  })

  it('should handle monitoring initialization errors', async () => {
    ;(initializeMonitoring as jest.Mock).mockRejectedValue(
      new Error('Init failed')
    )

    render(
      <MonitoringProvider>
        <div>Test</div>
      </MonitoringProvider>
    )

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Failed to initialize monitoring:',
        expect.any(Error)
      )
    })
  })

  it('should not initialize in test environment', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'test'

    render(
      <MonitoringProvider>
        <div>Test</div>
      </MonitoringProvider>
    )

    expect(initializeMonitoring).not.toHaveBeenCalled()

    process.env.NODE_ENV = originalEnv
  })

  it('should initialize in production environment', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <MonitoringProvider>
        <div>Test</div>
      </MonitoringProvider>
    )

    await waitFor(() => {
      expect(initializeMonitoring).toHaveBeenCalled()
    })

    process.env.NODE_ENV = originalEnv
  })

  it('should initialize in development environment', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <MonitoringProvider>
        <div>Test</div>
      </MonitoringProvider>
    )

    await waitFor(() => {
      expect(initializeMonitoring).toHaveBeenCalled()
    })

    process.env.NODE_ENV = originalEnv
  })

  it('should not break if children are null', () => {
    const { container } = render(
      <MonitoringProvider>{null}</MonitoringProvider>
    )

    expect(container).toBeInTheDocument()
  })

  it('should handle multiple children', () => {
    const { getByText } = render(
      <MonitoringProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </MonitoringProvider>
    )

    expect(getByText('Child 1')).toBeInTheDocument()
    expect(getByText('Child 2')).toBeInTheDocument()
    expect(getByText('Child 3')).toBeInTheDocument()
  })

  it('should pass through props to children', () => {
    const ChildComponent = ({ testProp }: { testProp: string }) => (
      <div>{testProp}</div>
    )

    const { getByText } = render(
      <MonitoringProvider>
        <ChildComponent testProp="Test Value" />
      </MonitoringProvider>
    )

    expect(getByText('Test Value')).toBeInTheDocument()
  })
})
