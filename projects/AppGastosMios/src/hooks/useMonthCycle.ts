import { useEffect } from 'react'
import { useStore } from '../store'
import { currentMonthKey } from '../utils/date'

export function useMonthCycle() {
  const activeMonthKey = useStore(s => s.activeMonthKey)
  const advanceToCurrentMonth = useStore(s => s.advanceToCurrentMonth)

  useEffect(() => {
    if (activeMonthKey !== currentMonthKey()) {
      advanceToCurrentMonth()
    }
  }, [activeMonthKey, advanceToCurrentMonth])
}
