'use client'

import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'

interface PurchaseHeroProps {
  businessName: string
  domain: string
}

export function PurchaseHero({ businessName, domain }: PurchaseHeroProps) {
  return (
    <header className="py-8 md:py-10" data-testid="purchase-header">
      <div className="px-10 max-w-[1200px] mx-auto">
        {/* Logo */}
        <div className="mb-12">
          <Logo />
          <div className="text-[17px] font-light tracking-[0.3em] opacity-70 mt-[2px] text-center">
            VALUE, CRYSTALLIZED
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Business name as main heading */}
          <h1 className="text-[48px] font-light mb-4">
            {businessName}, your audit is ready
          </h1>

          {/* Subheading */}
          <p className="text-[24px] opacity-70">
            We've identified opportunities worth thousands
          </p>
        </motion.div>

        {/* Thin divider */}
        <div className="mt-12 h-px bg-white/10" />
      </div>
    </header>
  )
}
