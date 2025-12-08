import { SignJWT } from 'jose';
import { readFileSync } from 'fs';

// Read .env.local
const envContent = readFileSync('.env.local', 'utf8');
const match = envContent.match(/SURVEY_SECRET_KEY=(.+)/);
const secretKey = match ? match[1].trim() : '';

const secret = new TextEncoder().encode(secretKey);
const now = Math.floor(Date.now() / 1000);

const token = await new SignJWT({
  leadId: '3093',
  runId: 'run_3093_20250202_031459',
  jti: 'test-' + Date.now(),
  scope: 'buy',
  tier: 'basic',
})
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt(now)
  .setExpirationTime(now + 7 * 24 * 3600) // 7 days
  .setAudience('purchase')
  .sign(secret);

console.log('Token expires:', new Date((now + 7 * 24 * 3600) * 1000).toISOString());
console.log('URL:');
console.log('http://localhost:3333/purchase?sid=' + token);
