import { NextResponse } from 'next/server'
import { generateSecureUTM } from '@/lib/crypto/utm-hash'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Get parameters from query string or use defaults
  const businessName = searchParams.get('name') || 'Acme Corporation'
  const price = parseFloat(searchParams.get('price') || '297')
  const value = parseFloat(searchParams.get('value') || '1500')

  try {
    // Generate a valid hash
    const hash = await generateSecureUTM({
      business_id: 'test-123',
      business_name: businessName,
      price: price,
      value: value,
      campaign_id: 'test-campaign',
      preview_pages: 4,
    })

    const purchaseUrl = `${request.headers.get('origin')}/purchase/${hash}`

    return NextResponse.json({
      success: true,
      hash,
      purchaseUrl,
      testData: {
        businessName,
        price,
        value,
      },
      instructions: 'Visit the purchaseUrl to see the purchase flow page',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate hash',
      },
      { status: 500 }
    )
  }
}
