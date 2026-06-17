import { AlertCircle } from 'lucide-react'

export default function ConfirmModal({ title, message, confirmLabel, confirmColor = '#ff5782', onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="animate-scale-in" style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 14, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <AlertCircle size={36} color={confirmColor} style={{ margin: '0 auto 14px' }} />
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{title}</div>
        <div style={{ color: '#6b6b8a', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 11, borderRadius: 9, cursor: 'pointer', fontSize: 14, background: 'transparent', border: '1px solid #1e1e2a', color: '#9999b3', fontFamily: "'Syne', sans-serif" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 11, borderRadius: 9, cursor: 'pointer', fontSize: 14, background: confirmColor, color: '#fff', border: 'none', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
