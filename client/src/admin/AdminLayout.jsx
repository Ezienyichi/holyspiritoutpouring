import { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getToken, clearToken } from '../api'
import { useToast } from '../context/ToastContext'
import NotificationBell from './NotificationBell'

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

const ALL_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/config', label: 'Site Config', roles: ['super_admin', 'admin'] },
  { to: '/admin/speakers', label: 'Team Members', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/sponsors', label: 'Sponsors', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/previous-events', label: 'Previous Events', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/past-ministers', label: 'Past Ministers', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/schedule', label: 'Schedule', roles: ['super_admin', 'admin'] },
  { to: '/admin/prayers', label: 'Prayers', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/testimonials', label: 'Testimonials', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/media', label: 'Media', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/giving', label: 'Giving', roles: ['super_admin', 'admin'] },
  { to: '/admin/registrations', label: 'Registrations', roles: ['super_admin', 'admin'] },
  { to: '/admin/livestream', label: 'Livestream', roles: ['super_admin', 'admin'] },
  { to: '/admin/users', label: 'Users', roles: ['super_admin', 'admin'] },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const toast = useToast()
  const toastRef = useRef(toast)
  toastRef.current = toast
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showExpiry, setShowExpiry] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { navigate('/admin', { replace: true }); return }
    const decoded = parseJwt(token)
    if (!decoded) { navigate('/admin', { replace: true }); return }
    setUser(decoded)
    if (decoded.exp) {
      const msLeft = decoded.exp * 1000 - Date.now()
      if (msLeft <= 0) {
        clearToken()
        navigate('/admin', { replace: true })
        return
      }
      const warnAt = msLeft - 5 * 60 * 1000
      if (warnAt > 0) {
        const t = setTimeout(() => {
          setShowExpiry(true)
          toastRef.current?.warning('Session Expiring Soon', 'Your session will expire in 5 minutes. Please save your work.')
        }, warnAt)
        return () => clearTimeout(t)
      }
    }
  }, [navigate])

  function logout() {
    clearToken()
    window.location.href = '/admin'
  }

  const role = user?.role || 'admin'
  const nav = ALL_NAV.filter(n => n.roles.includes(role))
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <div className="admin-layout">
      {showExpiry && (
        <div className="expiry-modal-overlay">
          <div className="expiry-modal">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" style={{ marginBottom: '0.75rem' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Session Expiring Soon</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Your session will expire in 5 minutes. Please save your work.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-orange" onClick={() => { clearToken(); window.location.href = '/admin' }}>Sign In Again</button>
              <button className="btn btn-navy" onClick={() => setShowExpiry(false)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <svg width="18" height="24" viewBox="0 0 22 28" fill="none"><path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="#E8622A"/><path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="#C4501F"/></svg>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontWeight: 700 }}>OP25 Admin</span>
        </div>
        <nav className="admin-nav">
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="admin-sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="admin-sidebar-user-name">{user.name || user.username}</div>
              <div className="admin-sidebar-user-role">
                {role === 'super_admin' ? 'Super Admin' : role === 'content_manager' ? 'Content Manager' : 'Admin'}
              </div>
            </div>
          </div>
        )}
        <button className="admin-logout-btn" onClick={logout}>Logout</button>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-toggle" onClick={() => setSidebarOpen(o => !o)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
              View Site
            </a>
            <NotificationBell />
          </div>
        </div>
        <div className="admin-page">
          <Outlet context={{ user }} />
        </div>
      </div>
    </div>
  )
}
