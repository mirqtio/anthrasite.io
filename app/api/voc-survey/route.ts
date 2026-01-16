import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSql } from '@/lib/db'
import { trackEvent } from '@/lib/monitoring'

const VocSurveySchema = z.object({
  landingTokenId: z.string().optional(),
  leadId: z.string().optional(),
  answer: z.string().optional(),
  otherText: z.string().max(1000).optional(),
  triggerType: z.enum(['exit_intent_desktop', 'scroll_up_mobile']),
  secondsOnPage: z.number().int().min(0),
  dismissed: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = VocSurveySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      landingTokenId,
      leadId,
      answer,
      otherText,
      triggerType,
      secondsOnPage,
      dismissed,
    } = parsed.data

    // Get IP address from headers
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null

    const sql = getSql()

    // Insert survey response
    const [response] = await sql`
      INSERT INTO voc_survey_responses (
        id,
        landing_token_id,
        lead_id,
        answer,
        other_text,
        trigger_type,
        seconds_on_page,
        dismissed,
        ip_address,
        created_at
      ) VALUES (
        gen_random_uuid(),
        ${landingTokenId ?? null},
        ${leadId ?? null},
        ${answer ?? null},
        ${otherText ?? null},
        ${triggerType},
        ${secondsOnPage},
        ${dismissed},
        ${ipAddress},
        NOW()
      )
      RETURNING id
    `

    trackEvent(
      dismissed ? 'api.voc_survey_dismissed' : 'api.voc_survey_answered',
      {
        lead_id: leadId,
        trigger_type: triggerType,
        answer: answer ?? 'dismissed',
        seconds_on_page: secondsOnPage,
      }
    )

    return NextResponse.json({ ok: true, id: response.id }, { status: 201 })
  } catch (err: unknown) {
    console.error('voc-survey POST error', err)
    trackEvent('api.voc_survey_error', {
      error: err instanceof Error ? err.message : 'Unknown error',
    })

    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
