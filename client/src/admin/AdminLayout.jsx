import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
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
import AdminLive from './AdminLive'
import AdminSponsors from './AdminSponsors'
import AdminPastMinisters from './AdminPastMinisters'
import AdminPreviousEvents from './AdminPreviousEvents'
import AdminTestimonials from './AdminTestimonials'
import AdminUsers from './AdminUsers'

const MOBILE_BREAKPOINT = 1024

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
  { path: 'live',            label: 'Live Stream Control', roles: ['super_admin', 'admin'] },
  { path: 'users',           label: 'Users',              roles: ['super_admin', 'admin'] },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT)

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

  // Track viewport so we know when the drawer sidebar should apply
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(false)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close the drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Swipe left to close / swipe right from the edge to open, mobile only
  useEffect(() => {
    if (!isMobile) return
    let startX = 0
    let startY = 0
    const onTouchStart = e => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const onTouchEnd = e => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = Math.abs(e.changedTouches[0].clientY - startY)
      if (dy > 80) return
      if (dx < -60 && sidebarOpen) setSidebarOpen(false)
      else if (dx > 60 && !sidebarOpen && startX < 30) setSidebarOpen(true)
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [isMobile, sidebarOpen])

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
    <div className="admin-layout">

      {isMobile && sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <svg width="16" height="22" viewBox="0 0 22 28" fill="none">
            <path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="var(--orange)"/>
            <path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="var(--orange-dark)"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontWeight: 700, fontSize: '0.95rem' }}>OP25 Admin</span>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="admin-nav">
          {visibleNav.map(item => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

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
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-item" style={{ borderLeft: '3px solid transparent' }}>
            View Site ↗
          </a>
          <button onClick={logout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="admin-menu-toggle"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
          </button>
          <div className="admin-topbar-title">
            Holy Spirit Outpouring '25
          </div>
          <button
            onClick={logout}
            className="admin-topbar-logout"
            aria-label="Logout"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>

        <div className="admin-page">
          <Routes>
            <Route path="dashboard"       element={<Dashboard user={user} />} />
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
            <Route path="live"            element={<AdminLive />} />
            <Route path="users"           element={<AdminUsers />} />
            <Route index                  element={<Dashboard user={user} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
