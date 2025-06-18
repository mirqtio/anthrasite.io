import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  showCount?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      icon,
      showCount,
      maxLength,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const displayValue = value !== undefined ? value : internalValue
    const valueLength = displayValue ? String(displayValue).length : 0

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-anthracite-black">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            value={displayValue}
            onChange={(e) => {
              setInternalValue(e.target.value)
              props.onChange?.(e)
            }}
            className={cn(
              'h-12 w-full rounded-lg border bg-white px-4 text-base text-anthracite-black transition-all duration-200 placeholder:text-anthracite-black/40',
              'focus:border-anthracite-blue focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20',
              'disabled:cursor-not-allowed disabled:bg-anthracite-gray-50 disabled:opacity-50',
              error &&
                'border-anthracite-error focus:border-anthracite-error focus:ring-[#FF3B30]/20',
              !error && 'border-anthracite-gray-100',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {(error || (showCount && maxLength)) && (
          <div className="mt-2 flex items-center justify-between">
            {error && (
              <span className="text-sm text-anthracite-error">{error}</span>
            )}
            {showCount && maxLength && (
              <span className="text-sm text-anthracite-black/60">
                {valueLength} / {maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
