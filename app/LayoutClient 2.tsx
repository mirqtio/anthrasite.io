'use client'

import { Suspense } from 'react'
import { SiteModeProvider } from '@/lib/context/SiteModeContext'

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SiteModeProvider>{children}</SiteModeProvider>
    </Suspense>
  )
}
