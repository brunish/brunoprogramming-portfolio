import type { Movement, MovementLink, BalanceData } from '../types'

export function computeBalance(movements: Movement[], links: MovementLink[]): BalanceData {
  const totalIncome = movements
    .filter(m => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0)

  const totalExpense = movements
    .filter(m => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0)

  // Net amounts considering links (visual only)
  const linkedExpenseNet = links.reduce((sum, l) => sum + l.netExpense, 0)
  const linkedIncomeNet = links.reduce((sum, l) => sum + l.netIncome, 0)

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    linkedExpenseNet,
    linkedIncomeNet,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}
