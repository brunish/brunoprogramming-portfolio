import type { Movement, MovementLink } from '../types'
import { generateId } from './id'
import { nowISO } from './date'

export function createLink(expense: Movement, income: Movement): MovementLink {
  const netExpense = Math.max(0, expense.amount - income.amount)
  const netIncome = Math.max(0, income.amount - expense.amount)

  return {
    id: generateId(),
    expenseId: expense.id,
    incomeId: income.id,
    expenseAmount: expense.amount,
    incomeAmount: income.amount,
    netExpense,
    netIncome,
    createdAt: nowISO(),
  }
}

export function getLinkForMovement(id: string, links: MovementLink[]): MovementLink | undefined {
  return links.find(l => l.expenseId === id || l.incomeId === id)
}

export function isLinked(id: string, links: MovementLink[]): boolean {
  return links.some(l => l.expenseId === id || l.incomeId === id)
}
