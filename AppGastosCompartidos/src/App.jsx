// SPLITR — Multi-group expense splitter
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Plus, Trash2, Check, X, Users, Receipt, BarChart2,
  ArrowRight, RefreshCw, Utensils, Car, Home, Film,
  Tag, ChevronDown, UserPlus, Wallet, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Zap, ChevronLeft, FolderOpen,
} from 'lucide-react'
import './index.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'food',          label: 'Comida',      icon: Utensils, color: '#ff9f57' },
  { id: 'transport',     label: 'Transporte',  icon: Car,      color: '#57c8ff' },
  { id: 'accommodation', label: 'Alojamiento', icon: Home,     color: '#b8ff57' },
  { id: 'entertainment', label: 'Entretenim.', icon: Film,     color: '#c457ff' },
  { id: 'other',         label: 'Otro',        icon: Tag,      color: '#ff5782' },
]

const AVATAR_COLORS = [
  '#b8ff57','#57c8ff','#ff9f57','#c457ff','#ff5782',
  '#57ffb8','#ffdb57','#ff57c8','#57a0ff','#ff7a57',
]

const DEMO_GROUP = {
  id: 'g1',
  name: 'Viaje a Bariloche',
  emoji: '🏔️',
  settledPayments: [],
  participants: [
    { id: 'p1', name: 'Ana',    color: AVATAR_COLORS[0] },
    { id: 'p2', name: 'Carlos', color: AVATAR_COLORS[1] },
    { id: 'p3', name: 'Lucía',  color: AVATAR_COLORS[2] },
    { id: 'p4', name: 'Martín', color: AVATAR_COLORS[3] },
  ],
  expenses: [
    { id:'e1', description:'Hotel',           amount:1200, paidBy:'p1', splitBetween:['p1','p2','p3','p4'], date:'2024-03-15', category:'accommodation' },
    { id:'e2', description:'Cena del viernes',amount:480,  paidBy:'p2', splitBetween:['p1','p2','p3','p4'], date:'2024-03-15', category:'food' },
    { id:'e3', description:'Nafta ida',        amount:320,  paidBy:'p3', splitBetween:['p1','p2','p3'],      date:'2024-03-16', category:'transport' },
    { id:'e4', description:'Entradas cine',    amount:150,  paidBy:'p4', splitBetween:['p4','p1'],           date:'2024-03-16', category:'entertainment' },
    { id:'e5', description:'Desayunos',        amount:200,  paidBy:'p1', splitBetween:['p1','p2','p3','p4'], date:'2024-03-17', category:'food' },
  ],
}

const GROUP_EMOJIS = ['✈️','🏖️','🏔️','🎉','🍕','🏠','🚗','🎮','🎵','💼','🌍','🎓']

// ─── Algorithm ────────────────────────────────────────────────────────────────

function calculateSettlements(participants, expenses) {
  const balances = {}
  participants.forEach(p => { balances[p.id] = 0 })
  expenses.forEach(expense => {
    if (!expense.splitBetween.length) return
    const perPerson = expense.amount / expense.splitBetween.length
    balances[expense.paidBy] += expense.amount
    expense.splitBetween.forEach(id => { balances[id] -= perPerson })
  })
  const creditors = [], debtors = []
  Object.entries(balances).forEach(([id, bal]) => {
    if (bal >  0.01) creditors.push({ id, amount:  bal })
    if (bal < -0.01) debtors.push(  { id, amount: -bal })
  })
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort(  (a, b) => b.amount - a.amount)
  const settlements = []
  let i = 0, j = 0
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].amount, debtors[j].amount)
    settlements.push({ id: `${debtors[j].id}->${creditors[i].id}`, from: debtors[j].id, to: creditors[i].id, amount: Math.round(amount * 100) / 100 })
    creditors[i].amount -= amount
    debtors[j].amount   -= amount
    if (creditors[i].amount < 0.01) i++
    if (debtors[j].amount   < 0.01) j++
  }
  return { settlements, balances }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt    = n => `$${Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const today  = () => new Date().toISOString().split('T')[0]
const uid    = () => Math.random().toString(36).slice(2, 10)
const getCat = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[4]
const labelStyle = { fontSize: 11, color: '#6b6b8a', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6 }

// ─── Shared components ────────────────────────────────────────────────────────

function Avatar({ name, color, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{ width: size, height: size, borderRadius: 6, background: color + '22', border: `1.5px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function Badge({ children, color = '#b8ff57' }) {
  return (
    <span style={{ background: color + '18', color, border: `1px solid ${color}44`, borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>
      {children}
    </span>
  )
}

// ─── GroupCard (home screen) ───────────────────────────────────────────────────

function GroupCard({ group, onClick, onDelete, idx }) {
  const total    = group.expenses.reduce((s, e) => s + e.amount, 0)
  const { settlements } = calculateSettlements(group.participants, group.expenses)
  const pending  = settlements.length

  return (
    <div
      onClick={onClick}
      className="card card-hover animate-slide-up"
      style={{ borderRadius: 12, padding: '16px 18px', cursor: 'pointer', animationDelay: `${idx * 0.06}s` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Emoji */}
        <div style={{ width: 46, height: 46, borderRadius: 10, background: '#1e1e2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {group.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{group.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Avatars */}
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
          {pending > 0
            ? <Badge color="#ff5782">{pending} deuda{pending !== 1 ? 's' : ''}</Badge>
            : group.expenses.length > 0
              ? <Badge color="#b8ff57">saldado ✓</Badge>
              : <span style={{ fontSize: 11, color: '#3a3a52' }}>sin gastos</span>
          }
        </div>
      </div>

      {/* Delete button */}
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

// ─── NewGroupModal ────────────────────────────────────────────────────────────

function NewGroupModal({ onSave, onClose }) {
  const [name,    setName]    = useState('')
  const [emoji,   setEmoji]   = useState('✈️')
  const [members, setMembers] = useState([{ id: uid(), name: '' }, { id: uid(), name: '' }])

  const updateMember = (id, val) => setMembers(ms => ms.map(m => m.id === id ? { ...m, name: val } : m))
  const addMember    = () => members.length < 10 && setMembers(ms => [...ms, { id: uid(), name: '' }])
  const removeMember = id => members.length > 2 && setMembers(ms => ms.filter(m => m.id !== id))

  const validMembers = members.filter(m => m.name.trim().length >= 1)
  const valid = name.trim().length >= 2 && validMembers.length >= 2

  const handleSave = () => {
    if (!valid) return
    onSave({
      id: uid(),
      name: name.trim(),
      emoji,
      participants: validMembers.map((m, i) => ({
        id: uid(), name: m.name.trim(), color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      })),
      expenses: [],
      settledPayments: [],
    })
    onClose()
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 520, background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '16px 16px 0 0', padding: 24, paddingBottom: 36, maxHeight: '90svh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Nuevo grupo</div>
            <div style={{ color: '#6b6b8a', fontSize: 12, marginTop: 2 }}>Creá un grupo para dividir gastos</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #1e1e2a', color: '#9999b3', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        {/* Emoji picker */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Ícono</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {GROUP_EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 40, height: 40, borderRadius: 8, fontSize: 20, cursor: 'pointer', border: '1px solid',
                background: emoji === e ? 'rgba(184,255,87,0.12)' : '#0d0d15',
                borderColor: emoji === e ? 'rgba(184,255,87,0.4)' : '#1e1e2a',
                transition: 'all 0.12s',
              }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Group name */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Nombre del grupo</label>
          <input className="input-base" value={name} onChange={e => setName(e.target.value)}
            placeholder="Ej: Viaje a Bariloche, Depto compartido…"
            maxLength={40}
            style={{ width: '100%', borderRadius: 8, padding: '10px 12px', fontSize: 14 }} />
        </div>

        {/* Members */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Participantes</label>
            <span style={{ fontSize: 11, color: '#3a3a52' }}>{members.length}/10</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {members.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: AVATAR_COLORS[i % AVATAR_COLORS.length] + '22', border: `1.5px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: AVATAR_COLORS[i % AVATAR_COLORS.length], flexShrink: 0 }}>
                  {m.name ? m.name[0].toUpperCase() : (i + 1)}
                </div>
                <input className="input-base" value={m.name} onChange={e => updateMember(m.id, e.target.value)}
                  placeholder={`Participante ${i + 1}`} maxLength={20}
                  style={{ flex: 1, borderRadius: 8, padding: '8px 11px', fontSize: 14 }} />
                {members.length > 2 && (
                  <button onClick={() => removeMember(m.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3a3a52', padding: 4, display: 'flex', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff5782'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3a3a52'}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {members.length < 10 && (
            <button onClick={addMember} style={{
              marginTop: 8, background: 'transparent', border: '1px dashed #2a2a3a', color: '#6b6b8a',
              borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: "'Syne', sans-serif", transition: 'border-color 0.15s, color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8ff57'; e.currentTarget.style.color = '#b8ff57' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.color = '#6b6b8a' }}>
              <Plus size={13} /> Agregar participante
            </button>
          )}
        </div>

        <button className="btn-lime" onClick={handleSave} disabled={!valid} style={{
          width: '100%', padding: 13, borderRadius: 10, fontSize: 15, border: 'none',
          cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Plus size={16} /> Crear grupo
        </button>
      </div>
    </div>
  )
}

// ─── ParticipantManager ───────────────────────────────────────────────────────

function ParticipantManager({ participants, expenses, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)
  const canAdd     = name.trim().length >= 2 && participants.length < 10
  const hasExpense = id => expenses.some(e => e.paidBy === id || e.splitBetween.includes(id))
  const handleAdd  = () => { if (!canAdd) return; onAdd(name.trim()); setName(''); inputRef.current?.focus() }

  return (
    <section className="card" style={{ borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Users size={16} color="#b8ff57" />
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', color: '#9999b3', textTransform: 'uppercase' }}>Participantes</span>
        <Badge color="#6b6b8a">{participants.length}/10</Badge>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input ref={inputRef} className="input-base" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Nombre del participante…" maxLength={20}
          style={{ flex: 1, borderRadius: 8, padding: '9px 12px', fontSize: 14 }} />
        <button className="btn-lime" onClick={handleAdd} disabled={!canAdd} style={{ borderRadius: 8, padding: '9px 14px', fontSize: 13, border: 'none', display: 'flex', alignItems: 'center', gap: 5, opacity: canAdd ? 1 : 0.4, cursor: canAdd ? 'pointer' : 'not-allowed' }}>
          <UserPlus size={15} /> Agregar
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {participants.map((p, idx) => (
          <div key={p.id} className="card-hover animate-slide-right"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #1e1e2a', animationDelay: `${idx * 0.04}s` }}>
            <Avatar name={p.name} color={p.color} size={30} />
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.name}</span>
            {hasExpense(p.id)
              ? <Badge color="#6b6b8a">tiene gastos</Badge>
              : participants.length > 2
                ? <button onClick={() => onRemove(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3a3a52', padding: 4, borderRadius: 4, display: 'flex', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff5782'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3a3a52'}>
                    <Trash2 size={14} />
                  </button>
                : <span style={{ fontSize: 11, color: '#3a3a52' }}>mín.</span>
            }
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── ExpenseForm ──────────────────────────────────────────────────────────────

function ExpenseForm({ participants, onSave, onClose }) {
  const [form, setForm] = useState({ description: '', amount: '', paidBy: participants[0]?.id || '', splitBetween: participants.map(p => p.id), date: today(), category: 'food' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const togglePerson = id => set('splitBetween', form.splitBetween.includes(id) ? form.splitBetween.filter(x => x !== id) : [...form.splitBetween, id])
  const perPerson = form.splitBetween.length > 0 && form.amount ? parseFloat(form.amount) / form.splitBetween.length : 0
  const valid = form.description.trim() && parseFloat(form.amount) > 0 && form.paidBy && form.splitBetween.length > 0
  const handleSave = () => { if (!valid) return; onSave({ id: uid(), description: form.description.trim(), amount: parseFloat(form.amount), paidBy: form.paidBy, splitBetween: form.splitBetween, date: form.date, category: form.category }); onClose() }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 520, background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '16px 16px 0 0', padding: 24, paddingBottom: 36, maxHeight: '92svh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Nuevo gasto</div>
            <div style={{ color: '#6b6b8a', fontSize: 12, marginTop: 2 }}>Completá los detalles</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #1e1e2a', color: '#9999b3', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Descripción</label>
            <input className="input-base" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Cena, Hotel…" style={{ width: '100%', borderRadius: 8, padding: '10px 12px', fontSize: 14 }} />
          </div>
          <div>
            <label style={labelStyle}>Monto</label>
            <div style={{ position: 'relative' }}>
              <span className="mono" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#6b6b8a', fontSize: 14 }}>$</span>
              <input className="input-base mono" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" style={{ width: '100%', borderRadius: 8, padding: '10px 12px 10px 24px', fontSize: 14 }} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Categoría</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => { const Icon = cat.icon; const sel = form.category === cat.id; return (
              <button key={cat.id} onClick={() => set('category', cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 7, cursor: 'pointer', border: '1px solid', fontSize: 12, fontWeight: 600, fontFamily: "'Syne', sans-serif", background: sel ? cat.color + '18' : 'transparent', color: sel ? cat.color : '#6b6b8a', borderColor: sel ? cat.color + '55' : '#1e1e2a', transition: 'all 0.12s' }}>
                <Icon size={13} />{cat.label}
              </button>
            )})}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Pagó</label>
            <div style={{ position: 'relative' }}>
              <select className="input-base" value={form.paidBy} onChange={e => set('paidBy', e.target.value)} style={{ width: '100%', borderRadius: 8, padding: '10px 32px 10px 12px', fontSize: 14, appearance: 'none', cursor: 'pointer' }}>
                {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={14} color="#6b6b8a" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input className="input-base" type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ width: '100%', borderRadius: 8, padding: '10px 12px', fontSize: 14, colorScheme: 'dark' }} />
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Dividir entre</label>
            {perPerson > 0 && <span className="mono" style={{ fontSize: 11, color: '#b8ff57' }}>{fmt(perPerson)} c/u</span>}
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {participants.map(p => { const sel = form.splitBetween.includes(p.id); return (
              <button key={p.id} onClick={() => togglePerson(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 7, cursor: 'pointer', border: '1px solid', fontSize: 13, fontWeight: 600, fontFamily: "'Syne', sans-serif", background: sel ? p.color + '15' : 'transparent', borderColor: sel ? p.color + '55' : '#1e1e2a', color: sel ? p.color : '#6b6b8a', transition: 'all 0.15s' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${sel ? p.color : '#3a3a52'}`, background: sel ? p.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                  {sel && <Check size={10} color="#0a0a0f" strokeWidth={3} />}
                </div>
                {p.name}
              </button>
            )})}
          </div>
          {form.splitBetween.length === 0 && <p style={{ fontSize: 12, color: '#ff5782', marginTop: 6 }}>Seleccioná al menos una persona</p>}
        </div>

        <button className="btn-lime" onClick={handleSave} disabled={!valid} style={{ width: '100%', padding: 13, borderRadius: 10, fontSize: 15, border: 'none', cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Plus size={16} /> Agregar gasto
        </button>
      </div>
    </div>
  )
}

// ─── ExpenseCard ──────────────────────────────────────────────────────────────

function ExpenseCard({ expense, participants, onDelete, idx }) {
  const payer      = participants.find(p => p.id === expense.paidBy)
  const cat        = getCat(expense.category)
  const Icon       = cat.icon
  const splitNames = expense.splitBetween.map(id => participants.find(p => p.id === id)?.name).filter(Boolean)
  const perPerson  = expense.amount / expense.splitBetween.length
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
          {payer && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Avatar name={payer.name} color={payer.color} size={18} /><span style={{ fontSize: 12, color: '#9999b3' }}>{payer.name} pagó</span></div>}
          <span style={{ fontSize: 11, color: '#3a3a52' }}>·</span>
          <span style={{ fontSize: 11, color: '#6b6b8a' }}>entre {splitNames.slice(0, 3).join(', ')}{splitNames.length > 3 ? ` +${splitNames.length - 3}` : ''}</span>
        </div>
      </div>
      <button onClick={() => onDelete(expense.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2a2a3a', padding: 4, borderRadius: 4, flexShrink: 0, display: 'flex', transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ff5782'}
        onMouseLeave={e => e.currentTarget.style.color = '#2a2a3a'}>
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// ─── SettlementPanel ──────────────────────────────────────────────────────────

function SettlementPanel({ settlements, participants, settled, onToggle }) {
  const getName  = id => participants.find(p => p.id === id)?.name || id
  const getColor = id => participants.find(p => p.id === id)?.color || '#fff'
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
          <button className="btn-lime" onClick={() => onToggle(s.id)} style={{ border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 12, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
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
          <button onClick={() => onToggle(s.id)} style={{ background: 'transparent', border: '1px solid #2a2a3a', borderRadius: 7, padding: '6px 10px', fontSize: 11, color: '#6b6b8a', cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}>
            Deshacer
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── SummaryStats ─────────────────────────────────────────────────────────────

function SummaryStats({ participants, expenses, balances }) {
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const spentByPerson = useMemo(() => { const m = {}; participants.forEach(p => { m[p.id] = 0 }); expenses.forEach(e => { m[e.paidBy] = (m[e.paidBy] || 0) + e.amount }); return m }, [participants, expenses])
  const maxSpent = Math.max(...Object.values(spentByPerson), 1)
  const sorted   = [...participants].sort((a, b) => (spentByPerson[b.id] || 0) - (spentByPerson[a.id] || 0))
  const catTotals = useMemo(() => { const m = {}; CATEGORIES.forEach(c => { m[c.id] = 0 }); expenses.forEach(e => { m[e.category] = (m[e.category] || 0) + e.amount }); return m }, [expenses])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card animate-scale-in" style={{ borderRadius: 12, padding: '20px 22px', background: 'linear-gradient(135deg, rgba(184,255,87,0.06) 0%, transparent 60%)', borderColor: 'rgba(184,255,87,0.15)' }}>
        <div style={{ fontSize: 12, color: '#9999b3', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Total del grupo</div>
        <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#b8ff57', lineHeight: 1 }}>{fmt(totalSpent)}</div>
        <div style={{ color: '#6b6b8a', fontSize: 12, marginTop: 6 }}>{expenses.length} gasto{expenses.length !== 1 ? 's' : ''} · {participants.length} personas</div>
      </div>
      <div className="card" style={{ borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#6b6b8a', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 14 }}>Balance por persona</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((p, idx) => {
            const spent = spentByPerson[p.id] || 0
            const bal   = balances[p.id] ?? 0
            const pct   = (spent / maxSpent) * 100
            const isC = bal >  0.01, isD = bal < -0.01
            return (
              <div key={p.id} className="animate-slide-right" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <Avatar name={p.name} color={p.color} size={26} />
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: '#9999b3' }}>pagó {fmt(spent)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 86, justifyContent: 'flex-end' }}>
                    {isC && <TrendingUp  size={12} color="#b8ff57" />}
                    {isD && <TrendingDown size={12} color="#ff5782" />}
                    {!isC && !isD && <CheckCircle2 size={12} color="#57c8ff" />}
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: isC ? '#b8ff57' : isD ? '#ff5782' : '#57c8ff' }}>
                      {!isC && !isD ? 'al día ✓' : `${isC ? '+' : ''}${fmt(bal)}`}
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
      <div className="card" style={{ borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#6b6b8a', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 14 }}>Por categoría</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CATEGORIES.filter(c => catTotals[c.id] > 0).sort((a, b) => catTotals[b.id] - catTotals[a.id]).map(cat => {
            const Icon = cat.icon; const amt = catTotals[cat.id]; const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0
            return (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={13} color={cat.color} /></div>
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

// ─── ConfirmModal (reutilizable) ──────────────────────────────────────────────

function ConfirmModal({ title, message, confirmLabel, confirmColor = '#ff5782', onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="animate-scale-in" style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 14, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <AlertCircle size={36} color={confirmColor} style={{ margin: '0 auto 14px' }} />
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{title}</div>
        <div style={{ color: '#6b6b8a', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 11, borderRadius: 9, cursor: 'pointer', fontSize: 14, background: 'transparent', border: '1px solid #1e1e2a', color: '#9999b3', fontFamily: "'Syne', sans-serif" }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 11, borderRadius: 9, cursor: 'pointer', fontSize: 14, background: confirmColor, color: '#fff', border: 'none', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── GroupView (detail screen) ────────────────────────────────────────────────

function GroupView({ group, onUpdate, onBack, onDelete }) {
  const [activeTab, setActiveTab] = useState('expenses')
  const [showForm,  setShowForm]  = useState(false)
  const [showClear, setShowClear] = useState(false)

  const { settlements, balances } = useMemo(
    () => calculateSettlements(group.participants, group.expenses),
    [group.participants, group.expenses]
  )

  const totalSpent  = useMemo(() => group.expenses.reduce((s, e) => s + e.amount, 0), [group.expenses])
  const pendingCount = settlements.length

  const update = useCallback(patch => onUpdate({ ...group, ...patch }), [group, onUpdate])

  const addParticipant = useCallback(name => {
    const color = AVATAR_COLORS[group.participants.length % AVATAR_COLORS.length]
    update({ participants: [...group.participants, { id: uid(), name, color }] })
  }, [group.participants, update])

  const removeParticipant = useCallback(id => update({ participants: group.participants.filter(p => p.id !== id) }), [group.participants, update])
  const addExpense        = useCallback(exp => update({ expenses: [exp, ...group.expenses] }), [group.expenses, update])
  const deleteExpense     = useCallback(id  => update({ expenses: group.expenses.filter(e => e.id !== id) }), [group.expenses, update])

  const toggleSettled = useCallback(id => {
    const current = group.settledPayments || []
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    update({ settledPayments: next })
  }, [group.settledPayments, update])

  // Limpiar: vacía gastos y también los pagos saldados
  const handleClear = () => { update({ expenses: [], settledPayments: [] }); setShowClear(false) }

  const tabs = [
    { id: 'expenses', label: 'Gastos',   icon: Receipt,  badge: group.expenses.length },
    { id: 'people',   label: 'Personas', icon: Users,    badge: group.participants.length },
    { id: 'settle',   label: 'Liquidar', icon: Wallet,   badge: pendingCount || null },
    { id: 'stats',    label: 'Resumen',  icon: BarChart2, badge: null },
  ]

  return (
    <div style={{ minHeight: '100svh', background: '#0a0a0f', color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid #1e1e2a', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9999b3', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#9999b3'}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 20 }}>{group.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1 }}>{group.name}</div>
            <div className="mono" style={{ fontSize: 10, color: '#6b6b8a', marginTop: 2 }}>{fmt(totalSpent)} · {group.participants.length} personas</div>
          </div>
          {pendingCount > 0 && <div style={{ background: '#ff5782', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 7px' }}>{pendingCount}</div>}
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={() => setShowClear(true)} style={{ background: 'transparent', border: '1px solid #1e1e2a', color: '#9999b3', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'Syne', sans-serif", transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff5782'; e.currentTarget.style.color = '#ff5782' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2a'; e.currentTarget.style.color = '#9999b3' }}>
            <RefreshCw size={13} /> Limpiar
          </button>
          <button className="btn-lime" onClick={() => setShowForm(true)} style={{ borderRadius: 8, padding: '8px 14px', fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> Gasto
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 16px', borderBottom: '1px solid #1e1e2a', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const Icon = tab.icon; const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, cursor: 'pointer', border: '1px solid', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: "'Syne', sans-serif", transition: 'all 0.15s', flexShrink: 0, ...(active ? { background: 'rgba(184,255,87,0.1)', color: '#b8ff57', borderColor: 'rgba(184,255,87,0.3)' } : { background: 'transparent', color: '#6b6b8a', borderColor: 'transparent' }) }}>
              <Icon size={14} />{tab.label}
              {tab.badge != null && <span style={{ background: active ? 'rgba(184,255,87,0.2)' : '#1e1e2a', color: active ? '#b8ff57' : '#6b6b8a', borderRadius: 20, fontSize: 11, padding: '1px 6px', fontWeight: 700 }}>{tab.badge}</span>}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <main style={{ flex: 1, padding: '20px 16px', maxWidth: 680, width: '100%', margin: '0 auto', paddingBottom: 48 }}>
        {activeTab === 'expenses' && (
          group.expenses.length === 0
            ? <div className="card animate-scale-in" style={{ borderRadius: 12, padding: 40, textAlign: 'center' }}>
                <Receipt size={36} color="#3a3a52" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sin gastos todavía</div>
                <div style={{ color: '#6b6b8a', fontSize: 13, marginBottom: 20 }}>Agregá el primer gasto del grupo</div>
                <button className="btn-lime" onClick={() => setShowForm(true)} style={{ padding: '11px 22px', borderRadius: 9, fontSize: 14, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <Plus size={15} /> Agregar gasto
                </button>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.expenses.map((e, idx) => <ExpenseCard key={e.id} expense={e} participants={group.participants} onDelete={deleteExpense} idx={idx} />)}
              </div>
        )}
        {activeTab === 'people' && <ParticipantManager participants={group.participants} expenses={group.expenses} onAdd={addParticipant} onRemove={removeParticipant} />}
        {activeTab === 'settle' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Liquidación</div>
              <div style={{ color: '#6b6b8a', fontSize: 13 }}>{settlements.length === 0 ? 'No hay transferencias necesarias.' : `${settlements.length} transferencia${settlements.length !== 1 ? 's' : ''} para saldar todas las cuentas.`}</div>
            </div>
            <SettlementPanel settlements={settlements} participants={group.participants} settled={group.settledPayments || []} onToggle={toggleSettled} />
          </div>
        )}
        {activeTab === 'stats' && <SummaryStats participants={group.participants} expenses={group.expenses} balances={balances} />}
      </main>

      {showForm  && <ExpenseForm participants={group.participants} onSave={addExpense} onClose={() => setShowForm(false)} />}
      {showClear && <ConfirmModal title="¿Limpiar gastos?" message="Se eliminarán todos los gastos de este grupo. Los participantes se mantienen." confirmLabel="Sí, limpiar" onConfirm={handleClear} onCancel={() => setShowClear(false)} />}
    </div>
  )
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

function HomeScreen({ groups, onSelectGroup, onCreateGroup, onDeleteGroup }) {
  const [showNew,   setShowNew]   = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)

  const totalAcrossGroups = groups.reduce((s, g) => s + g.expenses.reduce((ss, e) => ss + e.amount, 0), 0)
  const totalDebts = groups.reduce((s, g) => s + calculateSettlements(g.participants, g.expenses).settlements.length, 0)

  return (
    <div style={{ minHeight: '100svh', background: '#0a0a0f', color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e2a', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 680, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#b8ff57', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#0a0a0f" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>Splitr</div>
              <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 1 }}>Dividí gastos en grupo</div>
            </div>
          </div>
          <button className="btn-lime" onClick={() => setShowNew(true)} style={{ borderRadius: 9, padding: '9px 16px', fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> Nuevo grupo
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '24px 16px', maxWidth: 680, width: '100%', margin: '0 auto', paddingBottom: 48 }}>

        {/* Global stats */}
        {groups.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            <div className="card" style={{ borderRadius: 11, padding: '14px 16px', background: 'linear-gradient(135deg, rgba(184,255,87,0.06) 0%, transparent 60%)', borderColor: 'rgba(184,255,87,0.12)' }}>
              <div style={{ fontSize: 11, color: '#9999b3', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Total gastado</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#b8ff57' }}>{fmt(totalAcrossGroups)}</div>
              <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{groups.length} grupo{groups.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="card" style={{ borderRadius: 11, padding: '14px 16px', background: totalDebts > 0 ? 'rgba(255,87,130,0.04)' : 'rgba(184,255,87,0.04)', borderColor: totalDebts > 0 ? 'rgba(255,87,130,0.12)' : 'rgba(184,255,87,0.12)' }}>
              <div style={{ fontSize: 11, color: '#9999b3', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Deudas activas</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: totalDebts > 0 ? '#ff5782' : '#b8ff57' }}>{totalDebts}</div>
              <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{totalDebts === 0 ? 'todo saldado ✓' : 'pendiente de pago'}</div>
            </div>
          </div>
        )}

        {/* Groups */}
        {groups.length === 0 ? (
          <div className="card animate-scale-in" style={{ borderRadius: 14, padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Sin grupos todavía</div>
            <div style={{ color: '#6b6b8a', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Creá tu primer grupo para empezar a dividir gastos con amigos, familia o compañeros.</div>
            <button className="btn-lime" onClick={() => setShowNew(true)} style={{ padding: '12px 28px', borderRadius: 10, fontSize: 15, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Crear primer grupo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, color: '#6b6b8a', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Mis grupos</div>
            {groups.map((g, idx) => (
              <GroupCard key={g.id} group={g} idx={idx} onClick={() => onSelectGroup(g.id)} onDelete={id => setDeleteId(id)} />
            ))}
          </div>
        )}
      </main>

      {showNew && <NewGroupModal onSave={onCreateGroup} onClose={() => setShowNew(false)} />}
      {deleteId && (
        <ConfirmModal
          title="¿Eliminar grupo?"
          message={`Se eliminará "${groups.find(g => g.id === deleteId)?.name}" con todos sus gastos. Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => { onDeleteGroup(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

// ─── Persistencia ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'splitr_v1'

function loadGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* datos corruptos → ignorar */ }
  return [DEMO_GROUP]
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [groups,        setGroups]       = useState(loadGroups)
  const [activeGroupId, setActiveGroupId] = useState(null)

  // Guardar en localStorage cada vez que cambian los grupos
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(groups)) } catch { /* cuota excedida → ignorar */ }
  }, [groups])

  const activeGroup = groups.find(g => g.id === activeGroupId)

  const createGroup = useCallback(group => setGroups(prev => [group, ...prev]), [])
  const deleteGroup = useCallback(id    => setGroups(prev => prev.filter(g => g.id !== id)), [])
  const updateGroup = useCallback(group => setGroups(prev => prev.map(g => g.id === group.id ? group : g)), [])

  if (activeGroup) {
    return <GroupView group={activeGroup} onUpdate={updateGroup} onBack={() => setActiveGroupId(null)} onDelete={() => { deleteGroup(activeGroup.id); setActiveGroupId(null) }} />
  }

  return <HomeScreen groups={groups} onSelectGroup={setActiveGroupId} onCreateGroup={createGroup} onDeleteGroup={deleteGroup} />
}
