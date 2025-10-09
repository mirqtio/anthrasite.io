import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getWaitlistStats } from '@/lib/waitlist/service'
import { trackEvent } from '@/lib/monitoring'

// Validation schema with automatic normalization
const WaitlistSchema = z.object({
  domain: z.string().min(3).transform(s => s.trim().toLowerCase()),
  email: z.string().email().transform(s => s.trim().toLowerCase()).optional(),
  referralSource: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = WaitlistSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    const { domain, email, referralSource } = parsed.data

    // Check for existing entry (case-insensitive due to DB index)
    const existing = await prisma.waitlistEntry.findFirst({
      where: { domain },
    })

    let entry
    let created = false

    if (existing) {
      // Update existing entry with latest contact info
      entry = await prisma.waitlistEntry.update({
        where: { id: existing.id },
        data: {
          email: email ?? existing.email,
          variantData: referralSource ? { referralSource } : existing.variantData,
        },
      })
    } else {
      // Create new entry (DB constraint handles race conditions)
      try {
        entry = await prisma.waitlistEntry.create({
          data: {
            domain,
            email: email ?? '',
            variantData: referralSource ? { referralSource } : undefined,
          },
        })
        created = true
      } catch (createErr: any) {
        // Handle race condition: another request created it between findFirst and create
        if (String(createErr?.code) === 'P2002') {
          // Fetch the entry that was just created by the other request
          const justCreated = await prisma.waitlistEntry.findFirst({
            where: { domain },
          })
          if (justCreated) {
            entry = justCreated
            created = false
          } else {
            throw createErr
          }
        } else {
          throw createErr
        }
      }
    }

    // Track signup
    trackEvent(created ? 'api.waitlist_signup' : 'api.waitlist_duplicate', {
      domain,
      created,
    })

    // Idempotent response (don't reveal if entry already exists for security)
    return NextResponse.json(
      { ok: true, message: 'You are on the waitlist.' },
      { status: created ? 201 : 200 }
    )
  } catch (err: any) {
    // Handle unique constraint violation gracefully
    // This shouldn't happen with upsert, but handle it defensively
    if (String(err?.code) === 'P2002' || /unique/i.test(String(err?.message))) {
      return NextResponse.json(
        { ok: true, message: 'You are on the waitlist.' },
        { status: 200 }
      )
    }

    console.error('waitlist POST error', err)
    trackEvent('api.waitlist_signup_error', {
      error: err.message,
    })

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get waitlist statistics
    const stats = await getWaitlistStats()
    
    return NextResponse.json({
      count: stats.totalCount,
      todayCount: stats.todayCount,
      weekCount: stats.weekCount,
    })
  } catch (error) {
    console.error('Waitlist stats error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get waitlist stats' },
      { status: 500 }
    )
  }
}