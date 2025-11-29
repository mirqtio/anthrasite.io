import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// Throttling map (simple in-memory for now, could be Redis later)
// Key: IP hash, Value: Timestamp
const throttleMap = new Map<string, number>()
const THROTTLE_WINDOW_MS = 60 * 1000 // 1 minute
const MIN_REQUEST_INTERVAL_MS = 2000 // 2 seconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const source = searchParams.get('source')
    const respondentId =
      searchParams.get('pid') || searchParams.get('respondentId')
    const ref = searchParams.get('ref')

    // 1. Throttling & Abuse Prevention
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')
    const now = Date.now()

    if (throttleMap.has(ipHash)) {
      const lastRequest = throttleMap.get(ipHash)!
      if (now - lastRequest < MIN_REQUEST_INTERVAL_MS) {
        return new NextResponse('Too Many Requests', { status: 429 })
      }
    }
    throttleMap.set(ipHash, now)

    // Cleanup throttle map occasionally
    if (throttleMap.size > 1000) {
      for (const [key, time] of throttleMap.entries()) {
        if (now - time > THROTTLE_WINDOW_MS) {
          throttleMap.delete(key)
        }
      }
    }

    // 2. Generate JWT
    if (!process.env.SURVEY_SECRET_KEY) {
      console.error('SURVEY_SECRET_KEY not configured')
      return new NextResponse('Server Configuration Error', { status: 500 })
    }

    const secret = new TextEncoder().encode(process.env.SURVEY_SECRET_KEY)
    const jti = uuidv4()

    // Expiration: 14 days for public links
    const exp = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60

    const token = await new SignJWT({
      leadId: undefined, // Explicitly undefined
      jti,
      source: source || undefined,
      respondentId: respondentId || undefined,
      ref: ref || undefined,
      scope: 'feedback',
      version: 'v1',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(exp)
      .setAudience('survey')
      .sign(secret)

    // 3. Redirect to Survey
    const surveyUrl = new URL('/survey', request.url)
    surveyUrl.searchParams.set('token', token)

    return NextResponse.redirect(surveyUrl)
  } catch (error) {
    console.error('Error generating public survey token:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
