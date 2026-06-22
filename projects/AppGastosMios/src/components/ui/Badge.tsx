import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'neutral' | 'income' | 'expense' | 'linked' | 'settled'
}

const variants = {
  neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  income: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  expense: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  linked: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  settled: 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 line-through',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
