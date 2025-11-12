// app/api/privacy/requests/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// TODO: Implement Redis-based rate limiting for production
// In-memory rate limiting removed due to:
// 1. Doesn't persist across deploys/restarts
// 2. Doesn't work with multiple server instances
// 3. Caused test flakiness in parallel E2E test execution
// See SCRATCHPAD.md for ticket to implement proper rate limiting

export async function POST(req: Request) {
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
