import { NextRequest, NextResponse } from 'next/server'
import { withMonitoring } from '@/lib/monitoring/api-middleware'
import { monitorDbQuery } from '@/lib/monitoring'
import { prisma } from '@/lib/db'

async function healthCheck(req: NextRequest) {
  const checks = {
    service: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    version: process.env.NEXT_PUBLIC_RELEASE || 'development',
  }

  try {
    // Check database connectivity
    await monitorDbQuery('health_check', async () => {
      await prisma.$queryRaw`SELECT 1`
    })
    checks.database = 'healthy'
  } catch (error) {
    checks.database = 'unhealthy'
    console.error('Database health check failed:', error)
  }

  const isHealthy = checks.database === 'healthy'

  return NextResponse.json(checks, {
    status: isHealthy ? 200 : 503,
  })
}

// Export the monitored handler
export const GET = withMonitoring(healthCheck, 'health_check', {
  alertOnError: false, // Don't alert on health check failures
  trackPerformance: true,
})
