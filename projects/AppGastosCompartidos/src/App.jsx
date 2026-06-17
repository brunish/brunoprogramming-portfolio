import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import GroupView from './components/GroupView'
import { useGroups } from './hooks/useGroups'
import './index.css'

export default function App() {
  const { groups, createGroup, deleteGroup, updateGroup } = useGroups()
  const [activeGroupId, setActiveGroupId] = useState(null)

  const activeGroup = groups.find(g => g.id === activeGroupId)

  if (activeGroup) {
    return (
      <GroupView
        group={activeGroup}
        onUpdate={updateGroup}
        onBack={() => setActiveGroupId(null)}
      />
    )
  }

  return (
    <HomeScreen
      groups={groups}
      onSelectGroup={setActiveGroupId}
      onCreateGroup={createGroup}
      onDeleteGroup={deleteGroup}
    />
  )
}
