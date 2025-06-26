'use client'

import { Suspense } from 'react'
import { PurchaseHomepage } from '@/components/homepage/PurchaseHomepage'

function PurchasePageLoading() {
  return (
    <main className="min-h-screen bg-carbon flex items-center justify-center">
      <div className="animate-fade-in">
        <div className="w-8 h-8 bg-white animate-pulse" />
      </div>
    </main>
  )
}

export default function PurchaseDedicatedPage() {
  return (
    <Suspense fallback={<PurchasePageLoading />}>
      <PurchaseHomepage />
    </Suspense>
  )
}