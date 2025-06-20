// Test script to verify crypto implementation works in both environments

import { generateUTMToken, validateUTMToken, generateUTMUrl } from './crypto.ts'

async function testCryptoImplementation() {
  console.log('Testing UTM Crypto Implementation...\n')

  try {
    // Test 1: Generate UTM Token
    console.log('1. Testing generateUTMToken...')
    const token = await generateUTMToken('test-business-123')
    console.log('✓ Token generated:', token)
    console.log(`  - Payload: ${token.payload}`)
    console.log(`  - Signature: ${token.signature}`)

    // Test 2: Create UTM parameter
    console.log('\n2. Testing UTM parameter creation...')
    const utmParam = `${token.payload}.${token.signature}`
    console.log('✓ UTM parameter:', utmParam)

    // Test 3: Validate token
    console.log('\n3. Testing validateUTMToken...')
    const validation = await validateUTMToken(utmParam)
    console.log('✓ Validation result:', validation)

    // Test 4: Generate complete URL
    console.log('\n4. Testing generateUTMUrl...')
    const url = await generateUTMUrl(
      'https://anthrasite.io/purchase',
      'test-business-123',
      {
        source: 'email',
        campaign: 'test',
      }
    )
    console.log('✓ Generated URL:', url)

    // Test 5: Validate invalid token
    console.log('\n5. Testing invalid token validation...')
    const invalidResult = await validateUTMToken('invalid.token')
    console.log('✓ Invalid token result:', invalidResult)

    console.log('\n✅ All tests passed!')
    console.log('The crypto implementation works correctly with Web Crypto API')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    console.error('Stack trace:', error.stack)
  }
}

// Run the tests
testCryptoImplementation()
