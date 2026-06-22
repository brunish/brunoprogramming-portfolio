import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { useBalance } from '../../hooks/useBalance'
import { formatCurrency } from '../../utils/balance'

export function BalanceSummary() {
  const { totalIncome, totalExpense, netBalance } = useBalance()
  const isPositive = netBalance >= 0

  const cards = [
    {
      label: 'Ingresos',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      border: 'border-emerald-100 dark:border-emerald-900',
    },
    {
      label: 'Gastos',
      value: totalExpense,
      icon: TrendingDown,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950',
      border: 'border-rose-100 dark:border-rose-900',
    },
    {
      label: 'Balance neto',
      value: Math.abs(netBalance),
      icon: Scale,
      color: isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
      bg: isPositive ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-rose-50 dark:bg-rose-950',
      border: isPositive ? 'border-emerald-100 dark:border-emerald-900' : 'border-rose-100 dark:border-rose-900',
      prefix: isPositive ? '+' : '-',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`rounded-2xl border p-4 ${card.bg} ${card.border}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon size={14} className={card.color} />
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {card.label}
            </span>
          </div>
          <p className={`text-lg font-bold tabular-nums ${card.color}`}>
            {card.prefix ?? ''}{formatCurrency(card.value)}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
