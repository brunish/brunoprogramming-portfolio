import { useState, useMemo, useCallback } from 'react'
import { Plus, RefreshCw, ChevronLeft, Receipt, Users, Wallet, BarChart2 } from 'lucide-react'
import ExpenseCard from './ExpenseCard'
import ExpenseForm from './ExpenseForm'
import ParticipantManager from './ParticipantManager'
import SettlementPanel from './SettlementPanel'
import SummaryStats from './SummaryStats'
import ConfirmModal from './ConfirmModal'
import { AVATAR_COLORS } from '../constants'
import { calculateSettlements, fmt, uid } from '../utils'

const TABS = [
  { id: 'expenses', label: 'Gastos',   icon: Receipt,   getBadge: g => g.expenses.length },
  { id: 'people',   label: 'Personas', icon: Users,     getBadge: g => g.participants.length },
  { id: 'settle',   label: 'Liquidar', icon: Wallet,    getBadge: (g, pending) => pending || null },
  { id: 'stats',    label: 'Resumen',  icon: BarChart2, getBadge: () => null },
]

export default function GroupView({ group, onUpdate, onBack }) {
  const [activeTab, setActiveTab] = useState('expenses')
  const [showForm,  setShowForm]  = useState(false)
  const [showClear, setShowClear] = useState(false)

  const { settlements, balances } = useMemo(
    () => calculateSettlements(group.participants, group.expenses),
    [group.participants, group.expenses]
  )

  const totalSpent   = useMemo(() => group.expenses.reduce((sum, e) => sum + e.amount, 0), [group.expenses])
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

  const handleClear = () => {
    update({ expenses: [], settledPayments: [] })
    setShowClear(false)
  }

  return (
    <div style={{ minHeight: '100svh', background: '#0a0a0f', color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid #1e1e2a', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onBack}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9999b3', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#9999b3'}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 20 }}>{group.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1 }}>{group.name}</div>
            <div className="mono" style={{ fontSize: 10, color: '#6b6b8a', marginTop: 2 }}>{fmt(totalSpent)} · {group.participants.length} personas</div>
          </div>
          {pendingCount > 0 && (
            <div style={{ background: '#ff5782', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 7px' }}>
              {pendingCount}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 7 }}>
          <button
            onClick={() => setShowClear(true)}
            style={{ background: 'transparent', border: '1px solid #1e1e2a', color: '#9999b3', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'Syne', sans-serif", transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff5782'; e.currentTarget.style.color = '#ff5782' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2a'; e.currentTarget.style.color = '#9999b3' }}
          >
            <RefreshCw size={13} /> Limpiar
          </button>
          <button
            className="btn-lime"
            onClick={() => setShowForm(true)}
            style={{ borderRadius: 8, padding: '8px 14px', fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> Gasto
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 16px', borderBottom: '1px solid #1e1e2a', overflowX: 'auto' }}>
        {TABS.map(tab => {
          const Icon   = tab.icon
          const active = activeTab === tab.id
          const badge  = tab.getBadge(group, pendingCount)
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, cursor: 'pointer', border: '1px solid', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: "'Syne', sans-serif", transition: 'all 0.15s', flexShrink: 0, ...(active ? { background: 'rgba(184,255,87,0.1)', color: '#b8ff57', borderColor: 'rgba(184,255,87,0.3)' } : { background: 'transparent', color: '#6b6b8a', borderColor: 'transparent' }) }}
            >
              <Icon size={14} />{tab.label}
              {badge != null && (
                <span style={{ background: active ? 'rgba(184,255,87,0.2)' : '#1e1e2a', color: active ? '#b8ff57' : '#6b6b8a', borderRadius: 20, fontSize: 11, padding: '1px 6px', fontWeight: 700 }}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <main style={{ flex: 1, padding: '20px 16px', maxWidth: 680, width: '100%', margin: '0 auto', paddingBottom: 48 }}>
        {activeTab === 'expenses' && (
          group.expenses.length === 0
            ? (
              <div className="card animate-scale-in" style={{ borderRadius: 12, padding: 40, textAlign: 'center' }}>
                <Receipt size={36} color="#3a3a52" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sin gastos todavía</div>
                <div style={{ color: '#6b6b8a', fontSize: 13, marginBottom: 20 }}>Agregá el primer gasto del grupo</div>
                <button className="btn-lime" onClick={() => setShowForm(true)} style={{ padding: '11px 22px', borderRadius: 9, fontSize: 14, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <Plus size={15} /> Agregar gasto
                </button>
              </div>
            )
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.expenses.map((e, idx) => (
                  <ExpenseCard key={e.id} expense={e} participants={group.participants} onDelete={deleteExpense} idx={idx} />
                ))}
              </div>
            )
        )}

        {activeTab === 'people' && (
          <ParticipantManager
            participants={group.participants}
            expenses={group.expenses}
            onAdd={addParticipant}
            onRemove={removeParticipant}
          />
        )}

        {activeTab === 'settle' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Liquidación</div>
              <div style={{ color: '#6b6b8a', fontSize: 13 }}>
                {settlements.length === 0
                  ? 'No hay transferencias necesarias.'
                  : `${settlements.length} transferencia${settlements.length !== 1 ? 's' : ''} para saldar todas las cuentas.`
                }
              </div>
            </div>
            <SettlementPanel
              settlements={settlements}
              participants={group.participants}
              settled={group.settledPayments || []}
              onToggle={toggleSettled}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <SummaryStats participants={group.participants} expenses={group.expenses} balances={balances} />
        )}
      </main>

      {showForm  && <ExpenseForm participants={group.participants} onSave={addExpense} onClose={() => setShowForm(false)} />}
      {showClear && (
        <ConfirmModal
          title="¿Limpiar gastos?"
          message="Se eliminarán todos los gastos de este grupo. Los participantes se mantienen."
          confirmLabel="Sí, limpiar"
          onConfirm={handleClear}
          onCancel={() => setShowClear(false)}
        />
      )}
    </div>
  )
}
