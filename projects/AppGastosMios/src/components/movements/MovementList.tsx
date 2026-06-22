import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore, selectExpenses, selectIncomes } from '../../store'
import { MovementCard } from './MovementCard'
import { MovementForm } from './MovementForm'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../utils/balance'
import type { MovementType } from '../../types'

interface ColumnProps {
  type: MovementType
}

function Column({ type }: ColumnProps) {
  const [formOpen, setFormOpen] = useState(false)
  const movements = useStore(useShallow(type === 'expense' ? selectExpenses : selectIncomes))
  const isExpense = type === 'expense'
  const total = movements.reduce((s, m) => s + m.amount, 0)

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExpense ? (
            <TrendingDown size={16} className="text-rose-500" />
          ) : (
            <TrendingUp size={16} className="text-emerald-500" />
          )}
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {isExpense ? 'Gastos' : 'Ingresos'}
          </h2>
        </div>
        <span
          className={`text-sm font-bold tabular-nums ${
            isExpense
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {formatCurrency(total)}
        </span>
      </div>

      {/* Add button */}
      <Button
        variant={isExpense ? 'expense' : 'income'}
        size="sm"
        className="w-full justify-center"
        onClick={() => setFormOpen(true)}
      >
        <Plus size={14} />
        Agregar {isExpense ? 'gasto' : 'ingreso'}
      </Button>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {movements.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-600"
            >
              Sin {isExpense ? 'gastos' : 'ingresos'} este mes
            </motion.p>
          )}
          {movements.map(m => (
            <MovementCard key={m.id} movement={m} />
          ))}
        </AnimatePresence>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={`Nuevo ${isExpense ? 'gasto' : 'ingreso'}`}
      >
        <MovementForm type={type} onClose={() => setFormOpen(false)} />
      </Modal>
    </div>
  )
}

export function MovementList() {
  const linkingMode = useStore(s => s.linkingMode)

  return (
    <div className="relative">
      {linkingMode?.selectedExpenseId && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300"
        >
          Seleccioná un <strong>ingreso</strong> para vincularlo con el gasto seleccionado.
          <button
            onClick={() => useStore.getState().cancelLinking()}
            className="ml-2 underline underline-offset-2 hover:no-underline"
          >
            Cancelar
          </button>
        </motion.div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Column type="expense" />
        <Column type="income" />
      </div>
    </div>
  )
}
