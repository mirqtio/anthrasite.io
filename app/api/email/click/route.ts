import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { v4 as uuidv4 } from 'uuid'
import { validateClickToken } from '@/lib/email/tokens'
import { getSql } from '@/lib/db'

/**
 * Generate a report token for the redirect destination
 * This is minted server-side to prevent open redirect vulnerabilities
 */
async function mintReportToken(leadId: string, runId: string): Promise<string> {
  const secret = process.env.SURVEY_SECRET_KEY
  if (!secret) {
    throw new Error('SURVEY_SECRET_KEY not configured')
  }

  const secretKey = new TextEncoder().encode(secret)
  const jti = `report-${uuidv4()}`

  // 90-day expiration
  const exp = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60

  const token = await new SignJWT({
    leadId,
    runId,
    jti,
    scope: 'report:download',
    iss: 'anthrasite',
    version: 'v1',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .setAudience('report')
    .sign(secretKey)

  return token
}

/**
 * Log click event to database
 * Non-critical - failures are logged but don't block the redirect
 */
async function logClickEvent(
  leadId: string,
  runId: string,
  linkType: string,
  userAgent: string | null
): Promise<void> {
  try {
    const sql = getSql()
    await sql`
      INSERT INTO email_click_events (lead_id, run_id, link_type, user_agent)
      VALUES (${parseInt(leadId, 10)}, ${runId}, ${linkType}, ${userAgent})
    `
  } catch (error) {
    // Log but don't fail - redirect is more important than logging
    console.error(
      '[ClickTracking] Failed to log click event:',
      error instanceof Error ? error.message : String(error)
    )
  }
}

/**
 * GET /api/email/click?t=<JWT>
 *
 * Email click tracking endpoint
 * Routes clicks through anthrasite.io for domain reputation building
 *
 * Security design (from SCRATCHPAD):
 * - Token does NOT contain destination URL (prevents open redirect)
 * - Destination is derived server-side based on linkType
 * - Token validates aud=email, scope=email:click
 *
 * Flow:
 * 1. Validate click token
 * 2. Log click event to database
 * 3. Construct destination URL server-side
 * 4. Redirect with security headers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('t')

    if (!token) {
      console.error('[ClickTracking] Missing token parameter')
      return NextResponse.json(
        { error: 'missing_token', message: 'Token required' },
        { status: 400 }
      )
    }

    // Validate click token
    const payload = await validateClickToken(token)
    if (!payload) {
      console.error('[ClickTracking] Token validation failed')
      return NextResponse.json(
        { error: 'invalid_token', message: 'Link expired or invalid' },
        { status: 401 }
      )
    }

    console.log('[ClickTracking] Valid token:', {
      leadId: payload.leadId,
      runId: payload.runId,
      linkType: payload.linkType,
      download: payload.download,
    })

    // Log click event (non-blocking, no IP per SCRATCHPAD privacy requirements)
    const userAgent = request.headers.get('user-agent')
    await logClickEvent(
      payload.leadId,
      payload.runId,
      payload.linkType,
      userAgent
    )

    // Derive destination server-side (no open redirect vulnerability)
    let destinationUrl: string

    if (payload.linkType === 'report_download') {
      // Mint a fresh report token for the destination
      const reportToken = await mintReportToken(payload.leadId, payload.runId)

      // Build destination URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anthrasite.io'
      const downloadParam = payload.download ? '1' : '0'
      destinationUrl = `${baseUrl}/api/report/open?sid=${encodeURIComponent(reportToken)}&download=${downloadParam}`
    } else {
      // Unknown link type - this should never happen due to validation
      console.error('[ClickTracking] Unknown linkType:', payload.linkType)
      return NextResponse.json(
        { error: 'invalid_link_type', message: 'Unknown link type' },
        { status: 400 }
      )
    }

    console.log('[ClickTracking] Redirecting to destination')

    // Redirect with security headers
    const response = NextResponse.redirect(destinationUrl, 302)

    // Security headers (from SCRATCHPAD)
    response.headers.set('Cache-Control', 'no-store')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Referrer-Policy', 'no-referrer')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')

    return response
  } catch (error) {
    console.error(
      '[ClickTracking] Error:',
      error instanceof Error ? error.message : String(error)
    )
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to process click' },
      { status: 500 }
    )
  }
}
