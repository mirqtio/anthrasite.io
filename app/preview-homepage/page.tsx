'use client'

import { OrganicHomepage } from '@/components/homepage/OrganicHomepage'
import { PurchaseHomepage } from '@/components/homepage/PurchaseHomepage'
import { useState } from 'react'

export default function PreviewPage() {
  const [mode, setMode] = useState<'organic' | 'purchase'>('organic')

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded shadow-lg">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mode === 'purchase'}
            onChange={(e) => setMode(e.target.checked ? 'purchase' : 'organic')}
          />
          Purchase Mode
        </label>
      </div>

      {mode === 'organic' ? <OrganicHomepage /> : <PurchaseHomepage />}
    </div>
  )
}
