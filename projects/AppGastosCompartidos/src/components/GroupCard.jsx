import { Trash2 } from 'lucide-react'
import Avatar from './Avatar'
import Badge from './Badge'
import { calculateSettlements } from '../utils'
import { fmt } from '../utils'

export default function GroupCard({ group, onClick, onDelete, idx }) {
  const total = group.expenses.reduce((sum, e) => sum + e.amount, 0)
  const { settlements } = calculateSettlements(group.participants, group.expenses)
  const pendingCount = settlements.length

  return (
    <div
      onClick={onClick}
      className="card card-hover animate-slide-up"
      style={{ borderRadius: 12, padding: '16px 18px', cursor: 'pointer', animationDelay: `${idx * 0.06}s` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: '#1e1e2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {group.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{group.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: -4 }}>
              {group.participants.slice(0, 4).map((p, i) => (
                <div key={p.id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}>
                  <Avatar name={p.name} color={p.color} size={22} />
                </div>
              ))}
              {group.participants.length > 4 && (
                <div style={{ marginLeft: -8, width: 22, height: 22, borderRadius: 5, background: '#2a2a3a', border: '1.5px solid #3a3a52', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#6b6b8a', fontWeight: 700 }}>
                  +{group.participants.length - 4}
                </div>
              )}
            </div>
            <span style={{ fontSize: 11, color: '#6b6b8a' }}>{group.participants.length} personas</span>
            <span style={{ fontSize: 11, color: '#3a3a52' }}>·</span>
            <span style={{ fontSize: 11, color: '#6b6b8a' }}>{group.expenses.length} gastos</span>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{fmt(total)}</div>
          {pendingCount > 0
            ? <Badge color="#ff5782">{pendingCount} deuda{pendingCount !== 1 ? 's' : ''}</Badge>
            : group.expenses.length > 0
              ? <Badge color="#b8ff57">saldado ✓</Badge>
              : <span style={{ fontSize: 11, color: '#3a3a52' }}>sin gastos</span>
          }
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          onClick={e => { e.stopPropagation(); onDelete(group.id) }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2a2a3a', padding: '4px 6px', borderRadius: 5, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s', fontFamily: "'Syne', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff5782'}
          onMouseLeave={e => e.currentTarget.style.color = '#2a2a3a'}
        >
          <Trash2 size={12} /> Eliminar grupo
        </button>
      </div>
    </div>
  )
}
