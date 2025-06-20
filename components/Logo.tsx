import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
  href?: string
  darkMode?: boolean
}

export function Logo({
  size = 'medium',
  className,
  href,
  darkMode,
}: LogoProps) {
  const sizeClasses = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-12',
  }

  const colorClasses = darkMode ? 'text-white' : 'text-black'

  const logoElement = (
    <div
      data-testid="logo"
      className={cn(
        'flex items-center',
        sizeClasses[size],
        className
      )}
    >
      <img 
        src="/logo_full_white.svg" 
        alt="Anthrasite" 
        className="w-auto h-full"
      />
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        aria-label="Anthrasite homepage"
        className="inline-block"
      >
        {logoElement}
      </Link>
    )
  }

  return logoElement
}
