import Link from 'next/link'
import Image from 'next/image'
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
      className={cn('flex items-center', sizeClasses[size], className)}
    >
      <Image
        src="/logo_full_white.svg"
        alt="Anthrasite"
        width={140}
        height={40}
        priority
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
