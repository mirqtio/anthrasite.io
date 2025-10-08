#!/usr/bin/env tsx

/**
 * Test Email Dry-Run Flow
 *
 * Tests the D3 email facade in dry-run mode:
 * 1. Creates a test Purchase record in the database
 * 2. Calls sendPurchaseConfirmationEmail with dry-run enabled
 * 3. Verifies files are created in /tmp/mailbox/
 * 4. Tests idempotency by calling again
 * 5. Cleans up test data
 */

import { prisma } from '../lib/db'
import { sendPurchaseConfirmationEmail } from '../lib/email'
import { existsSync, readdirSync, readFileSync } from 'fs'

// Set dry-run mode
process.env.EMAIL_CONFIRMATION_ENABLED = 'true'
process.env.EMAIL_DRY_RUN = 'true'
process.env.GMAIL_USER = 'test@anthrasite.io'

async function main() {
  console.log('=== D3 Email Dry-Run Test ===\n')

  // Step 1: Create test business and purchase
  console.log('1. Creating test business and purchase...')

  const business = await prisma.business.upsert({
    where: { domain: 'test-d3-email.com' },
    create: {
      domain: 'test-d3-email.com',
      name: 'Test D3 Business',
      email: 'business@test-d3-email.com',
    },
    update: {
      name: 'Test D3 Business',
      email: 'business@test-d3-email.com',
    },
  })

  const purchase = await prisma.purchase.create({
    data: {
      businessId: business.id,
      stripeSessionId: `test_session_${Date.now()}`,
      stripePaymentIntentId: `test_pi_${Date.now()}`,
      amount: 29900, // $299.00
      currency: 'usd',
      status: 'completed',
      customerEmail: 'customer@test-d3-email.com',
      confirmationEmailSentAt: null, // Ensure it's null for first send
    },
    include: {
      business: true,
    },
  })

  console.log(`✓ Created purchase: ${purchase.id}`)
  console.log(`  Customer email: ${purchase.customerEmail}`)
  console.log(`  Amount: $${(purchase.amount / 100).toFixed(2)}`)
  console.log()

  // Step 2: Send email in dry-run mode (first attempt)
  console.log('2. Sending purchase confirmation email (dry-run)...')

  await sendPurchaseConfirmationEmail(purchase, {
    eventId: 'test_evt_' + Date.now(),
  })

  console.log('✓ Email send attempted')
  console.log()

  // Step 3: Verify dry-run files were created
  console.log('3. Verifying dry-run output files...')

  const mailboxDir = '/tmp/mailbox'
  if (!existsSync(mailboxDir)) {
    throw new Error(`Mailbox directory not found: ${mailboxDir}`)
  }

  const files = readdirSync(mailboxDir).filter((f) => f.includes(purchase.id))
  console.log(`✓ Found ${files.length} files for purchase ${purchase.id}:`)

  files.forEach((file) => {
    console.log(`  - ${file}`)
  })

  if (files.length !== 2) {
    throw new Error(
      `Expected 2 files (.meta.json and .eml), found ${files.length}`
    )
  }

  // Check .meta.json content
  const metaFile = files.find((f) => f.endsWith('.meta.json'))
  if (!metaFile) {
    throw new Error('No .meta.json file found')
  }

  const metaPath = `${mailboxDir}/${metaFile}`
  const metaContent = JSON.parse(readFileSync(metaPath, 'utf-8'))
  console.log('\n  Metadata:')
  console.log(`    To: ${metaContent.to}`)
  console.log(`    Subject: ${metaContent.subject}`)
  console.log(`    Event ID: ${metaContent.eventId}`)

  // Check .eml content
  const emlFile = files.find((f) => f.endsWith('.eml'))
  if (!emlFile) {
    throw new Error('No .eml file found')
  }

  const emlPath = `${mailboxDir}/${emlFile}`
  const emlContent = readFileSync(emlPath, 'utf-8')
  console.log('\n  EML file size:', emlContent.length, 'bytes')
  console.log()

  // Step 4: Verify database was updated
  console.log('4. Verifying database update...')

  const updatedPurchase = await prisma.purchase.findUnique({
    where: { id: purchase.id },
  })

  if (!updatedPurchase?.confirmationEmailSentAt) {
    throw new Error('confirmationEmailSentAt was not set in database')
  }

  console.log(
    `✓ confirmationEmailSentAt: ${updatedPurchase.confirmationEmailSentAt.toISOString()}`
  )
  console.log()

  // Step 5: Test idempotency (second attempt should be skipped)
  console.log('5. Testing idempotency (second send attempt)...')
  console.log('   This should log "email_already_sent" and skip sending')

  await sendPurchaseConfirmationEmail(updatedPurchase, {
    eventId: 'test_evt_replay_' + Date.now(),
  })

  // Verify no new files were created
  const filesAfter = readdirSync(mailboxDir).filter((f) =>
    f.includes(purchase.id)
  )
  if (filesAfter.length !== files.length) {
    throw new Error(`Idempotency failed: new files were created on second send`)
  }

  console.log('✓ Idempotency verified - no duplicate files created')
  console.log()

  // Step 6: Clean up
  console.log('6. Cleaning up test data...')

  await prisma.purchase.delete({ where: { id: purchase.id } })
  await prisma.business.delete({ where: { id: business.id } })

  console.log('✓ Test data cleaned up')
  console.log()

  console.log('=== All Tests Passed ===')
  console.log('\nDry-run artifacts available in:')
  console.log(`  ${metaPath}`)
  console.log(`  ${emlPath}`)
}

main()
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message)
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
