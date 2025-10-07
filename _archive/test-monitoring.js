// Simple Node.js script to test monitoring services
const https = require('https')

// Test if monitoring endpoint is working
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-monitoring',
  method: 'GET',
  rejectUnauthorized: false,
}

const req = https.request(options, (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log('Response:', data)
  })
})

req.on('error', (error) => {
  // Try with http instead
  const http = require('http')
  const httpReq = http.get(
    'http://localhost:3000/api/test-monitoring',
    (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        console.log('Response:', data)
        try {
          const json = JSON.parse(data)
          console.log('\nMonitoring Test Results:')
          console.log('========================')
          console.log('Sentry:', json.results.sentry ? '✅' : '❌')
          console.log('Analytics:', json.results.analytics ? '✅' : '❌')
          console.log('Datadog:', json.results.datadog ? '✅' : '❌')
          console.log('\nEnvironment Variables:')
          console.log('Sentry DSN:', json.environment.sentry_dsn ? '✅' : '❌')
          console.log('GA4 ID:', json.environment.ga4_id ? '✅' : '❌')
          console.log(
            'PostHog Key:',
            json.environment.posthog_key ? '✅' : '❌'
          )
          console.log(
            'Datadog App ID:',
            json.environment.datadog_app_id ? '✅' : '❌'
          )
          console.log(
            'Datadog Client Token:',
            json.environment.datadog_client_token ? '✅' : '❌'
          )
        } catch (e) {
          console.log('Failed to parse JSON:', e.message)
        }
      })
    }
  )

  httpReq.on('error', (err) => {
    console.error('HTTP Error:', err.message)
  })
})

req.end()
