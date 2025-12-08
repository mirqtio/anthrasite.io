import { NextResponse } from 'next/server'
import { getTemporalClient } from '@/lib/temporal/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const address = process.env.TEMPORAL_ADDRESS
    const namespace = process.env.TEMPORAL_NAMESPACE
    const apiKey = process.env.TEMPORAL_API_KEY
      ? 'Set (length ' + process.env.TEMPORAL_API_KEY.length + ')'
      : 'Not Set'

    console.log('Testing Temporal Connection...')
    console.log('Address:', address)
    console.log('Namespace:', namespace)
    console.log('API Key:', apiKey)

    const client = await getTemporalClient()

    // Try to list workflows to verify connection
    const workflows = []
    for await (const wf of client.workflow.list({
      query: 'StartTime > "2025-11-30T00:00:00Z"',
    })) {
      workflows.push(wf.workflowId)
      if (workflows.length >= 5) break
    }

    return NextResponse.json({
      status: 'success',
      config: { address, namespace, apiKey },
      workflowsFound: workflows.length,
      recentWorkflows: workflows,
    })
  } catch (error) {
    console.error('Temporal Connection Error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        config: {
          address: process.env.TEMPORAL_ADDRESS,
          namespace: process.env.TEMPORAL_NAMESPACE,
          apiKey: process.env.TEMPORAL_API_KEY ? 'Set' : 'Not Set',
        },
      },
      { status: 500 }
    )
  }
}
