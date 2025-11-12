#!/usr/bin/env node
/**
 * Generate a test JWT token for survey testing
 * Usage: node scripts/generate-test-survey-token.js
 */

const { SignJWT } = require('jose')
const crypto = require('crypto')

async function generateTestToken() {
  const secret = new TextEncoder().encode(
    process.env.SURVEY_SECRET_KEY ||
      'ZK0eNvl9ZJ679x9COvYnKJZFu1VWZnurPqO06WZyl4s84HRJ4K4PHxUxn1kCjG8ixnLDMHpMBAV0O4r9rI3eWQ'
  )

  const jti = crypto.randomUUID()
  const now = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({
    leadId: '1', // Use lead_id that exists in Supabase
    runId: 'lead_1_batch_20251111_211119_136683ac',
    jti: jti,
    aud: 'survey',
    scope: 'feedback',
    version: 'v1',
    batchId: 'test_batch_001',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 30 * 24 * 3600) // 30 days
    .sign(secret)

  const surveyUrl = `http://localhost:3333/survey?token=${token}`

  console.log('\n✅ Test Survey Token Generated\n')
  console.log('Token:', token)
  console.log('\nJTI:', jti)
  console.log('\nSurvey URL:')
  console.log(surveyUrl)
  console.log('\n📋 Copy the URL above and paste it in your browser')
  console.log('   OR run: open "' + surveyUrl + '"')
  console.log('')

  return { token, jti, surveyUrl }
}

generateTestToken().catch(console.error)
