import { useState } from 'react'
import { Plus, X, Check, ChevronDown } from 'lucide-react'
import { CATEGORIES } from '../constants'
import { uid, today, labelStyle, fmt } from '../utils'

export default function ExpenseForm({ participants, onSave, onClose }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    paidBy: participants[0]?.id || '',
    splitBetween: participants.map(p => p.id),
    date: today(),
    category: 'food',
  })

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const togglePerson = id => set(
    'splitBetween',
    form.splitBetween.includes(id)
      ? form.splitBetween.filter(x => x !== id)
      : [...form.splitBetween, id]
  )

  const perPerson = form.splitBetween.length > 0 && form.amount
    ? parseFloat(form.amount) / form.splitBetween.length
    : 0

  const isValid = form.description.trim() && parseFloat(form.amount) > 0 && form.paidBy && form.splitBetween.length > 0

  const handleSave = () => {
    if (!isValid) return
    onSave({
      id: uid(),
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      paidBy: form.paidBy,
      splitBetween: form.splitBetween,
      date: form.date,
      category: form.category,
    })
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 520, background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '16px 16px 0 0', padding: 24, paddingBottom: 36, maxHeight: '92svh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Nuevo gasto</div>
            <div style={{ color: '#6b6b8a', fontSize: 12, marginTop: 2 }}>Completá los detalles</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #1e1e2a', color: '#9999b3', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        {/* Descripción y monto */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Descripción</label>
            <input
              className="input-base"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Ej: Cena, Hotel…"
              style={{ width: '100%', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={labelStyle}>Monto</label>
            <div style={{ position: 'relative' }}>
              <span className="mono" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#6b6b8a', fontSize: 14 }}>$</span>
              <input
                className="input-base mono"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder="0.00"
                style={{ width: '100%', borderRadius: 8, padding: '10px 12px 10px 24px', fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        {/* Categoría */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Categoría</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              const selected = form.category === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => set('category', cat.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 7, cursor: 'pointer', border: '1px solid', fontSize: 12, fontWeight: 600, fontFamily: "'Syne', sans-serif", background: selected ? cat.color + '18' : 'transparent', color: selected ? cat.color : '#6b6b8a', borderColor: selected ? cat.color + '55' : '#1e1e2a', transition: 'all 0.12s' }}
                >
                  <Icon size={13} />{cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Pagó y fecha */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Pagó</label>
            <div style={{ position: 'relative' }}>
              <select
                className="input-base"
                value={form.paidBy}
                onChange={e => set('paidBy', e.target.value)}
                style={{ width: '100%', borderRadius: 8, padding: '10px 32px 10px 12px', fontSize: 14, appearance: 'none', cursor: 'pointer' }}
              >
                {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={14} color="#6b6b8a" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input
              className="input-base"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              style={{ width: '100%', borderRadius: 8, padding: '10px 12px', fontSize: 14, colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Dividir entre */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Dividir entre</label>
            {perPerson > 0 && <span className="mono" style={{ fontSize: 11, color: '#b8ff57' }}>{fmt(perPerson)} c/u</span>}
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {participants.map(p => {
              const selected = form.splitBetween.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => togglePerson(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 7, cursor: 'pointer', border: '1px solid', fontSize: 13, fontWeight: 600, fontFamily: "'Syne', sans-serif", background: selected ? p.color + '15' : 'transparent', borderColor: selected ? p.color + '55' : '#1e1e2a', color: selected ? p.color : '#6b6b8a', transition: 'all 0.15s' }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${selected ? p.color : '#3a3a52'}`, background: selected ? p.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {selected && <Check size={10} color="#0a0a0f" strokeWidth={3} />}
                  </div>
                  {p.name}
                </button>
              )
            })}
          </div>
          {form.splitBetween.length === 0 && (
            <p style={{ fontSize: 12, color: '#ff5782', marginTop: 6 }}>Seleccioná al menos una persona</p>
          )}
        </div>

        <button
          className="btn-lime"
          onClick={handleSave}
          disabled={!isValid}
          style={{ width: '100%', padding: 13, borderRadius: 10, fontSize: 15, border: 'none', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Plus size={16} /> Agregar gasto
        </button>
      </div>
    </div>
  )
}
