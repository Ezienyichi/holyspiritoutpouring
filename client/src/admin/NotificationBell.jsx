import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../context/ToastContext'

const TYPE_COLOR = { success: '#1D9E75', error: '#E24B4A', warning: '#E8622A', info: '#4A90D9' }

function NotifIcon({ type, size = 14 }) {
  const c = TYPE_COLOR[type] || TYPE_COLOR.info
  if (type === 'success') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  )
  if (type === 'error') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  )
  if (type === 'warning') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifs, markRead, markAllRead, clearAll, unreadCount, relTime } = useNotifications()
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px', display: 'flex', alignItems: 'center', position: 'relative' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, width: 18, height: 18, background: '#E24B4A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340, background: '#162032', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, maxHeight: 400, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <span style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange)', fontSize: 13 }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No notifications yet</div>
            ) : notifs.map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 16px', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(232,98,42,0.08)', borderLeft: n.read ? '3px solid transparent' : '3px solid #E8622A', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div style={{ flexShrink: 0, marginTop: 2 }}><NotifIcon type={n.type} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{n.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>{n.message}</div>
                </div>
                <div style={{ flexShrink: 0, color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'nowrap' }}>{relTime(n.time)}</div>
              </div>
            ))}
          </div>

          {notifs.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', flexShrink: 0 }}>
              <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, width: '100%', textAlign: 'center' }}>
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
