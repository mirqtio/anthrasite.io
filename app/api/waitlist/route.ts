import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for development
// In production, this could be replaced with Vercel KV or another service
const waitlistEntries = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, email } = body

    // Basic validation
    if (!domain || !email) {
      return NextResponse.json(
        { error: 'Domain and email are required' },
        { status: 400 }
      )
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Normalize domain (remove protocol if included)
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')

    // Store the entry
    const entryId = Date.now().toString()
    const entry = {
      id: entryId,
      domain: normalizedDomain,
      email: email.toLowerCase(),
      timestamp: new Date().toISOString(),
    }

    waitlistEntries.set(entryId, entry)

    // Log for visibility
    console.log('New waitlist submission:', entry)

    return NextResponse.json({
      success: true,
      position: waitlistEntries.size,
      normalizedDomain,
    })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return current waitlist size
  return NextResponse.json({
    count: waitlistEntries.size,
    entries: Array.from(waitlistEntries.values()),
  })
}