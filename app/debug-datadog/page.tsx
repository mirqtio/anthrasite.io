'use client'

import { useEffect, useState } from 'react'

export default function DebugDatadogPage() {
  const [status, setStatus] = useState<any>({})
  
  useEffect(() => {
    // Check environment variables
    const envStatus = {
      applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ? '✅ Set' : '❌ Missing',
      site: process.env.NEXT_PUBLIC_DATADOG_SITE,
    }
    
    // Check if Datadog is loaded
    const checkDatadog = () => {
      const ddRum = (window as any).DD_RUM
      const ddLogs = (window as any).DD_LOGS
      
      setStatus({
        env: envStatus,
        rum: {
          loaded: !!ddRum,
          initialized: ddRum?.getInternalContext ? '✅ Yes' : '❌ No',
          context: ddRum?.getInternalContext?.() || 'Not available'
        },
        logs: {
          loaded: !!ddLogs,
          initialized: ddLogs?.logger ? '✅ Yes' : '❌ No'
        },
        window: {
          datadogRum: !!(window as any).datadogRum,
          datadogLogs: !!(window as any).datadogLogs
        }
      })
    }
    
    // Check immediately and after a delay
    checkDatadog()
    setTimeout(checkDatadog, 2000)
  }, [])
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Datadog Debug Information</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(status.env, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">RUM Status</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(status.rum, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Logs Status</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(status.logs, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Window Objects</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(status.window, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Test Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => {
                try {
                  const ddRum = (window as any).DD_RUM
                  if (ddRum) {
                    ddRum.addAction('test_button_click', { test: true })
                    alert('Action sent to Datadog RUM')
                  } else {
                    alert('Datadog RUM not available')
                  }
                } catch (e) {
                  alert('Error: ' + (e as Error).message)
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send Test Action
            </button>
            
            <button 
              onClick={() => {
                try {
                  throw new Error('Test error for Datadog')
                } catch (e) {
                  console.error('Test error:', e)
                  alert('Error thrown - check console and Datadog')
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Throw Test Error
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}