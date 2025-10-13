// lib/e2e/cookies.ts
// E2E-safe cookie reads: prefer worker-suffixed name in E2E, else fallback.
// Minimal, framework-agnostic helpers

type CookieGetter = (name: string) => string | undefined

// Simple cookie reader for client-side
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([$?*|{}\]\\^])/g, '\\$1') + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1]) : undefined
}

/**
 * E2E-safe cookie reader - reads worker-specific cookies in E2E mode
 *
 * In E2E mode with parallel workers:
 * - Middleware sets cookies with worker suffix (e.g., site_mode_w0)
 * - This helper reads the correct suffixed cookie for the current worker
 * - Falls back to standard name for prod/local compatibility
 *
 * @param name - Cookie name (e.g., 'site_mode', 'business_id')
 * @returns Cookie value or undefined
 */
export function getCookieE2ESafe(name: string): string | undefined {
  const isE2E = process.env.NEXT_PUBLIC_E2E === '1'
  if (!isE2E) return getCookie(name)

  // PW worker index comes from Playwright init script (injected into window)
  // fallback to env if somehow available on client
  const idx =
    (globalThis as any).__PW_WORKER_INDEX ??
    (typeof process !== 'undefined'
      ? (process as any).env?.PW_WORKER_INDEX
      : undefined) ??
    '0'

  const suffixed = `${name}_w${idx}`
  return getCookie(suffixed) ?? getCookie(name)
}

/**
 * E2E-safe cookie writer - writes worker-specific cookies in E2E mode
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options (maxAge, path, etc.)
 */
export function setCookieE2ESafe(
  name: string,
  value: string,
  options?: { maxAge?: number; path?: string }
) {
  const isE2E = process.env.NEXT_PUBLIC_E2E === '1'
  let key = name
  if (isE2E) {
    const idx =
      (globalThis as any).__PW_WORKER_INDEX ??
      (typeof process !== 'undefined'
        ? (process as any).env?.PW_WORKER_INDEX
        : undefined) ??
      '0'
    key = `${name}_w${idx}`
  }
  const parts = [`${encodeURIComponent(key)}=${encodeURIComponent(value)}`]
  if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`)
  parts.push(`Path=${options?.path ?? '/'}`)
  if (typeof document !== 'undefined') document.cookie = parts.join('; ')
}
