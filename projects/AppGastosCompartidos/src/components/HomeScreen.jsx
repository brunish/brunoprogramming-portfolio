import { useState } from 'react'
import { Plus, Zap } from 'lucide-react'
import GroupCard from './GroupCard'
import NewGroupModal from './NewGroupModal'
import ConfirmModal from './ConfirmModal'
import { calculateSettlements, fmt } from '../utils'

export default function HomeScreen({ groups, onSelectGroup, onCreateGroup, onDeleteGroup }) {
  const [showNew,  setShowNew]  = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const totalAcrossGroups = groups.reduce((sum, g) => sum + g.expenses.reduce((s, e) => s + e.amount, 0), 0)
  const totalDebts = groups.reduce((sum, g) => sum + calculateSettlements(g.participants, g.expenses).settlements.length, 0)

  const groupToDelete = groups.find(g => g.id === deleteId)

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
          <button
            className="btn-lime"
            onClick={() => setShowNew(true)}
            style={{ borderRadius: 9, padding: '9px 16px', fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> Nuevo grupo
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '24px 16px', maxWidth: 680, width: '100%', margin: '0 auto', paddingBottom: 48 }}>

        {/* Stats globales */}
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

        {/* Lista de grupos / empty state */}
        {groups.length === 0 ? (
          <div className="card animate-scale-in" style={{ borderRadius: 14, padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Sin grupos todavía</div>
            <div style={{ color: '#6b6b8a', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              Creá tu primer grupo para empezar a dividir gastos con amigos, familia o compañeros.
            </div>
            <button
              className="btn-lime"
              onClick={() => setShowNew(true)}
              style={{ padding: '12px 28px', borderRadius: 10, fontSize: 15, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={16} /> Crear primer grupo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, color: '#6b6b8a', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Mis grupos</div>
            {groups.map((g, idx) => (
              <GroupCard
                key={g.id}
                group={g}
                idx={idx}
                onClick={() => onSelectGroup(g.id)}
                onDelete={id => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </main>

      {showNew && <NewGroupModal onSave={onCreateGroup} onClose={() => setShowNew(false)} />}

      {deleteId && (
        <ConfirmModal
          title="¿Eliminar grupo?"
          message={`Se eliminará "${groupToDelete?.name}" con todos sus gastos. Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          onConfirm={() => { onDeleteGroup(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
