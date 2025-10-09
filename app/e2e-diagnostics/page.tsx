/**
 * E2E Diagnostics Route
 *
 * This page is SSR-only and displays environment configuration
 * to verify that CI shards are truly identical.
 *
 * Tests can navigate here first to collect baseline environment data.
 */
export const dynamic = 'force-dynamic'

export default function E2EDiagnosticsPage() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_E2E_TESTING: process.env.NEXT_PUBLIC_E2E_TESTING,
    CI: process.env.CI,
    DISABLE_DD: process.env.DISABLE_DD,
    DISABLE_SENTRY: process.env.DISABLE_SENTRY,
    DISABLE_EMAIL: process.env.DISABLE_EMAIL,
    DATABASE_URL: process.env.DATABASE_URL
      ? 'postgresql://...' // Don't expose full URL
      : undefined,
    VERCEL_ENV: process.env.VERCEL_ENV,
    GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
  }

  return (
    <main data-page="e2e-diagnostics" className="p-8">
      <h1 className="mb-4 text-2xl font-bold">E2E Diagnostics</h1>
      <div className="space-y-4">
        <section>
          <h2 className="mb-2 text-lg font-semibold">Environment Variables</h2>
          <pre
            suppressHydrationWarning
            className="rounded bg-gray-100 p-4 text-sm"
          >
            {JSON.stringify(env, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Server Info</h2>
          <pre
            suppressHydrationWarning
            className="rounded bg-gray-100 p-4 text-sm"
          >
            {JSON.stringify(
              {
                timestamp: new Date().toISOString(),
                platform: process.platform,
                nodeVersion: process.version,
                cwd: process.cwd(),
              },
              null,
              2
            )}
          </pre>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Test Markers</h2>
          <p className="text-sm text-gray-600">
            This page exists solely for E2E test environment verification. If
            you see this in production, it should be hidden or removed.
          </p>
        </section>
      </div>
    </main>
  )
}
