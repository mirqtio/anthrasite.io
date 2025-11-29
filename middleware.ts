// middleware.ts
import { chain } from '@/lib/middleware-chain'
import { withSession } from './middleware/01-session'
import { withSecurity } from './middleware/02-security'
import { withABTesting } from './middleware/02b-ab-testing'
import { withAccessControl } from './middleware/03-access-control'
import { withPrivacyGPC } from './middleware/04-privacy-gpc'

import { withAdminAuth } from './middleware/03b-admin-auth'

export default chain([
  withSession,
  withSecurity,
  withABTesting,
  withAccessControl,
  withAdminAuth,
  withPrivacyGPC,
])

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|assets/|images/|api/).*)',
  ],
}
