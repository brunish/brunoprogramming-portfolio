import { Trash2 } from 'lucide-react'
import Avatar from './Avatar'
import { fmt, getCat } from '../utils'

export default function ExpenseCard({ expense, participants, onDelete, idx }) {
  const payer     = participants.find(p => p.id === expense.paidBy)
  const cat       = getCat(expense.category)
  const Icon      = cat.icon
  const perPerson = expense.amount / expense.splitBetween.length
  const splitNames = expense.splitBetween
    .map(id => participants.find(p => p.id === id)?.name)
    .filter(Boolean)

  return (
    <div className="card card-hover animate-slide-up" style={{ borderRadius: 10, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start', animationDelay: `${idx * 0.05}s` }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: cat.color + '18', border: `1px solid ${cat.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={cat.color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{expense.description}</div>
            <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{expense.date} · {cat.label}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{fmt(expense.amount)}</div>
            <div className="mono" style={{ fontSize: 11, color: '#6b6b8a', marginTop: 1 }}>{fmt(perPerson)} c/u</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {payer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Avatar name={payer.name} color={payer.color} size={18} />
              <span style={{ fontSize: 12, color: '#9999b3' }}>{payer.name} pagó</span>
            </div>
          )}
          <span style={{ fontSize: 11, color: '#3a3a52' }}>·</span>
          <span style={{ fontSize: 11, color: '#6b6b8a' }}>
            entre {splitNames.slice(0, 3).join(', ')}{splitNames.length > 3 ? ` +${splitNames.length - 3}` : ''}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(expense.id)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2a2a3a', padding: 4, borderRadius: 4, flexShrink: 0, display: 'flex', transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ff5782'}
        onMouseLeave={e => e.currentTarget.style.color = '#2a2a3a'}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
