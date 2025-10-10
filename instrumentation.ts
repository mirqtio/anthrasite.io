export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  // Temporarily disable edge runtime instrumentation to fix build cache issues
  // TODO: Re-enable once Sentry edge runtime compilation is stable
  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   await import('./sentry.edge.config')
  // }
}
