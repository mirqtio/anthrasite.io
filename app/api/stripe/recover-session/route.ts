import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { retrieveSession, createCheckoutSession } from '@/lib/stripe/checkout'
import { validateUTMToken } from '@/lib/utm/crypto'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { trackEvent } from '@/lib/analytics/analytics-server'

const recoverSessionSchema = z.object({
  utm: z.string(),
  sessionId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = recoverSessionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { utm, sessionId } = validation.data

    // Validate UTM token
    const utmValidation = await validateUTMToken(utm)
    if (!utmValidation.valid || !utmValidation.payload) {
      return NextResponse.json(
        { error: 'Invalid or expired UTM token' },
        { status: 400 }
      )
    }

    const { businessId } = utmValidation.payload

    // Track recovery attempt
    await trackEvent('checkout_recovery_attempt', {
      business_id: businessId,
      utm_token: utm,
      has_session_id: !!sessionId,
    })

    // Try to retrieve existing session if provided
    if (sessionId) {
      const existingSession = await retrieveSession(sessionId)

      if (existingSession && existingSession.status === 'open') {
        // Session is still valid
        await trackEvent('checkout_recovery_success', {
          business_id: businessId,
          session_id: sessionId,
          recovery_type: 'existing_session',
        })

        return NextResponse.json({
          success: true,
          sessionUrl: existingSession.url,
          sessionId: existingSession.id,
        })
      }
    }

    // Create new session if no valid existing session
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`

    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Create new checkout session
    const newSession = await createCheckoutSession({
      businessId,
      utmToken: utm,
      customerEmail: business.email || undefined,
      baseUrl,
    })

    await trackEvent('checkout_recovery_success', {
      business_id: businessId,
      session_id: newSession.id,
      recovery_type: 'new_session',
    })

    return NextResponse.json({
      success: true,
      sessionUrl: newSession.url,
      sessionId: newSession.id,
    })
  } catch (error) {
    console.error('Session recovery error:', error)

    await trackEvent('checkout_recovery_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to recover checkout session' },
      { status: 500 }
    )
  }
}
