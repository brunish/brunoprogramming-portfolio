import { CATEGORIES } from './constants'

export function calculateSettlements(participants, expenses) {
  const balances = {}
  participants.forEach(p => { balances[p.id] = 0 })

  expenses.forEach(expense => {
    if (!expense.splitBetween.length) return
    const perPerson = expense.amount / expense.splitBetween.length
    balances[expense.paidBy] += expense.amount
    expense.splitBetween.forEach(id => { balances[id] -= perPerson })
  })

  const creditors = []
  const debtors = []

  Object.entries(balances).forEach(([id, bal]) => {
    if (bal >  0.01) creditors.push({ id, amount:  bal })
    if (bal < -0.01) debtors.push(  { id, amount: -bal })
  })

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort(  (a, b) => b.amount - a.amount)

  const settlements = []
  let i = 0, j = 0

  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].amount, debtors[j].amount)
    settlements.push({
      id: `${debtors[j].id}->${creditors[i].id}`,
      from: debtors[j].id,
      to: creditors[i].id,
      amount: Math.round(amount * 100) / 100,
    })
    creditors[i].amount -= amount
    debtors[j].amount   -= amount
    if (creditors[i].amount < 0.01) i++
    if (debtors[j].amount   < 0.01) j++
  }

  return { settlements, balances }
}

export const fmt   = n  => `$${Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const today = () => new Date().toISOString().split('T')[0]
export const uid   = () => Math.random().toString(36).slice(2, 10)
export const getCat = id => CATEGORIES.find(c => c.id === id) ?? CATEGORIES[4]

export const labelStyle = {
  fontSize: 11,
  color: '#6b6b8a',
  letterSpacing: '0.06em',
  fontWeight: 700,
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}
