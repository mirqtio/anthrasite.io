/**
 * Domain validation service using DNS-over-HTTPS
 */

import { captureError, trackEvent } from '@/lib/monitoring'

// DNS-over-HTTPS providers
const DOH_PROVIDERS = {
  cloudflare: 'https://cloudflare-dns.com/dns-query',
  google: 'https://dns.google/resolve',
}

// Common domain typos mapping
const COMMON_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahou.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'iclould.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'aoll.com': 'aol.com',
  'aol.co': 'aol.com',
}

// Cache for DNS results (TTL: 1 hour)
const DNS_CACHE = new Map<string, { result: boolean; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

export interface DomainValidationResult {
  isValid: boolean
  normalizedDomain: string
  suggestion?: string
  error?: string
  hasActiveSite?: boolean
  technologies?: string[]
  sslEnabled?: boolean
  wwwRedirect?: boolean
  estimatedTraffic?: string
}

/**
 * Normalize domain by removing www prefix and converting to lowercase
 */
export function normalizeDomain(domain: string): string {
  // Trim whitespace first
  let normalized = domain.trim()

  // Convert to lowercase
  normalized = normalized.toLowerCase()

  // Remove protocol if present
  normalized = normalized.replace(/^https?:\/\//, '')

  // Remove path if present
  normalized = normalized.split('/')[0]

  // Remove port if present
  normalized = normalized.split(':')[0]

  // Remove www prefix
  normalized = normalized.replace(/^www\./, '')

  // Trim any remaining whitespace
  normalized = normalized.trim()

  return normalized
}

/**
 * Validate email syntax
 */
export function validateEmail(email: string): boolean {
  // Basic email regex that handles most common cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return false
  }

  // Additional checks
  const [localPart, domain] = email.split('@')

  // Check local part length (max 64 chars)
  if (localPart.length > 64) {
    return false
  }

  // Check domain length (max 255 chars)
  if (domain.length > 255) {
    return false
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return false
  }

  // Check that it doesn't start or end with a dot
  if (
    email.startsWith('.') ||
    email.endsWith('.') ||
    email.includes('.@') ||
    email.includes('@.')
  ) {
    return false
  }

  return true
}

/**
 * Check if domain has typo and return suggestion
 */
export function getDomainSuggestion(domain: string): string | undefined {
  const normalized = normalizeDomain(domain)

  // Direct typo match
  if (COMMON_TYPOS[normalized]) {
    return COMMON_TYPOS[normalized]
  }

  // Check for common TLD typos
  const tldTypos: Record<string, string> = {
    '.con': '.com',
    '.comm': '.com',
    '.co': '.com', // might be intentional, but suggest
    '.cm': '.com',
    '.om': '.com',
    '.cmo': '.com',
    '.ocm': '.com',
    '.met': '.net',
    '.ner': '.net',
    '.og': '.org',
    '.ogr': '.org',
    '.orgg': '.org',
  }

  for (const [typo, correction] of Object.entries(tldTypos)) {
    if (normalized.endsWith(typo)) {
      return normalized.slice(0, -typo.length) + correction
    }
  }

  return undefined
}

/**
 * Check DNS cache for domain
 */
function checkCache(domain: string): boolean | null {
  const cached = DNS_CACHE.get(domain)

  if (!cached) {
    return null
  }

  // Check if cache entry is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    DNS_CACHE.delete(domain)
    return null
  }

  return cached.result
}

/**
 * Cache DNS result
 */
function cacheResult(domain: string, result: boolean): void {
  DNS_CACHE.set(domain, {
    result,
    timestamp: Date.now(),
  })
}

/**
 * Query DNS using DNS-over-HTTPS
 */
async function queryDNS(
  domain: string,
  provider: 'cloudflare' | 'google' = 'cloudflare'
): Promise<boolean> {
  // In development/test, mock some common domains
  if (process.env.NODE_ENV !== 'production') {
    const commonDomains = [
      'google.com',
      'facebook.com',
      'twitter.com',
      'github.com',
      'stackoverflow.com',
      'amazon.com',
      'microsoft.com',
      'apple.com',
      'example.com',
      'test.com',
      'localhost',
      'vercel.app',
    ]

    // Check if it's a common domain or subdomain of one
    const isCommon = commonDomains.some(
      (common) => domain === common || domain.endsWith(`.${common}`)
    )

    if (isCommon) {
      return true
    }
  }

  try {
    const url = new URL(DOH_PROVIDERS[provider])

    if (provider === 'cloudflare') {
      url.searchParams.set('name', domain)
      url.searchParams.set('type', 'A')
    } else {
      url.searchParams.set('name', domain)
      url.searchParams.set('type', 'A')
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/dns-json',
      },
      // Set timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`DNS query failed: ${response.status}`)
    }

    const data = await response.json()

    // Check if we got any answers
    if (provider === 'cloudflare') {
      return data.Status === 0 && data.Answer && data.Answer.length > 0
    } else {
      return data.Status === 0 && data.Answer && data.Answer.length > 0
    }
  } catch (error) {
    // Try fallback provider if primary fails
    if (provider === 'cloudflare') {
      return queryDNS(domain, 'google')
    }

    throw error
  }
}

/**
 * Check if domain has an active website
 */
async function checkActiveSite(domain: string): Promise<{
  hasActiveSite: boolean
  sslEnabled: boolean
  wwwRedirect: boolean
  technologies: string[]
  estimatedTraffic: string
}> {
  // For MVP, we'll do basic checks. In production, this could integrate with services like
  // Wappalyzer API, BuiltWith API, or similar technology detection services

  const result = {
    hasActiveSite: false,
    sslEnabled: false,
    wwwRedirect: false,
    technologies: [] as string[],
    estimatedTraffic: 'Unknown',
  }

  // In test environment, return mocked data to avoid HTTP calls
  if (process.env.NODE_ENV === 'test') {
    return {
      hasActiveSite: true,
      sslEnabled: true,
      wwwRedirect: false,
      technologies: ['WordPress', 'Cloudflare'],
      estimatedTraffic: 'Medium',
    }
  }

  try {
    // Try to fetch the site with both HTTP and HTTPS to check SSL and responsiveness
    const protocols = ['https', 'http']

    for (const protocol of protocols) {
      try {
        const response = await fetch(`${protocol}://${domain}`, {
          method: 'HEAD',
          redirect: 'manual', // Don't follow redirects so we can detect them
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok || response.status < 400) {
          result.hasActiveSite = true

          if (protocol === 'https') {
            result.sslEnabled = true
          }

          // Check for WWW redirect
          const location = response.headers.get('location')
          if (location && location.includes('www.')) {
            result.wwwRedirect = true
          }

          // Basic technology detection from headers
          const server = response.headers.get('server')
          const poweredBy = response.headers.get('x-powered-by')

          if (server) {
            if (server.toLowerCase().includes('nginx')) {
              result.technologies.push('Nginx')
            }
            if (server.toLowerCase().includes('apache')) {
              result.technologies.push('Apache')
            }
            if (server.toLowerCase().includes('cloudflare')) {
              result.technologies.push('Cloudflare')
            }
          }

          if (poweredBy) {
            if (poweredBy.toLowerCase().includes('php')) {
              result.technologies.push('PHP')
            }
            if (poweredBy.toLowerCase().includes('wordpress')) {
              result.technologies.push('WordPress')
            }
          }

          // Estimate traffic based on response time and infrastructure
          const responseTime = Date.now() // Basic estimation
          if (result.technologies.includes('Cloudflare')) {
            result.estimatedTraffic = 'Medium'
          } else {
            result.estimatedTraffic = 'Low'
          }

          break // Stop trying other protocols once we get a response
        }
      } catch (error) {
        // Continue to next protocol
        continue
      }
    }
  } catch (error) {
    // If all checks fail, we'll return the default false values
    trackEvent('waitlist.site_check_failed', {
      domain,
      error: (error as Error).message,
    })
  }

  return result
}

/**
 * Validate domain using DNS-over-HTTPS
 */
export async function validateDomain(
  domain: string
): Promise<DomainValidationResult> {
  try {
    const normalizedDomain = normalizeDomain(domain)

    // Basic domain format validation
    if (!normalizedDomain || normalizedDomain.length < 3) {
      return {
        isValid: false,
        normalizedDomain,
        error: 'Domain too short',
      }
    }

    // Check for spaces or invalid characters
    if (
      /\s/.test(normalizedDomain) ||
      !/^[a-z0-9.-]+$/.test(normalizedDomain)
    ) {
      return {
        isValid: false,
        normalizedDomain,
        error: 'Invalid characters in domain',
      }
    }

    // Must have at least one dot
    if (!normalizedDomain.includes('.')) {
      return {
        isValid: false,
        normalizedDomain,
        error: 'Invalid domain format',
      }
    }

    // Check for typo suggestion
    const suggestion = getDomainSuggestion(normalizedDomain)

    // Check cache first
    const cachedResult = checkCache(normalizedDomain)
    if (cachedResult !== null) {
      trackEvent('waitlist.domain_validation_cache_hit', {
        domain: normalizedDomain,
      })
      return {
        isValid: cachedResult,
        normalizedDomain,
        suggestion: cachedResult ? undefined : suggestion,
      }
    }

    // Perform DNS lookup
    trackEvent('waitlist.domain_validation_dns_query', {
      domain: normalizedDomain,
    })
    const isValid = await queryDNS(normalizedDomain)

    // Cache the result
    cacheResult(normalizedDomain, isValid)

    if (!isValid) {
      return {
        isValid: false,
        normalizedDomain,
        suggestion,
      }
    }

    // If DNS is valid, check for active site and additional properties
    const siteInfo = await checkActiveSite(normalizedDomain)

    return {
      isValid: true,
      normalizedDomain,
      hasActiveSite: siteInfo.hasActiveSite,
      technologies: siteInfo.technologies,
      sslEnabled: siteInfo.sslEnabled,
      wwwRedirect: siteInfo.wwwRedirect,
      estimatedTraffic: siteInfo.estimatedTraffic,
    }
  } catch (error) {
    captureError(error as Error, { domain })

    return {
      isValid: false,
      normalizedDomain: normalizeDomain(domain),
      error: 'Unable to validate domain',
    }
  }
}

/**
 * Clear expired cache entries (maintenance function)
 */
export function clearExpiredCache(): void {
  const now = Date.now()

  for (const [domain, cached] of DNS_CACHE.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      DNS_CACHE.delete(domain)
    }
  }
}
