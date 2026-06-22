import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Pause, Play, CalendarDays } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { FixedItemForm } from './FixedItemForm'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '../../utils/balance'
import type { FixedItem } from '../../types'

export function FixedItemList() {
  const fixedItems = useStore(useShallow(s => s.fixedItems))
  const removeFixedItem = useStore(s => s.removeFixedItem)
  const toggleFixedPause = useStore(s => s.toggleFixedPause)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FixedItem | undefined>()

  const expenses = fixedItems.filter(f => f.type === 'expense')
  const incomes = fixedItems.filter(f => f.type === 'income')

  function FixedCard({ item }: { item: FixedItem }) {
    const isIncome = item.type === 'income'
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group flex items-center justify-between gap-3 rounded-xl border bg-white p-4 dark:bg-neutral-900 ${
          item.paused
            ? 'border-neutral-200 dark:border-neutral-800 opacity-50'
            : isIncome
            ? 'border-l-4 border-l-emerald-400 border-neutral-200 dark:border-neutral-800'
            : 'border-l-4 border-l-rose-400 border-neutral-200 dark:border-neutral-800'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(item.amount)}
            </span>
            {item.paused && <Badge variant="neutral">Pausado</Badge>}
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{item.name}</p>
          <div className="mt-1 flex items-center gap-2">
            {item.category && <Badge variant={isIncome ? 'income' : 'expense'}>{item.category}</Badge>}
            {item.dayOfMonth && (
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <CalendarDays size={11} />
                Día {item.dayOfMonth}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toggleFixedPause(item.id)}
            title={item.paused ? 'Reanudar' : 'Pausar'}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {item.paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            onClick={() => { setEditing(item); setFormOpen(true) }}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => removeFixedItem(item.id)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Fijos mensuales
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Se cargan automáticamente al inicio de cada mes
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true) }}>
          <Plus size={14} />
          Agregar
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-500">
            Gastos fijos ({expenses.length})
          </h3>
          <AnimatePresence mode="popLayout">
            {expenses.length === 0 && (
              <p className="text-sm text-neutral-400 py-4 text-center">Sin gastos fijos</p>
            )}
            {expenses.map(f => <FixedCard key={f.id} item={f} />)}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
            Ingresos fijos ({incomes.length})
          </h3>
          <AnimatePresence mode="popLayout">
            {incomes.length === 0 && (
              <p className="text-sm text-neutral-400 py-4 text-center">Sin ingresos fijos</p>
            )}
            {incomes.map(f => <FixedCard key={f.id} item={f} />)}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined) }}
        title={editing ? 'Editar fijo' : 'Nuevo ítem fijo'}
      >
        <FixedItemForm
          onClose={() => { setFormOpen(false); setEditing(undefined) }}
          editing={editing}
        />
      </Modal>
    </div>
  )
}
