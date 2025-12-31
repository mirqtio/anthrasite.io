'use client'

import { CheckCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface ConfirmationHeroProps {
  orderRef: string
}

/**
 * Hero section for the confirmation page.
 * Shows success checkmark, "Purchase complete" heading, and order reference.
 */
export function ConfirmationHero({ orderRef }: ConfirmationHeroProps) {
  return (
    <div className="text-center">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Logo />
      </div>

      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>

      {/* Heading */}
      <h1 className="text-[32px] min-[800px]:text-[40px] font-semibold tracking-[0.02em] mb-3">
        Purchase complete
      </h1>

      {/* Order Reference */}
      <p className="text-white/60 text-[16px] tracking-[0.02em]">
        Order #{orderRef}
      </p>
    </div>
  )
}
