import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { to: '/', label: 'About' },
    { to: '/speakers', label: 'Speakers' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/media', label: 'Media' },
    { to: '/prayer', label: 'Prayer' },
    { to: '/give', label: 'Give' },
    { to: '/register', label: 'Register', register: true },
    { to: '/live', label: 'Live', live: true },
  ]

  function handleRegister(e) {
    e.preventDefault()
    setMenuOpen(false)
    navigate('/register')
  }

  return (
    <header className={`nav-wrapper${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-topbar">
        <span className="nav-topbar-pill">August 15–17, 2025 &bull; Port Harcourt, Rivers State, Nigeria</span>
      </div>
      <div className="navbar">
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <svg width="22" height="28" viewBox="0 0 22 28" fill="none" style={{ flexShrink: 0 }}>
            <path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="#E8622A"/>
            <path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="#C4501F"/>
          </svg>
          <span className="nav-logo-text">utpouring<span className="accent">'25</span></span>
        </Link>

        <nav className="nav-links">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link${pathname === l.to ? ' active' : ''}${l.live ? ' nav-link-live' : ''}${l.register ? ' nav-link-register' : ''}`}
            >
              {l.live && <span className="live-pulse" />}
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a href="#register-section" className="nav-register" onClick={handleRegister}>
            Register Now
          </a>
          <button
            className="nav-hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`mobile-menu-link${l.live ? ' mobile-menu-link-live' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {l.live && <span className="live-pulse" style={{ marginRight: 6 }} />}
            {l.label}
          </Link>
        ))}
        <a href="#register-section" className="mobile-menu-register" onClick={handleRegister}>
          Register Now — Free
        </a>
      </div>
    </header>
  )
}
