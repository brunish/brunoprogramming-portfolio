import { useMemo } from 'react'
import { TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'
import Avatar from './Avatar'
import { CATEGORIES } from '../constants'
import { fmt } from '../utils'

export default function SummaryStats({ participants, expenses, balances }) {
  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  const spentByPerson = useMemo(() => {
    const map = {}
    participants.forEach(p => { map[p.id] = 0 })
    expenses.forEach(e => { map[e.paidBy] = (map[e.paidBy] || 0) + e.amount })
    return map
  }, [participants, expenses])

  const catTotals = useMemo(() => {
    const map = {}
    CATEGORIES.forEach(c => { map[c.id] = 0 })
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return map
  }, [expenses])

  const maxSpent = Math.max(...Object.values(spentByPerson), 1)
  const sortedParticipants = [...participants].sort((a, b) => (spentByPerson[b.id] || 0) - (spentByPerson[a.id] || 0))
  const activeCategories = CATEGORIES.filter(c => catTotals[c.id] > 0).sort((a, b) => catTotals[b.id] - catTotals[a.id])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Total */}
      <div className="card animate-scale-in" style={{ borderRadius: 12, padding: '20px 22px', background: 'linear-gradient(135deg, rgba(184,255,87,0.06) 0%, transparent 60%)', borderColor: 'rgba(184,255,87,0.15)' }}>
        <div style={{ fontSize: 12, color: '#9999b3', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Total del grupo</div>
        <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#b8ff57', lineHeight: 1 }}>{fmt(totalSpent)}</div>
        <div style={{ color: '#6b6b8a', fontSize: 12, marginTop: 6 }}>
          {expenses.length} gasto{expenses.length !== 1 ? 's' : ''} · {participants.length} personas
        </div>
      </div>

      {/* Balance por persona */}
      <div className="card" style={{ borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#6b6b8a', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 14 }}>Balance por persona</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedParticipants.map((p, idx) => {
            const spent = spentByPerson[p.id] || 0
            const bal   = balances[p.id] ?? 0
            const pct   = (spent / maxSpent) * 100
            const isCreditor = bal >  0.01
            const isDebtor   = bal < -0.01

            return (
              <div key={p.id} className="animate-slide-right" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <Avatar name={p.name} color={p.color} size={26} />
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: '#9999b3' }}>pagó {fmt(spent)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 86, justifyContent: 'flex-end' }}>
                    {isCreditor && <TrendingUp  size={12} color="#b8ff57" />}
                    {isDebtor   && <TrendingDown size={12} color="#ff5782" />}
                    {!isCreditor && !isDebtor && <CheckCircle2 size={12} color="#57c8ff" />}
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: isCreditor ? '#b8ff57' : isDebtor ? '#ff5782' : '#57c8ff' }}>
                      {!isCreditor && !isDebtor ? 'al día ✓' : `${isCreditor ? '+' : ''}${fmt(bal)}`}
                    </span>
                  </div>
                </div>
                <div style={{ height: 3, background: '#1e1e2a', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: 2, transition: 'width 0.5s cubic-bezier(.22,1,.36,1)' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Por categoría */}
      <div className="card" style={{ borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#6b6b8a', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 14 }}>Por categoría</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeCategories.map(cat => {
            const Icon = cat.icon
            const amt  = catTotals[cat.id]
            const pct  = totalSpent > 0 ? (amt / totalSpent) * 100 : 0
            return (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={13} color={cat.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#9999b3' }}>{cat.label}</span>
                    <span className="mono" style={{ fontSize: 12 }}>{fmt(amt)}</span>
                  </div>
                  <div style={{ height: 3, background: '#1e1e2a', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
