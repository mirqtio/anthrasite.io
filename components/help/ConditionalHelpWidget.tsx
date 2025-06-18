'use client'

import { usePathname } from 'next/navigation'
import { HelpWidget } from './HelpWidget'

export function ConditionalHelpWidget() {
  const pathname = usePathname()

  // Only show help widget on specific pages
  const showHelpWidget =
    pathname.includes('/purchase') ||
    pathname.includes('/checkout') ||
    pathname.includes('/test-purchase')

  if (!showHelpWidget) return null

  return <HelpWidget />
}
