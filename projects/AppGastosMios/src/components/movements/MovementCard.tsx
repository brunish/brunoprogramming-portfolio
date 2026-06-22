import { motion } from 'framer-motion'
import { Trash2, Link2, Link2Off, Pin } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store'
import { formatCurrency } from '../../utils/balance'
import { formatDate } from '../../utils/date'
import { getLinkForMovement, isLinked } from '../../utils/linking'
import { Badge } from '../ui/Badge'
import type { Movement } from '../../types'

interface MovementCardProps {
  movement: Movement
}

export function MovementCard({ movement }: MovementCardProps) {
  const links = useStore(useShallow(s => s.links))
  const linkingMode = useStore(s => s.linkingMode)
  const removeMovement = useStore(s => s.removeMovement)
  const startLinking = useStore(s => s.startLinking)
  const completeLinking = useStore(s => s.completeLinking)
  const cancelLinking = useStore(s => s.cancelLinking)
  const removeLink = useStore(s => s.removeLink)

  const link = getLinkForMovement(movement.id, links)
  const linked = !!link
  const isExpense = movement.type === 'expense'

  // During linking mode, this income card can be selected as target
  const isSelectingIncome =
    linkingMode !== null &&
    linkingMode.selectedExpenseId !== null &&
    movement.type === 'income' &&
    !isLinked(movement.id, links)

  // This card is the currently selected expense waiting for a pair
  const isAwaitingPair =
    linkingMode?.selectedExpenseId === movement.id

  function handleLinkAction() {
    if (linked && link) {
      removeLink(link.id)
      return
    }
    if (isExpense) {
      if (isAwaitingPair) {
        cancelLinking()
      } else {
        startLinking(movement.id)
      }
    }
    if (isSelectingIncome) {
      completeLinking(movement.id)
    }
  }

  // Net amount after compensation
  const displayAmount = link
    ? isExpense
      ? link.netExpense
      : link.netIncome
    : movement.amount

  const isSettled = linked && displayAmount === 0

  const borderColor = isExpense
    ? linked
      ? 'border-l-amber-400'
      : 'border-l-rose-400'
    : linked
    ? 'border-l-amber-400'
    : 'border-l-emerald-400'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: isExpense ? -20 : 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`group relative rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 border-l-4 ${borderColor} ${
        isAwaitingPair ? 'ring-2 ring-amber-400' : ''
      } ${isSelectingIncome ? 'cursor-pointer ring-2 ring-dashed ring-amber-300 hover:ring-amber-500' : ''} ${
        isSettled ? 'opacity-60' : ''
      }`}
      onClick={isSelectingIncome ? handleLinkAction : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-base font-semibold tabular-nums ${
                isSettled
                  ? 'text-neutral-400 line-through'
                  : isExpense
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isExpense ? '-' : '+'}{formatCurrency(displayAmount)}
            </span>
            {linked && displayAmount !== movement.amount && (
              <span className="text-xs text-neutral-400 line-through tabular-nums">
                {formatCurrency(movement.amount)}
              </span>
            )}
            {isSettled && <Badge variant="settled">Saldado</Badge>}
            {linked && !isSettled && <Badge variant="linked">Vinculado</Badge>}
            {movement.fromFixed && <Pin size={12} className="text-neutral-400" />}
          </div>
          <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300 truncate">
            {movement.description}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            {movement.category && (
              <Badge variant={isExpense ? 'expense' : 'income'}>{movement.category}</Badge>
            )}
            <span className="text-xs text-neutral-400">{formatDate(movement.date)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isExpense && !linked && (
            <button
              onClick={handleLinkAction}
              title="Vincular con ingreso"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950"
            >
              <Link2 size={14} />
            </button>
          )}
          {isExpense && isAwaitingPair && (
            <button
              onClick={cancelLinking}
              title="Cancelar vinculación"
              className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
            >
              <Link2Off size={14} />
            </button>
          )}
          {linked && (
            <button
              onClick={() => link && removeLink(link.id)}
              title="Desvincular"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950"
            >
              <Link2Off size={14} />
            </button>
          )}
          <button
            onClick={() => removeMovement(movement.id)}
            title="Eliminar"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Linking hint overlay */}
      {isSelectingIncome && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-amber-50/80 dark:bg-amber-950/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Tocá para vincular
          </span>
        </div>
      )}
    </motion.div>
  )
}
