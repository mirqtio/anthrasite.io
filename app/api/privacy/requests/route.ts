// app/api/privacy/requests/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// A simple in-memory store for rate limiting.
// For production, a more robust solution like Redis would be preferable.
const rateLimitStore: Record<string, { count: number; expiry: number }> = {}

async function rateLimit(ip: string) {
  // Disable rate limiting in E2E test mode to allow parallel test execution
  if (process.env.NEXT_PUBLIC_E2E === 'true') {
    return false
  }

  const now = Date.now()
  const windowMs = 3600000 // 1 hour
  const max = 5 // Max 5 requests per hour per IP

  const record = rateLimitStore[ip]

  if (record && now < record.expiry) {
    record.count++
    if (record.count > max) {
      return true // Rate limit exceeded
    }
  } else {
    rateLimitStore[ip] = { count: 1, expiry: now + windowMs }
  }

  return false // Not rate limited
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'

  const isRateLimited = await rateLimit(ip)
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { email, type } = await req.json()

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: email and type' },
        { status: 400 }
      )
    }

    const validTypes = [
      'access',
      'deletion',
      'correction',
      'do_not_sell_share',
      'appeal',
    ]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      )
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 45) // Set due date 45 days from now

    const newRequest = await prisma.privacyRequest.create({
      data: {
        email,
        requestType: type,
        dueDate,
      },
    })

    // TODO: Trigger an email notification to privacy@anthrasite.io

    return NextResponse.json(
      {
        message: 'Your request has been received.',
        trackingId: newRequest.trackingId,
        dueDate: newRequest.dueDate.toISOString().split('T')[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('DSAR Request Error:', error)
    return NextResponse.json(
      { error: 'An internal error occurred.' },
      { status: 500 }
    )
  }
}
