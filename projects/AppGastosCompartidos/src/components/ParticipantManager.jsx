import { useState, useRef } from 'react'
import { Users, UserPlus, Trash2 } from 'lucide-react'
import Avatar from './Avatar'
import Badge from './Badge'

export default function ParticipantManager({ participants, expenses, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  const canAdd     = name.trim().length >= 2 && participants.length < 10
  const hasExpense = id => expenses.some(e => e.paidBy === id || e.splitBetween.includes(id))

  const handleAdd = () => {
    if (!canAdd) return
    onAdd(name.trim())
    setName('')
    inputRef.current?.focus()
  }

  return (
    <section className="card" style={{ borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Users size={16} color="#b8ff57" />
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', color: '#9999b3', textTransform: 'uppercase' }}>Participantes</span>
        <Badge color="#6b6b8a">{participants.length}/10</Badge>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          ref={inputRef}
          className="input-base"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nombre del participante…"
          maxLength={20}
          style={{ flex: 1, borderRadius: 8, padding: '9px 12px', fontSize: 14 }}
        />
        <button
          className="btn-lime"
          onClick={handleAdd}
          disabled={!canAdd}
          style={{ borderRadius: 8, padding: '9px 14px', fontSize: 13, border: 'none', display: 'flex', alignItems: 'center', gap: 5, opacity: canAdd ? 1 : 0.4, cursor: canAdd ? 'pointer' : 'not-allowed' }}
        >
          <UserPlus size={15} /> Agregar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {participants.map((p, idx) => (
          <div
            key={p.id}
            className="card-hover animate-slide-right"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #1e1e2a', animationDelay: `${idx * 0.04}s` }}
          >
            <Avatar name={p.name} color={p.color} size={30} />
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.name}</span>
            {hasExpense(p.id)
              ? <Badge color="#6b6b8a">tiene gastos</Badge>
              : participants.length > 2
                ? (
                  <button
                    onClick={() => onRemove(p.id)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3a3a52', padding: 4, borderRadius: 4, display: 'flex', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff5782'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3a3a52'}
                  >
                    <Trash2 size={14} />
                  </button>
                )
                : <span style={{ fontSize: 11, color: '#3a3a52' }}>mín.</span>
            }
          </div>
        ))}
      </div>
    </section>
  )
}
