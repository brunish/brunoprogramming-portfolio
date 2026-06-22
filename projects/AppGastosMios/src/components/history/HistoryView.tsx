import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CalendarDays } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { formatCurrency } from '../../utils/balance'
import { monthKeyToLabel } from '../../utils/date'
import { Badge } from '../ui/Badge'
import type { MonthSummary } from '../../types'

function MonthDetail({ summary }: { summary: MonthSummary }) {
  const isPositive = summary.netBalance >= 0
  const expenses = summary.movements.filter(m => m.type === 'expense')
  const incomes = summary.movements.filter(m => m.type === 'income')

  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ingresos', value: summary.totalIncome, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Gastos', value: summary.totalExpense, color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Balance', value: summary.netBalance, color: isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' },
        ].map(c => (
          <div key={c.label} className="text-center">
            <p className="text-xs text-neutral-500 mb-1">{c.label}</p>
            <p className={`text-sm font-bold ${c.color}`}>{formatCurrency(c.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">Gastos</p>
          {expenses.length === 0 && <p className="text-xs text-neutral-400">Sin registros</p>}
          {expenses.map(m => (
            <div key={m.id} className="flex items-center justify-between py-1 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">{m.description}</span>
                {m.category && <Badge variant="expense">{m.category}</Badge>}
              </div>
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 tabular-nums">{formatCurrency(m.amount)}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Ingresos</p>
          {incomes.length === 0 && <p className="text-xs text-neutral-400">Sin registros</p>}
          {incomes.map(m => (
            <div key={m.id} className="flex items-center justify-between py-1 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">{m.description}</span>
                {m.category && <Badge variant="income">{m.category}</Badge>}
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(m.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MonthCard({ summary }: { summary: MonthSummary }) {
  const [open, setOpen] = useState(false)
  const isPositive = summary.netBalance >= 0

  return (
    <motion.div
      layout
      className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
              {monthKeyToLabel(summary.monthKey)}
            </p>
            <p className="text-xs text-neutral-400">{summary.movementCount} movimientos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? '+' : ''}{formatCurrency(summary.netBalance)}
          </span>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <MonthDetail summary={summary} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function HistoryView() {
  const history = useStore(useShallow(s => s.history))
  const sorted = [...history].sort((a, b) => b.monthKey.localeCompare(a.monthKey))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Historial</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Resumen de meses anteriores
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 py-16 text-center">
          <CalendarDays size={32} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-400 dark:text-neutral-600">
            Aún no hay meses cerrados
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map(s => <MonthCard key={s.monthKey} summary={s} />)}
        </div>
      )}
    </div>
  )
}
