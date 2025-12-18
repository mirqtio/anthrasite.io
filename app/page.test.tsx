import React, { Suspense } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import HomePage from './page'

// Mock next/headers
const mockCookiesStore = {
  get: jest.fn(),
}
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookiesStore)),
}))

// Mock the homepage components
jest.mock('@/components/homepage/OrganicHomepage', () => ({
  OrganicHomepage: () => (
    <div data-testid="organic-homepage">Organic Homepage</div>
  ),
}))

jest.mock('@/components/homepage/PurchaseHomepage', () => ({
  PurchaseHomepage: () => (
    <div data-testid="purchase-homepage">Purchase Homepage</div>
  ),
}))

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders OrganicHomepage by default', async () => {
    mockCookiesStore.get.mockReturnValue(undefined) // No cookie
    const searchParams = Promise.resolve({}) // No params

    const jsx = await HomePage({ searchParams })
    render(jsx)

    expect(screen.getByTestId('organic-homepage')).toBeInTheDocument()
    expect(screen.queryByTestId('purchase-homepage')).not.toBeInTheDocument()
  })

  it('renders PurchaseHomepage when utm param is present', async () => {
    mockCookiesStore.get.mockReturnValue(undefined)
    const searchParams = Promise.resolve({ utm: 'test-token' })

    const jsx = await HomePage({ searchParams })
    render(jsx)

    expect(screen.getByTestId('purchase-homepage')).toBeInTheDocument()
    expect(screen.queryByTestId('organic-homepage')).not.toBeInTheDocument()
  })

  it('renders PurchaseHomepage when site_mode cookie is purchase', async () => {
    mockCookiesStore.get.mockReturnValue({ value: 'purchase' })
    const searchParams = Promise.resolve({})

    const jsx = await HomePage({ searchParams })
    render(jsx)

    expect(screen.getByTestId('purchase-homepage')).toBeInTheDocument()
    expect(screen.queryByTestId('organic-homepage')).not.toBeInTheDocument()
  })

  it('renders OrganicHomepage when site_mode cookie is organic', async () => {
    mockCookiesStore.get.mockReturnValue({ value: 'organic' })
    const searchParams = Promise.resolve({})

    const jsx = await HomePage({ searchParams })
    render(jsx)

    expect(screen.getByTestId('organic-homepage')).toBeInTheDocument()
    expect(screen.queryByTestId('purchase-homepage')).not.toBeInTheDocument()
  })

  // Edge case: UTM overrides organic cookie
  it('renders PurchaseHomepage when utm present even if cookie is organic', async () => {
    mockCookiesStore.get.mockReturnValue({ value: 'organic' })
    const searchParams = Promise.resolve({ utm: 'override' })

    const jsx = await HomePage({ searchParams })
    render(jsx)

    expect(screen.getByTestId('purchase-homepage')).toBeInTheDocument()
  })
})
