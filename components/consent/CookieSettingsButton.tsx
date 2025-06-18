'use client'

import { useConsent } from '@/lib/context/ConsentContext'
import { Button } from '@/components/Button'

interface CookieSettingsButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CookieSettingsButton({ 
  variant = 'ghost', 
  size = 'sm',
  className 
}: CookieSettingsButtonProps) {
  const { openPreferences } = useConsent()
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={openPreferences}
      className={className}
      aria-label="Open cookie preferences"
    >
      Cookie Settings
    </Button>
  )
}