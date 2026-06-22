import type { Movement, MovementLink, MonthSummary, FixedItem } from '../types'
import { generateId } from './id'
import { currentMonthKey, monthKeyForDay, nowISO } from './date'

export function closeMonth(
  monthKey: string,
  movements: Movement[],
  links: MovementLink[]
): MonthSummary {
  const monthMovements = movements.filter(m => m.monthKey === monthKey)
  const totalIncome = monthMovements
    .filter(m => m.type === 'income')
    .reduce((s, m) => s + m.amount, 0)
  const totalExpense = monthMovements
    .filter(m => m.type === 'expense')
    .reduce((s, m) => s + m.amount, 0)

  // Only links whose both movements belong to this month
  const monthMovementIds = new Set(monthMovements.map(m => m.id))
  const monthLinks = links.filter(
    l => monthMovementIds.has(l.expenseId) && monthMovementIds.has(l.incomeId)
  )

  return {
    monthKey,
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    movementCount: monthMovements.length,
    closedAt: nowISO(),
    movements: monthMovements,
    links: monthLinks,
  }
}

export function generateFixedMovements(fixedItems: FixedItem[], monthKey: string): Movement[] {
  const now = currentMonthKey()
  return fixedItems
    .filter(f => !f.paused)
    .map(f => ({
      id: generateId(),
      type: f.type,
      amount: f.amount,
      description: f.name,
      category: f.category,
      date: f.dayOfMonth ? monthKeyForDay(f.dayOfMonth) : new Date(`${monthKey}-01`).toISOString(),
      monthKey: now,
      fromFixed: f.id,
    }))
}
