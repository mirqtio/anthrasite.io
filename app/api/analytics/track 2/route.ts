import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { trackEvent } from '@/lib/analytics/analytics-server'

const trackEventSchema = z.object({
  eventName: z.string(),
  properties: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = trackEventSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { eventName, properties } = validation.data

    // Track the event server-side
    await trackEvent(eventName, properties)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
