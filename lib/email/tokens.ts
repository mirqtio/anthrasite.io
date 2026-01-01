import { jwtVerify, SignJWT } from 'jose'
import { v4 as uuidv4 } from 'uuid'

/**
 * Email click token payload
 * Used for tracking email link clicks through anthrasite.io
 */
export interface ClickTokenPayload {
  leadId: string
  runId: string
  linkType: 'report_download' // Extensible for future link types
  download: boolean
  jti: string
  aud: 'email'
  scope: 'email:click'
  iat: number
  exp: number
}

/**
 * Options for minting a click token
 */
export interface MintClickTokenOptions {
  leadId: string
  runId: string
  linkType: 'report_download'
  download?: boolean
}

/**
 * Mint a click tracking token for email links
 *
 * Token design (from SCRATCHPAD):
 * - No destination URL in token (prevents open redirect vulnerability)
 * - Server derives destination from linkType
 * - 90-day expiration (matches report token TTL)
 */
export async function mintClickToken(
  options: MintClickTokenOptions
): Promise<string> {
  const secret = process.env.SURVEY_SECRET_KEY
  if (!secret) {
    throw new Error('SURVEY_SECRET_KEY not configured')
  }

  const secretKey = new TextEncoder().encode(secret)
  const jti = `click-${uuidv4()}`

  // 90-day expiration (matches report token TTL)
  const exp = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60

  const token = await new SignJWT({
    leadId: options.leadId,
    runId: options.runId,
    linkType: options.linkType,
    download: options.download ?? true,
    jti,
    scope: 'email:click',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .setAudience('email')
    .sign(secretKey)

  return token
}

/**
 * Validate a click tracking token
 *
 * Security checks:
 * - Validates signature
 * - Validates expiration
 * - Validates audience = 'email'
 * - Validates scope = 'email:click'
 * - Validates required fields (leadId, runId, linkType)
 */
export async function validateClickToken(
  token: string
): Promise<ClickTokenPayload | null> {
  try {
    const secret = process.env.SURVEY_SECRET_KEY
    if (!secret) {
      console.error('[ClickToken] SURVEY_SECRET_KEY not configured')
      return null
    }

    const secretKey = new TextEncoder().encode(secret)

    // Verify JWT with strict audience check
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
      audience: 'email',
    })

    // Validate scope
    if (payload.scope !== 'email:click') {
      console.error('[ClickToken] Invalid scope:', payload.scope)
      return null
    }

    // Validate required fields
    if (
      !payload.leadId ||
      !payload.runId ||
      !payload.linkType ||
      !payload.jti
    ) {
      console.error('[ClickToken] Missing required fields:', {
        hasLeadId: !!payload.leadId,
        hasRunId: !!payload.runId,
        hasLinkType: !!payload.linkType,
        hasJti: !!payload.jti,
      })
      return null
    }

    // Validate linkType is known
    if (payload.linkType !== 'report_download') {
      console.error('[ClickToken] Unknown linkType:', payload.linkType)
      return null
    }

    return payload as unknown as ClickTokenPayload
  } catch (error) {
    console.error(
      '[ClickToken] Validation failed:',
      error instanceof Error ? error.message : String(error)
    )
    return null
  }
}

/**
 * Build the tracked URL for an email CTA
 * This is the URL that goes in the email
 */
export function buildTrackedUrl(clickToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anthrasite.io'
  return `${baseUrl}/api/email/click?t=${encodeURIComponent(clickToken)}`
}
