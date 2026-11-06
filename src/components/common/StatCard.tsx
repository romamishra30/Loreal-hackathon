import React from 'react'
import { LucideIcon, Info } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useUiStore } from '../../store/useUiStore'

interface StatCardProps {
  title: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  iconColor?: string
  kpiId?: string
  onInfoClick?: () => void
  trend?: {
    value: string
    isPositive: boolean
    label?: string
  }
  className?: string
  highlight?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = 'text-brand-600',
  kpiId,
  onInfoClick,
  trend,
  className,
  highlight = false,
}) => {
  const { openPopover } = useUiStore()

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onInfoClick) {
      onInfoClick()
    } else if (kpiId) {
      openPopover('formula', kpiId)
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-5 border transition-all duration-200 shadow-sm relative overflow-hidden',
        highlight
          ? 'bg-gradient-to-br from-brand-900 to-brand-800 text-white border-brand-700'
          : 'bg-white dark:bg-charcoal-900 border-gray-200/80 dark:border-charcoal-800 text-charcoal-800 dark:text-gray-100',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                highlight ? 'text-brand-200' : 'text-charcoal-700 dark:text-gray-400'
              )}
            >
              {title}
            </p>
            {(kpiId || onInfoClick) && (
              <button
                onClick={handleInfo}
                className="p-0.5 rounded text-gray-400 hover:text-brand-600 dark:hover:text-emerald-400 transition-colors"
                title="Why this number? View formula & inputs"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-sans tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  'text-xs font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center',
                  trend.isPositive
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtext && (
            <p
              className={cn(
                'text-xs mt-1 font-medium',
                highlight ? 'text-brand-100' : 'text-charcoal-600 dark:text-gray-400'
              )}
            >
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'p-2.5 rounded-xl shrink-0',
              highlight
                ? 'bg-brand-700/60 text-white'
                : 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
            )}
          >
            <Icon className={cn('w-5 h-5', highlight ? 'text-white' : iconColor)} />
          </div>
        )}
      </div>
    </div>
  )
}

