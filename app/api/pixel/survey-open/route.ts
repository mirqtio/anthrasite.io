import { NextRequest } from 'next/server'
import { validateSurveyToken, hashIp } from '@/lib/survey/validation'
import { logEmailOpen } from '@/lib/survey/storage'

/**
 * 1x1 transparent GIF pixel (base64 encoded)
 */
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

/**
 * Helper: Extract client IP from request headers
 * Checks x-forwarded-for (Vercel/proxy) then x-real-ip
 */
function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list; take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return null
}

/**
 * Helper: Return 1x1 transparent GIF with no-cache headers
 */
function returnPixel() {
  return new Response(PIXEL_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': PIXEL_GIF.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}

/**
 * GET /api/pixel/survey-open?token=<JWT>&send_id=<UUID>&email_type=<type>&campaign=<name>
 *
 * Email tracking pixel endpoint that:
 * 1. Validates JWT token
 * 2. Extracts request metadata (IP, User-Agent)
 * 3. Logs email open to database (idempotent via sendId)
 * 4. Always returns 1x1 transparent GIF (even on errors)
 *
 * Query Parameters:
 * - token: JWT survey token (required)
 * - send_id: Unique email send ID from LeadShop (required for deduplication)
 * - email_type: Type of email (e.g., 'invite', 'reminder_1') (optional)
 * - campaign: Campaign identifier (e.g., 'q4_2025_survey') (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const sendId = searchParams.get('send_id')
    const emailType = searchParams.get('email_type')
    const campaign = searchParams.get('campaign')

    // Validate required parameters
    if (!token) {
      console.error('[Pixel] Missing token parameter')
      return returnPixel()
    }

    if (!sendId) {
      console.error('[Pixel] Missing send_id parameter')
      return returnPixel()
    }

    // Validate JWT token
    const payload = await validateSurveyToken(token)
    if (!payload) {
      console.error('[Pixel] Token validation failed')
      return returnPixel()
    }

    // Extract request metadata
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Hash IP for privacy (or use 'unknown' if not available)
    const ipHash = clientIp ? hashIp(clientIp) : 'unknown'

    console.log('[Pixel] Tracking email open:', {
      sendId,
      leadId: payload.leadId,
      jti: payload.jti.substring(0, 8) + '...',
      emailType,
      campaign,
      hasIp: !!clientIp,
    })

    // Log to database (idempotent)
    try {
      await logEmailOpen({
        jti: payload.jti,
        leadId: payload.leadId,
        runId: payload.runId,
        version: payload.version,
        batchId: payload.batchId,
        emailType: emailType || undefined,
        campaign: campaign || undefined,
        sendId,
        userAgent,
        ipHash,
      })

      console.log('[Pixel] Successfully logged email open')
    } catch (dbError) {
      // Log error but still return pixel (non-fatal)
      console.error(
        '[Pixel] Database write failed (non-fatal):',
        dbError instanceof Error ? dbError.message : String(dbError)
      )
    }

    // Always return pixel, even if database write failed
    return returnPixel()
  } catch (error) {
    // Catch any unexpected errors
    console.error(
      '[Pixel] Unexpected error:',
      error instanceof Error ? error.message : String(error)
    )
    return returnPixel()
  }
}
