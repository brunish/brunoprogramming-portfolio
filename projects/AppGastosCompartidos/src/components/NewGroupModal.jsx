import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { AVATAR_COLORS, GROUP_EMOJIS } from '../constants'
import { uid, labelStyle } from '../utils'

export default function NewGroupModal({ onSave, onClose }) {
  const [name,    setName]    = useState('')
  const [emoji,   setEmoji]   = useState('✈️')
  const [members, setMembers] = useState([{ id: uid(), name: '' }, { id: uid(), name: '' }])

  const updateMember = (id, val) => setMembers(ms => ms.map(m => m.id === id ? { ...m, name: val } : m))
  const addMember    = () => members.length < 10 && setMembers(ms => [...ms, { id: uid(), name: '' }])
  const removeMember = id => members.length > 2  && setMembers(ms => ms.filter(m => m.id !== id))

  const validMembers = members.filter(m => m.name.trim().length >= 1)
  const isValid = name.trim().length >= 2 && validMembers.length >= 2

  const handleSave = () => {
    if (!isValid) return
    onSave({
      id: uid(),
      name: name.trim(),
      emoji,
      participants: validMembers.map((m, i) => ({
        id: uid(),
        name: m.name.trim(),
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      })),
      expenses: [],
      settledPayments: [],
    })
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
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
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: 40, height: 40, borderRadius: 8, fontSize: 20, cursor: 'pointer', border: '1px solid',
                  background:   emoji === e ? 'rgba(184,255,87,0.12)' : '#0d0d15',
                  borderColor:  emoji === e ? 'rgba(184,255,87,0.4)'  : '#1e1e2a',
                  transition: 'all 0.12s',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Group name */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Nombre del grupo</label>
          <input
            className="input-base"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Viaje a Bariloche, Depto compartido…"
            maxLength={40}
            style={{ width: '100%', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
          />
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
                <input
                  className="input-base"
                  value={m.name}
                  onChange={e => updateMember(m.id, e.target.value)}
                  placeholder={`Participante ${i + 1}`}
                  maxLength={20}
                  style={{ flex: 1, borderRadius: 8, padding: '8px 11px', fontSize: 14 }}
                />
                {members.length > 2 && (
                  <button
                    onClick={() => removeMember(m.id)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3a3a52', padding: 4, display: 'flex', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff5782'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3a3a52'}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {members.length < 10 && (
            <button
              onClick={addMember}
              style={{ marginTop: 8, background: 'transparent', border: '1px dashed #2a2a3a', color: '#6b6b8a', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Syne', sans-serif", transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8ff57'; e.currentTarget.style.color = '#b8ff57' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.color = '#6b6b8a' }}
            >
              <Plus size={13} /> Agregar participante
            </button>
          )}
        </div>

        <button
          className="btn-lime"
          onClick={handleSave}
          disabled={!isValid}
          style={{ width: '100%', padding: 13, borderRadius: 10, fontSize: 15, border: 'none', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Plus size={16} /> Crear grupo
        </button>
      </div>
    </div>
  )
}
