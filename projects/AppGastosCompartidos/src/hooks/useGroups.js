import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEY, DEMO_GROUP } from '../constants'

function loadGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // datos corruptos → usar demo
  }
  return [DEMO_GROUP]
}

export function useGroups() {
  const [groups, setGroups] = useState(loadGroups)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
    } catch {
      // cuota excedida → ignorar
    }
  }, [groups])

  const createGroup = useCallback(group => setGroups(prev => [group, ...prev]), [])
  const deleteGroup = useCallback(id    => setGroups(prev => prev.filter(g => g.id !== id)), [])
  const updateGroup = useCallback(group => setGroups(prev => prev.map(g => g.id === group.id ? group : g)), [])

  return { groups, createGroup, deleteGroup, updateGroup }
}
