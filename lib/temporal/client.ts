// lib/temporal/client.ts
import { Client, Connection } from '@temporalio/client'
import 'server-only' // Prevent usage in Edge runtimes

// Singleton instance to prevent multiple connections in serverless environment
// Note: In Next.js dev mode, this might still re-instantiate on HMR, which is acceptable.
let temporalClient: Client | undefined

export async function getTemporalClient(): Promise<Client> {
  if (temporalClient) {
    return temporalClient
  }

  const address = process.env.TEMPORAL_ADDRESS // e.g., 'namespace.id.tmprl.cloud:7233'
  const namespace = process.env.TEMPORAL_NAMESPACE // e.g., 'namespace.id'

  // For mTLS (Cloud)
  const clientCert = process.env.TEMPORAL_CLIENT_CERT
  const clientKey = process.env.TEMPORAL_CLIENT_KEY

  const apiKey = process.env.TEMPORAL_API_KEY

  if (!address || !namespace) {
    throw new Error('Missing TEMPORAL_ADDRESS or TEMPORAL_NAMESPACE env vars')
  }

  console.log('[Temporal] Connecting to', address)

  const connection = await Connection.connect({
    address,
    apiKey,
    tls:
      clientCert && clientKey
        ? {
            clientCertPair: {
              crt: Buffer.from(clientCert),
              key: Buffer.from(clientKey),
            },
          }
        : apiKey
          ? true
          : undefined, // Fallback to no-TLS for local dev if vars missing (or use local emulator)
  })

  temporalClient = new Client({
    connection,
    namespace,
  })

  return temporalClient
}
