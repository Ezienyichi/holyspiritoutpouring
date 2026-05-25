import { useState, useEffect } from 'react'

const CFG = {
  success: { color: '#1D9E75', duration: 4000 },
  error:   { color: '#E24B4A', duration: 6000 },
  warning: { color: '#E8622A', duration: 5000 },
  info:    { color: '#4A90D9', duration: 4000 },
}

const ICONS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2.5" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
}

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false)
  const cfg = CFG[toast.type] || CFG.info

  function dismiss() {
    if (exiting) return
    setExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  useEffect(() => {
    const t = setTimeout(dismiss, cfg.duration)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minWidth: 300, maxWidth: 420,
      background: '#162032',
      borderRadius: 12,
      padding: '16px 20px',
      borderLeft: `4px solid ${cfg.color}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'relative', overflow: 'hidden',
      animation: exiting ? 'toast-out 0.3s ease forwards' : 'toast-in 0.35s ease forwards',
    }}>
      <div style={{ flexShrink: 0 }}>{ICONS[toast.type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: 'white', fontSize: 14, lineHeight: 1.3 }}>{toast.title}</div>
        {toast.message && (
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.4, marginTop: 2 }}>{toast.message}</div>
        )}
      </div>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, flexShrink: 0, display: 'flex' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.15)' }}>
        <div style={{ height: '100%', background: cfg.color, animation: `toast-bar ${cfg.duration}ms linear forwards` }} />
      </div>
    </div>
  )
}

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <>
      <style>{`
        @keyframes toast-in  { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes toast-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
        @keyframes toast-bar { from { width: 100%; } to { width: 0%; } }
      `}</style>
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </>
  )
}
