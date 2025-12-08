import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, proxyToLeadShop } from '@/lib/prompt-lab/proxy'

export async function GET() {
  const auth = await verifyAdminSession()
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const response = await proxyToLeadShop('/prompt-lab/prompts')
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to fetch prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession()
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const response = await proxyToLeadShop('/prompt-lab/prompts', {
      method: 'POST',
      body,
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to save prompt:', error)
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    )
  }
}
