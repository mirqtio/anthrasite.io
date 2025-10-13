import { NextResponse } from 'next/server'

// Note: ConsentContext.tsx defines CONSENT_VERSION as const (not exported)
// For now, we'll hardcode the version here and keep them in sync manually
// TODO: Extract to shared constants file if consent version changes frequently
const CONSENT_VERSION = '1.0'

export const dynamic = 'force-dynamic'

/**
 * E2E consent version check endpoint
 * Used by tests to verify consent storage state matches server expectations
 */
export async function GET() {
  // Optionally gate to E2E mode only
  if (process.env.E2E !== '1') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  return NextResponse.json({ version: CONSENT_VERSION })
}
