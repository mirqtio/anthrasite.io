import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'
import { generateReportPresignedUrl } from '@/lib/survey/s3'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 15: params is now a Promise
  const { id } = await params
  const leadId = parseInt(id)

  if (isNaN(leadId)) {
    return NextResponse.json({ error: 'Invalid Lead ID' }, { status: 400 })
  }

  try {
    const sql = getSql()

    // Fetch the latest report for the lead
    const reports = await sql`
            SELECT pdf_s3_key 
            FROM reports 
            WHERE lead_id = ${leadId} 
            ORDER BY created_at DESC 
            LIMIT 1
        `

    const report = reports[0]

    if (!report || !report.pdf_s3_key) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Generate presigned URL
    const presignedUrl = await generateReportPresignedUrl(report.pdf_s3_key)

    // Redirect to the presigned URL
    return NextResponse.redirect(presignedUrl)
  } catch (error: any) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
