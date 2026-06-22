export type MovementType = 'income' | 'expense'
export type Theme = 'light' | 'dark'

export interface Movement {
  id: string
  type: MovementType
  amount: number
  description: string
  category?: string
  date: string // ISO string
  monthKey: string // 'YYYY-MM'
  fromFixed?: string // FixedItem id if auto-generated
}

export interface MovementLink {
  id: string
  expenseId: string
  incomeId: string
  expenseAmount: number // snapshot del original al momento de vincular
  incomeAmount: number
  netExpense: number // remanente en gastos
  netIncome: number // remanente en ingresos
  createdAt: string
}

export interface FixedItem {
  id: string
  type: MovementType
  name: string
  amount: number
  dayOfMonth?: number // 1-31
  category?: string
  paused: boolean
}

export interface MonthSummary {
  monthKey: string
  totalIncome: number
  totalExpense: number
  netBalance: number
  movementCount: number
  closedAt: string
  movements: Movement[]
  links: MovementLink[]
}

export interface LinkingMode {
  selectedExpenseId: string | null
  selectedIncomeId: string | null
}

export interface BalanceData {
  totalIncome: number
  totalExpense: number
  netBalance: number
  linkedExpenseNet: number
  linkedIncomeNet: number
}
