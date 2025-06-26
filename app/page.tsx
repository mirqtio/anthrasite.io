'use client'

import { OrganicHomepage } from '@/components/homepage/OrganicHomepage'

export default function HomePage() {
  // Always show organic homepage - UTM traffic will be redirected by middleware
  return <OrganicHomepage />
}