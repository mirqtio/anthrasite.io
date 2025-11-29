import { getWorkerStatus } from '@/app/admin/actions/observability'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const status = await getWorkerStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to fetch worker status:', error)
    return NextResponse.json('UNKNOWN', { status: 500 })
  }
}
