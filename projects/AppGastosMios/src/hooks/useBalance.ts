import { useShallow } from 'zustand/react/shallow'
import { useStore, selectActiveMovements } from '../store'
import { computeBalance } from '../utils/balance'
import type { BalanceData } from '../types'

export function useBalance(): BalanceData {
  const movements = useStore(useShallow(selectActiveMovements))
  const links = useStore(useShallow(s => s.links))
  return computeBalance(movements, links)
}
