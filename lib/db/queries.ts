import { prisma } from '@/lib/db'

export interface Business {
  id: string
  name: string
  domain: string
  email?: string
}

export async function getBusinessByDomain(
  domain: string
): Promise<Business | null> {
  // This is a placeholder implementation for testing
  // In a real application, this would query the database
  const mockBusinesses: Business[] = [
    {
      id: 'biz_123',
      name: 'Test Business',
      domain: 'testbusiness.com',
      email: 'test@example.com',
    },
    {
      id: 'biz_456',
      name: 'Example Corp',
      domain: 'example.com',
      email: 'contact@example.com',
    },
  ]

  return mockBusinesses.find((business) => business.domain === domain) || null
}

export async function createBusiness(
  data: Omit<Business, 'id'>
): Promise<Business> {
  // Placeholder implementation
  return {
    id: `biz_${Date.now()}`,
    ...data,
  }
}
