// middleware.ts
import { chain } from '@/lib/middleware-chain'
import { withSession } from './middleware/01-session'
import { withSecurity } from './middleware/02-security'
import { withABTesting } from './middleware/02b-ab-testing'
import { withAccessControl } from './middleware/03-access-control'

export default chain([
  withSession,
  withSecurity,
  withABTesting,
  withAccessControl,
])

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|assets/|images/|api/).*)',
  ],
}
