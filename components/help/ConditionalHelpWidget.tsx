'use client'

import { usePathname } from 'next/navigation'
import { HelpWidget } from './HelpWidget'

export function ConditionalHelpWidget() {
  const pathname = usePathname()

  // Only show help widget on specific pages (not success page - it has its own FAQ)
  const showHelpWidget =
    (pathname.includes('/purchase') &&
      !pathname.includes('/purchase/success')) ||
    pathname.includes('/checkout') ||
    pathname.includes('/test-purchase')

  if (!showHelpWidget) return null

  return <HelpWidget />
}
