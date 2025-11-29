import React from 'react'
import { cn } from '@/lib/utils'

interface RobustCenteredLayoutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /**
   * Max width of the content container. Defaults to '28rem' (max-w-md).
   */
  maxWidth?: string
  /**
   * Min width of the content container. Defaults to '300px' to prevent squishing.
   */
  minWidth?: string
  /**
   * Width of the content container. Defaults to '90vw' for mobile responsiveness.
   */
  width?: string
}

/**
 * A layout component that centers its children and enforces robust width constraints
 * to prevent "squished" layouts on small screens or within complex stacking contexts.
 *
 * Implements ADR-P14: Robust Modal Layout Strategy.
 */
export function RobustCenteredLayout({
  children,
  className,
  maxWidth = '28rem',
  minWidth = '300px',
  width = '90vw',
  style,
  ...props
}: RobustCenteredLayoutProps) {
  return (
    <div
      className={cn(
        'bg-[#111] border border-white/10 rounded-lg p-8 shadow-2xl',
        className
      )}
      style={{
        width,
        maxWidth,
        minWidth,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
