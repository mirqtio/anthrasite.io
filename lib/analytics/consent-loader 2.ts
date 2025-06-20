import { ConsentPreferences } from '@/lib/context/ConsentContext'

// Google Analytics 4 configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// PostHog configuration
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

// Track if scripts are loaded
let gaLoaded = false
let posthogLoaded = false

// Cookie names to clear if consent is revoked
const ANALYTICS_COOKIES = [
  '_ga',
  '_ga_*',
  '_gid',
  '_gat',
  '_gat_*',
  'ph_*',
  'posthog',
]

// Clear cookies by name pattern
function clearCookies(patterns: string[]) {
  const cookies = document.cookie.split(';')

  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()

    // Check if cookie matches any pattern
    const shouldDelete = patterns.some((pattern) => {
      if (pattern.endsWith('*')) {
        return name.startsWith(pattern.slice(0, -1))
      }
      return name === pattern
    })

    if (shouldDelete) {
      // Delete cookie for current domain and all parent domains
      const domains = [
        window.location.hostname,
        '.' + window.location.hostname,
        window.location.hostname.replace(/^www\./, '.'),
      ]

      const paths = ['/', window.location.pathname]

      domains.forEach((domain) => {
        paths.forEach((path) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`
        })
      })
    }
  })
}

// Load Google Analytics 4
function loadGoogleAnalytics() {
  if (gaLoaded || !GA_MEASUREMENT_ID) return

  // Create gtag function
  window.dataLayer = window.dataLayer || []
  ;(window as any).gtag = function () {
    window.dataLayer!.push(arguments)
  }
  ;(window as any).gtag('js', new Date())
  ;(window as any).gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    anonymize_ip: true, // GDPR compliance
    cookie_flags: 'SameSite=Strict;Secure',
  })

  // Load GA script
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.async = true
  script.onload = () => {
    gaLoaded = true
    console.log('Google Analytics loaded')
  }
  script.onerror = () => {
    console.error('Failed to load Google Analytics')
  }
  document.head.appendChild(script)
}

// Load PostHog
function loadPostHog() {
  if (posthogLoaded || !POSTHOG_API_KEY) return

  // PostHog initialization script
  const script = document.createElement('script')
  script.innerHTML = `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('${POSTHOG_API_KEY}', {
      api_host: '${POSTHOG_HOST}',
      persistence: 'localStorage',
      autocapture: false, // More privacy-friendly
      capture_pageview: true,
      disable_session_recording: true, // GDPR compliance
      respect_dnt: true,
      secure_cookie: true,
      cookie_name: 'ph_${POSTHOG_API_KEY}_posthog',
    })
  `

  script.onload = () => {
    posthogLoaded = true
    console.log('PostHog loaded')
  }

  document.head.appendChild(script)
}

// Unload Google Analytics
function unloadGoogleAnalytics() {
  if (!gaLoaded) return

  // Disable GA tracking
  if (window.gtag && GA_MEASUREMENT_ID) {
    ;(window as any).gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
    })
    ;(window as any)[`ga-disable-${GA_MEASUREMENT_ID}`] = true
  }

  // Clear GA cookies
  clearCookies(['_ga', '_ga_*', '_gid', '_gat', '_gat_*'])

  gaLoaded = false
  console.log('Google Analytics unloaded')
}

// Unload PostHog
function unloadPostHog() {
  if (!posthogLoaded) return

  // Opt out of PostHog tracking
  if (window.posthog) {
    window.posthog.opt_out_capturing()
    window.posthog.reset()
  }

  // Clear PostHog cookies
  clearCookies(['ph_*', 'posthog'])

  posthogLoaded = false
  console.log('PostHog unloaded')
}

// Initialize analytics based on consent
export function initializeAnalytics(preferences: ConsentPreferences | null) {
  // Only run in browser environment
  if (typeof window === 'undefined') return

  if (!preferences) {
    // No consent given yet, don't load anything
    return
  }

  // Handle analytics consent
  if (preferences.analytics) {
    loadGoogleAnalytics()
    loadPostHog()
  } else {
    unloadGoogleAnalytics()
    unloadPostHog()
  }
}

// Listen for consent updates
if (typeof window !== 'undefined') {
  window.addEventListener('consentUpdated', ((
    event: CustomEvent<ConsentPreferences>
  ) => {
    initializeAnalytics(event.detail)
  }) as EventListener)
}
