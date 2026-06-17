import { ArrowRight, Check, CheckCircle2 } from 'lucide-react'
import Avatar from './Avatar'
import { fmt } from '../utils'

export default function SettlementPanel({ settlements, participants, settled, onToggle }) {
  const getName  = id => participants.find(p => p.id === id)?.name  ?? id
  const getColor = id => participants.find(p => p.id === id)?.color ?? '#fff'

  const settledSet = new Set(settled)
  const pending = settlements.filter(s => !settledSet.has(s.id))
  const done    = settlements.filter(s =>  settledSet.has(s.id))

  if (settlements.length === 0) {
    return (
      <div className="card animate-scale-in" style={{ borderRadius: 12, padding: 40, textAlign: 'center' }}>
        <CheckCircle2 size={36} color="#b8ff57" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Todo en orden</div>
        <div style={{ color: '#6b6b8a', fontSize: 13 }}>No hay deudas pendientes.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {pending.map((s, idx) => (
        <div key={s.id} className="card card-hover animate-slide-up" style={{ borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, animationDelay: `${idx * 0.06}s` }}>
          <Avatar name={getName(s.from)} color={getColor(s.from)} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: getColor(s.from) }}>{getName(s.from)}</span>
              <span style={{ color: '#6b6b8a', margin: '0 6px' }}>le paga a</span>
              <span style={{ color: getColor(s.to) }}>{getName(s.to)}</span>
            </div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#b8ff57', marginTop: 2 }}>{fmt(s.amount)}</div>
          </div>
          <ArrowRight size={14} color="#3a3a52" style={{ flexShrink: 0 }} />
          <Avatar name={getName(s.to)} color={getColor(s.to)} size={34} />
          <button
            className="btn-lime"
            onClick={() => onToggle(s.id)}
            style={{ border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 12, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Check size={13} /> Pagado
          </button>
        </div>
      ))}

      {done.map(s => (
        <div key={s.id} className="card" style={{ borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.45 }}>
          <Avatar name={getName(s.from)} color="#3a3a52" size={30} />
          <div style={{ flex: 1 }}>
            <div className="settled" style={{ fontSize: 13 }}>{getName(s.from)} → {getName(s.to)}</div>
            <div className="mono settled" style={{ fontSize: 15, fontWeight: 700 }}>{fmt(s.amount)}</div>
          </div>
          <button
            onClick={() => onToggle(s.id)}
            style={{ background: 'transparent', border: '1px solid #2a2a3a', borderRadius: 7, padding: '6px 10px', fontSize: 11, color: '#6b6b8a', cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}
          >
            Deshacer
          </button>
        </div>
      ))}
    </div>
  )
}
