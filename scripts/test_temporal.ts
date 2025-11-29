import { Connection, Client } from '@temporalio/client'
import dotenv from 'dotenv'

// Load env vars
dotenv.config()

async function run() {
  console.log('Testing Temporal Connection...')
  const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233'
  const namespace = process.env.TEMPORAL_NAMESPACE || 'default'
  const apiKey = process.env.TEMPORAL_API_KEY

  console.log(`Address: ${address}`)
  console.log(`Namespace: ${namespace}`)
  console.log(`API Key present: ${!!apiKey}`)

  try {
    const connection = await Connection.connect({
      address,
      apiKey,
      tls: apiKey ? true : undefined,
    })
    console.log('Connection successful.')

    const client = new Client({ connection, namespace })
    console.log('Client created.')

    // Describe namespace
    try {
      const describe = await client.workflowService.describeNamespace({
        namespace,
      })
      console.log('Namespace described:', describe.namespaceInfo?.name)
    } catch (e) {
      console.error('Failed to describe namespace:', e)
    }

    // Check queue
    try {
      const queue = await client.workflowService.describeTaskQueue({
        namespace,
        taskQueue: { name: 'assessment-pipeline', kind: 'NORMAL' as any },
        includeTaskQueueStatus: true,
        taskQueueType: 'WORKFLOW' as any,
      })
      const pollers = (queue as any).pollers || []
      console.log(`Queue 'assessment-pipeline' pollers: ${pollers.length}`)
      console.log('ONLINE')
    } catch (e) {
      console.error('Failed to describe task queue:', e)
    }
  } catch (e) {
    console.error('OFFLINE. Error:', e)
  }
}

run()
