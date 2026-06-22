import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Movement,
  MovementLink,
  FixedItem,
  MonthSummary,
  LinkingMode,
  Theme,
} from '../types'
import { generateId } from '../utils/id'
import { currentMonthKey } from '../utils/date'
import { createLink } from '../utils/linking'
import { closeMonth, generateFixedMovements } from '../utils/monthCycle'

interface AppState {
  // Data
  activeMonthKey: string
  movements: Movement[]
  links: MovementLink[]
  fixedItems: FixedItem[]
  history: MonthSummary[]

  // UI
  theme: Theme
  linkingMode: LinkingMode | null
  activeView: 'dashboard' | 'fixed' | 'history'

  // Movement actions
  addMovement: (data: Omit<Movement, 'id' | 'monthKey'>) => void
  removeMovement: (id: string) => void
  editMovement: (id: string, data: Partial<Omit<Movement, 'id' | 'monthKey'>>) => void

  // Link actions
  startLinking: (expenseId: string) => void
  completeLinking: (incomeId: string) => void
  cancelLinking: () => void
  removeLink: (linkId: string) => void

  // Fixed actions
  addFixedItem: (data: Omit<FixedItem, 'id'>) => void
  removeFixedItem: (id: string) => void
  editFixedItem: (id: string, data: Partial<Omit<FixedItem, 'id'>>) => void
  toggleFixedPause: (id: string) => void

  // Month cycle
  advanceToCurrentMonth: () => void

  // UI actions
  setTheme: (theme: Theme) => void
  setActiveView: (view: AppState['activeView']) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeMonthKey: currentMonthKey(),
      movements: [],
      links: [],
      fixedItems: [],
      history: [],
      theme: 'light',
      linkingMode: null,
      activeView: 'dashboard',

      addMovement(data) {
        const movement: Movement = {
          ...data,
          id: generateId(),
          monthKey: get().activeMonthKey,
        }
        set(s => ({ movements: [...s.movements, movement] }))
      },

      removeMovement(id) {
        set(s => ({
          movements: s.movements.filter(m => m.id !== id),
          links: s.links.filter(l => l.expenseId !== id && l.incomeId !== id),
        }))
      },

      editMovement(id, data) {
        set(s => ({
          movements: s.movements.map(m => (m.id === id ? { ...m, ...data } : m)),
        }))
      },

      startLinking(expenseId) {
        set({ linkingMode: { selectedExpenseId: expenseId, selectedIncomeId: null } })
      },

      completeLinking(incomeId) {
        const { linkingMode, movements, links } = get()
        if (!linkingMode?.selectedExpenseId) return

        const expense = movements.find(m => m.id === linkingMode.selectedExpenseId)
        const income = movements.find(m => m.id === incomeId)
        if (!expense || !income) return

        // Remove existing links for these movements before creating a new one
        const cleanedLinks = links.filter(
          l => l.expenseId !== expense.id && l.incomeId !== income.id
        )
        const link = createLink(expense, income)
        set({ links: [...cleanedLinks, link], linkingMode: null })
      },

      cancelLinking() {
        set({ linkingMode: null })
      },

      removeLink(linkId) {
        set(s => ({ links: s.links.filter(l => l.id !== linkId) }))
      },

      addFixedItem(data) {
        const item: FixedItem = { ...data, id: generateId() }
        set(s => ({ fixedItems: [...s.fixedItems, item] }))
      },

      removeFixedItem(id) {
        set(s => ({ fixedItems: s.fixedItems.filter(f => f.id !== id) }))
      },

      editFixedItem(id, data) {
        set(s => ({
          fixedItems: s.fixedItems.map(f => (f.id === id ? { ...f, ...data } : f)),
        }))
      },

      toggleFixedPause(id) {
        set(s => ({
          fixedItems: s.fixedItems.map(f => (f.id === id ? { ...f, paused: !f.paused } : f)),
        }))
      },

      advanceToCurrentMonth() {
        const { activeMonthKey, movements, links, fixedItems, history } = get()
        const now = currentMonthKey()
        if (activeMonthKey === now) return

        // Close the previous month
        const summary = closeMonth(activeMonthKey, movements, links)
        const alreadyClosed = history.some(h => h.monthKey === activeMonthKey)

        // Remove movements from the closed month, keep any future ones
        const remainingMovements = movements.filter(m => m.monthKey !== activeMonthKey)
        const remainingLinks = links.filter(l => {
          const remainingIds = new Set(remainingMovements.map(m => m.id))
          return remainingIds.has(l.expenseId) && remainingIds.has(l.incomeId)
        })

        // Generate fixed movements for the new month
        const fixedMovements = generateFixedMovements(fixedItems, now)

        set({
          activeMonthKey: now,
          movements: [...remainingMovements, ...fixedMovements],
          links: remainingLinks,
          history: alreadyClosed
            ? history.map(h => h.monthKey === activeMonthKey ? summary : h)
            : [...history, summary],
        })
      },

      setTheme(theme) {
        set({ theme })
      },

      setActiveView(view) {
        set({ activeView: view })
      },
    }),
    {
      name: 'gastos-mios-store',
    }
  )
)

// These selectors return derived arrays — callers must wrap with useShallow
export const selectActiveMovements = (s: AppState) =>
  s.movements.filter(m => m.monthKey === s.activeMonthKey)

export const selectExpenses = (s: AppState) =>
  s.movements.filter(m => m.monthKey === s.activeMonthKey && m.type === 'expense')

export const selectIncomes = (s: AppState) =>
  s.movements.filter(m => m.monthKey === s.activeMonthKey && m.type === 'income')
