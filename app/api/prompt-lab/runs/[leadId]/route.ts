import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, proxyToLeadShop } from '@/lib/prompt-lab/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const auth = await verifyAdminSession()
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const { leadId } = await params

  try {
    const response = await proxyToLeadShop(`/prompt-lab/runs/${leadId}`)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to fetch runs:', error)
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 })
  }
}
