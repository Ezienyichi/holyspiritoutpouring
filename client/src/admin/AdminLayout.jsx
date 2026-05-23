import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getToken, clearToken } from '../api'

const NAV = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/config', label: '⚙️ Site Config' },
  { to: '/admin/speakers', label: '🎤 Speakers' },
  { to: '/admin/schedule', label: '📅 Schedule' },
  { to: '/admin/prayers', label: '🙏 Prayers' },
  { to: '/admin/media', label: '📷 Media' },
  { to: '/admin/giving', label: '💛 Giving' },
  { to: '/admin/registrations', label: '📋 Registrations' },
  { to: '/admin/livestream', label: '🔴 Livestream' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!getToken()) navigate('/admin/login', { replace: true })
  }, [navigate])

  function logout() {
    clearToken()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <span style={{ fontSize: '1.5rem' }}>🔥</span>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontWeight: 700 }}>OP25 Admin</span>
        </div>
        <nav className="admin-nav">
          {NAV.map(n => (
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
          <Outlet />
        </div>
      </div>
    </div>
  )
}
