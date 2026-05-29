import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { getToken, clearToken } from '../api'
import { useToast } from '../context/ToastContext'
import Dashboard from './Dashboard'
import SiteConfig from './SiteConfig'
import AdminSpeakers from './AdminSpeakers'
import AdminSchedule from './AdminSchedule'
import AdminPrayers from './AdminPrayers'
import AdminMedia from './AdminMedia'
import AdminGiving from './AdminGiving'
import AdminRegistrations from './AdminRegistrations'
import AdminLivestream from './AdminLivestream'
import AdminSponsors from './AdminSponsors'
import AdminPastMinisters from './AdminPastMinisters'
import AdminPreviousEvents from './AdminPreviousEvents'
import AdminTestimonials from './AdminTestimonials'
import AdminUsers from './AdminUsers'

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

const NAV_ITEMS = [
  { path: 'dashboard',       label: 'Dashboard',          roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'site-config',     label: 'Site Config',        roles: ['super_admin', 'admin'] },
  { path: 'speakers',        label: 'Featured Speakers',  roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'team-members',    label: 'Team Members',       roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'sponsors',        label: 'Sponsors',           roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'previous-events', label: 'Previous Events',    roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'past-ministers',  label: 'Past Ministers',     roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'schedule',        label: 'Schedule',           roles: ['super_admin', 'admin'] },
  { path: 'prayers',         label: 'Prayers',            roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'testimonials',    label: 'Testimonials',       roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'media',           label: 'Media',              roles: ['super_admin', 'content_manager', 'admin'] },
  { path: 'giving',          label: 'Giving',             roles: ['super_admin', 'admin'] },
  { path: 'registrations',   label: 'Registrations',      roles: ['super_admin', 'admin'] },
  { path: 'livestream',      label: 'Livestream',         roles: ['super_admin', 'admin'] },
  { path: 'users',           label: 'Users',              roles: ['super_admin', 'admin'] },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { window.location.href = '/admin'; return }
    const decoded = parseJwt(token)
    if (!decoded) { clearToken(); window.location.href = '/admin'; return }
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      clearToken(); window.location.href = '/admin'; return
    }
    setUser(decoded)
    if (decoded.exp) {
      const warnAt = decoded.exp * 1000 - Date.now() - 5 * 60 * 1000
      if (warnAt > 0) {
        const t = setTimeout(() => {
          toast?.warning('Session Expiring Soon', 'Your session will expire in 5 minutes.')
        }, warnAt)
        return () => clearTimeout(t)
      }
    }
  }, [])

  function logout() {
    clearToken()
    window.location.href = '/admin'
  }

  const role = user?.role || 'admin'
  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(role))
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (user?.username?.[0] || 'A').toUpperCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy)' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: 240,
        background: 'var(--navy-mid, #162032)',
        borderRight: '1px solid var(--navy-border)',
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
      }}>

        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--navy-border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <svg width="16" height="22" viewBox="0 0 22 28" fill="none">
            <path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="#E8622A"/>
            <path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="#C4501F"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontWeight: 700, fontSize: '0.95rem' }}>OP25 Admin</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {visibleNav.map(item => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.65rem 1.5rem',
                fontSize: '0.82rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--orange)' : 'var(--text-muted)',
                background: isActive ? 'rgba(232,98,42,0.08)' : 'transparent',
                borderLeft: `3px solid ${isActive ? 'var(--orange)' : 'transparent'}`,
                textDecoration: 'none',
                transition: 'all 0.15s',
                cursor: 'pointer',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + bottom actions */}
        <div style={{ borderTop: '1px solid var(--navy-border)' }}>
          {user && (
            <div style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'white', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.username}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {role === 'super_admin' ? 'Super Admin' : role === 'content_manager' ? 'Content Mgr' : 'Admin'}
                </div>
              </div>
            </div>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.55rem 1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
            View Site ↗
          </a>
          <button onClick={logout} style={{ display: 'block', width: '100%', padding: '0.55rem 1.5rem', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--navy-border)', background: 'var(--navy-mid, #162032)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'none' }}
            className="admin-menu-toggle"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
          </button>
          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Holy Spirit Outpouring '25
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Routes>
            <Route path="dashboard"       element={<Dashboard />} />
            <Route path="site-config"     element={<SiteConfig />} />
            <Route path="speakers"        element={<AdminSpeakers />} />
            <Route path="team-members"    element={<AdminSpeakers />} />
            <Route path="sponsors"        element={<AdminSponsors />} />
            <Route path="previous-events" element={<AdminPreviousEvents />} />
            <Route path="past-ministers"  element={<AdminPastMinisters />} />
            <Route path="schedule"        element={<AdminSchedule />} />
            <Route path="prayers"         element={<AdminPrayers />} />
            <Route path="testimonials"    element={<AdminTestimonials />} />
            <Route path="media"           element={<AdminMedia />} />
            <Route path="giving"          element={<AdminGiving />} />
            <Route path="registrations"   element={<AdminRegistrations />} />
            <Route path="livestream"      element={<AdminLivestream />} />
            <Route path="users"           element={<AdminUsers />} />
            <Route index                  element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
