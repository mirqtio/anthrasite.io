import { GET } from '../route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}))

jest.mock('@/lib/monitoring', () => ({
  monitorDbQuery: jest.fn((name, fn) => fn()),
}))

jest.mock('@/lib/monitoring/api-middleware', () => ({
  withMonitoring: (handler: any) => handler,
}))

describe('Health Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_RELEASE = 'test-version'
  })

  it('should return healthy status when database is accessible', async () => {
    // Mock successful database query
    ;(prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      service: 'healthy',
      timestamp: expect.any(String),
      database: 'healthy',
      version: 'test-version',
    })
    expect(prisma.$queryRaw).toHaveBeenCalledWith(expect.arrayContaining(['SELECT 1']))
  })

  it('should return unhealthy status when database is not accessible', async () => {
    // Mock database error
    ;(prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection refused'))

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data).toEqual({
      service: 'healthy',
      timestamp: expect.any(String),
      database: 'unhealthy',
      version: 'test-version',
    })
  })

  it('should use development as version when NEXT_PUBLIC_RELEASE is not set', async () => {
    delete process.env.NEXT_PUBLIC_RELEASE
    ;(prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(data.version).toBe('development')
  })

  it('should include valid ISO timestamp', async () => {
    ;(prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()

    // Verify timestamp is valid ISO string
    const timestamp = new Date(data.timestamp)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })

  it('should handle monitoring wrapper correctly', async () => {
    const { monitorDbQuery } = require('@/lib/monitoring')
    ;(prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health')
    await GET(request)

    expect(monitorDbQuery).toHaveBeenCalledWith('health_check', expect.any(Function))
  })
})