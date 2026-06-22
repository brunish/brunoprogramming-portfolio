import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './store'
import { useMonthCycle } from './hooks/useMonthCycle'
import { Header } from './components/layout/Header'
import { BalanceSummary } from './components/balance/BalanceSummary'
import { MovementList } from './components/movements/MovementList'
import { FixedItemList } from './components/fixed/FixedItemList'
import { HistoryView } from './components/history/HistoryView'

export default function App() {
  useMonthCycle()

  const theme = useStore(s => s.theme)
  const activeView = useStore(s => s.activeView)

  // Apply dark class to <html> based on theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-dvh bg-neutral-50 dark:bg-neutral-950">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-6"
            >
              <BalanceSummary />
              <MovementList />
            </motion.div>
          )}

          {activeView === 'fixed' && (
            <motion.div
              key="fixed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <FixedItemList />
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <HistoryView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
