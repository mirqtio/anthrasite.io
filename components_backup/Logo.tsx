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
        colorClasses,
        className
      )}
    >
      <svg
        data-testid="logo-svg"
        viewBox="0 0 200 40"
        className="w-auto h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="0"
          y="30"
          fontSize="24"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
          fill="currentColor"
        >
          ANTHRASITE
        </text>
      </svg>
      <img src="/logo_full_black.svg" alt="Anthrasite" className="hidden" />
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
