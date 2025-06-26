// Lazy loader for monitoring libraries
let datadogInitialized = false
let sentryInitialized = false

export const lazyLoadDatadog = async () => {
  if (datadogInitialized || typeof window === 'undefined') return

  try {
    const { initDatadog } = await import('./datadog')
    initDatadog()
    datadogInitialized = true
  } catch (error) {
    console.error('Failed to load Datadog:', error)
  }
}

export const lazyLoadSentry = async () => {
  if (sentryInitialized || typeof window === 'undefined') return

  try {
    // Sentry is currently disabled, but keeping the structure for future use
    // const Sentry = await import('@sentry/nextjs')
    // Sentry initialization would go here
    sentryInitialized = true
  } catch (error) {
    console.error('Failed to load Sentry:', error)
  }
}

// Initialize monitoring after user interaction or delay
export const initMonitoringLazy = () => {
  if (typeof window === 'undefined') return

  // Wait for either user interaction or 3 seconds
  let initialized = false

  const init = () => {
    if (initialized) return
    initialized = true

    // Remove event listeners
    document.removeEventListener('click', init)
    document.removeEventListener('scroll', init)
    document.removeEventListener('keydown', init)

    // Load monitoring libraries
    lazyLoadDatadog()
    lazyLoadSentry()
  }

  // Initialize on first user interaction
  document.addEventListener('click', init, { once: true })
  document.addEventListener('scroll', init, { once: true })
  document.addEventListener('keydown', init, { once: true })

  // Or after 3 seconds if no interaction
  setTimeout(init, 3000)
}
