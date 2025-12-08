import { NextResponse } from 'next/server'
import { verifyAdminSession, proxyToLeadShop } from '@/lib/prompt-lab/proxy'

export async function GET() {
  const auth = await verifyAdminSession()
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const response = await proxyToLeadShop('/prompt-lab/models')
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to fetch models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
