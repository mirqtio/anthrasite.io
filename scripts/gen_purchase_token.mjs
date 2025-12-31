import { SignJWT } from 'jose';
import { readFileSync } from 'fs';

// Read .env.local
const envContent = readFileSync('.env.local', 'utf8');
const match = envContent.match(/SURVEY_SECRET_KEY=(.+)/);
const secretKey = match ? match[1].trim() : '';

const secret = new TextEncoder().encode(secretKey);
const now = Math.floor(Date.now() / 1000);

// Generate landing page token
const landingToken = await new SignJWT({
  leadId: '3093',
  runId: 'lead_3093_batch_20251227_013442_191569fa', // Use actual run_id format
  jti: 'landing-' + Date.now(),
  scope: 'view',
})
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt(now)
  .setExpirationTime(now + 30 * 24 * 3600) // 30 days
  .setAudience('landing')
  .sign(secret);

console.log('Token expires:', new Date((now + 30 * 24 * 3600) * 1000).toISOString());
console.log('\nLanding Page URL:');
console.log('http://localhost:3333/landing/' + landingToken);

// Generate purchase token (for checkout flow)
const purchaseToken = await new SignJWT({
  leadId: '3093',
  runId: 'lead_3093_batch_20251227_013442_191569fa',
  jti: 'purchase-' + Date.now(),
  scope: 'buy',
  tier: 'basic',
})
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt(now)
  .setExpirationTime(now + 7 * 24 * 3600) // 7 days
  .setAudience('purchase')
  .sign(secret);

console.log('\nPurchase URL:');
console.log('http://localhost:3333/purchase?sid=' + purchaseToken);
