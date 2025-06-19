import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse rounded-md bg-anthracite-gray-100',
          className
        )}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'
