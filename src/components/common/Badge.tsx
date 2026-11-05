import React from 'react'
import { cn } from '../../lib/utils'
import { HealthStatus } from '../../types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'outline'
  healthStatus?: HealthStatus
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  healthStatus,
  size = 'md',
  className,
}) => {
  let style = 'bg-gray-100 text-gray-800 dark:bg-charcoal-800 dark:text-gray-200'

  if (healthStatus) {
    switch (healthStatus) {
      case 'champion':
        style = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40'
        break
      case 'on_track':
        style = 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300/40'
        break
      case 'at_risk':
        style = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40'
        break
      case 'dormant':
        style = 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300/40'
        break
    }
  } else {
    switch (variant) {
      case 'success':
        style = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40'
        break
      case 'warning':
        style = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40'
        break
      case 'danger':
        style = 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300/40'
        break
      case 'info':
        style = 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300/40'
        break
      case 'gold':
        style = 'bg-gold-100 text-gold-800 dark:bg-gold-950/70 dark:text-gold-300 border border-gold-400/40 font-semibold'
        break
      case 'outline':
        style = 'border border-gray-300 dark:border-charcoal-700 text-charcoal-700 dark:text-gray-300 bg-transparent'
        break
    }
  }

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full shrink-0 tracking-wide',
        sizeStyle,
        style,
        className
      )}
    >
      {children}
    </span>
  )
}

