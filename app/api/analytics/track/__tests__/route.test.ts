import { POST } from '../route'
import { NextRequest } from 'next/server'
import { trackServerEvent } from '@/lib/analytics/analytics-server'

// Mock dependencies
jest.mock('@/lib/analytics/analytics-server')

describe('Analytics Track API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should track event successfully', async () => {
    const eventData = {
      event: 'test_event',
      properties: {
        value: 100,
        category: 'test',
      },
    }

    const request = new NextRequest(
      'http://localhost:3000/api/analytics/track',
      {
        method: 'POST',
        body: JSON.stringify(eventData),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
    expect(trackServerEvent).toHaveBeenCalledWith('test_event', {
      value: 100,
      category: 'test',
    })
  })

  it('should handle missing event name', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics/track',
      {
        method: 'POST',
        body: JSON.stringify({ properties: { value: 100 } }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Event name is required' })
    expect(trackServerEvent).not.toHaveBeenCalled()
  })

  it('should handle invalid JSON', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics/track',
      {
        method: 'POST',
        body: 'invalid json',
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid request body' })
  })

  it('should handle tracking errors', async () => {
    ;(trackServerEvent as jest.Mock).mockRejectedValue(
      new Error('Tracking failed')
    )

    const request = new NextRequest(
      'http://localhost:3000/api/analytics/track',
      {
        method: 'POST',
        body: JSON.stringify({ event: 'test_event' }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to track event' })
  })

  it('should accept events without properties', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics/track',
      {
        method: 'POST',
        body: JSON.stringify({ event: 'simple_event' }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
    expect(trackServerEvent).toHaveBeenCalledWith('simple_event', undefined)
  })
})
