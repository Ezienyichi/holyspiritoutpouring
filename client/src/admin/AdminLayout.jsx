import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getToken, clearToken } from '../api'

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

const ALL_NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true, roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/config', label: 'Site Config', icon: '⚙️', roles: ['super_admin', 'admin'] },
  { to: '/admin/speakers', label: 'Speakers', icon: '🎤', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/schedule', label: 'Schedule', icon: '📅', roles: ['super_admin', 'admin'] },
  { to: '/admin/prayers', label: 'Prayers', icon: '🙏', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/media', label: 'Media', icon: '📷', roles: ['super_admin', 'content_manager', 'admin'] },
  { to: '/admin/giving', label: 'Giving', icon: '💛', roles: ['super_admin', 'admin'] },
  { to: '/admin/registrations', label: 'Registrations', icon: '📋', roles: ['super_admin', 'admin'] },
  { to: '/admin/livestream', label: 'Livestream', icon: '🔴', roles: ['super_admin', 'admin'] },
  { to: '/admin/users', label: 'Users', icon: '👥', roles: ['super_admin', 'admin'] },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showExpiry, setShowExpiry] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { navigate('/admin/login', { replace: true }); return }
    const decoded = parseJwt(token)
    if (!decoded) { navigate('/admin/login', { replace: true }); return }
    setUser(decoded)
    if (decoded.exp) {
      const msLeft = decoded.exp * 1000 - Date.now()
      if (msLeft <= 0) {
        clearToken()
        navigate('/admin/login', { replace: true })
        return
      }
      const warnAt = msLeft - 5 * 60 * 1000
      if (warnAt > 0) {
        const t = setTimeout(() => setShowExpiry(true), warnAt)
        return () => clearTimeout(t)
      }
    }
  }, [navigate])

  function logout() {
    clearToken()
    navigate('/admin/login', { replace: true })
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
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏰</div>
            <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Session Expiring Soon</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Your session will expire in 5 minutes. Please save your work.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-orange" onClick={() => { setShowExpiry(false); navigate('/admin/login') }}>Sign In Again</button>
              <button className="btn btn-navy" onClick={() => setShowExpiry(false)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <span style={{ fontSize: '1.5rem' }}>🔥</span>
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
              <span style={{ marginRight: '0.5rem' }}>{n.icon}</span>{n.label}
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
        <button className="admin-logout-btn" onClick={logout}>↩ Logout</button>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-toggle" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ↗ View Site
          </a>
        </div>
        <div className="admin-page">
          <Outlet context={{ user }} />
        </div>
      </div>
    </div>
  )
}
