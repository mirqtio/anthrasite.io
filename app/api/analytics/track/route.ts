import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { trackServerEvent } from '@/lib/analytics/analytics-server'

const trackEventSchema = z.object({
  event: z.string(),
  properties: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    let body: any
    try {
      body = await req.json()
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const validation = trackEventSchema.safeParse(body)

    if (!validation.success) {
      // Check if it's specifically missing event name
      if (!body.event) {
        return NextResponse.json(
          { error: 'Event name is required' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { event, properties } = validation.data

    // Track the event server-side (pass undefined if properties not provided)
    await trackServerEvent(
      event,
      'properties' in validation.data ? properties : undefined
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
