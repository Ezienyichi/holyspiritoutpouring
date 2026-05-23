import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { to: '/speakers', label: 'Speakers' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/media', label: 'Media' },
    { to: '/prayer', label: 'Prayer' },
    { to: '/give', label: 'Give' },
  ]

  return (
    <header className={`nav-wrapper${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-topbar">
        <span className="nav-topbar-pill">🔥 August 15–17, 2025 &bull; Lagos, Nigeria</span>
      </div>
      <div className="navbar">
        <Link to="/" className="nav-logo">
          🔥<span className="o-letter">utpouring</span>
          <span className="accent">'25</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-link${pathname === '/' ? ' active' : ''}`}>About</Link>
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`nav-link${pathname === l.to ? ' active' : ''}`}>{l.label}</Link>
          ))}
          <Link to="/live" className="nav-link nav-link-live">
            <span className="live-pulse" />
            📡 Live
          </Link>
        </nav>
        <Link to="/" className="nav-register" onClick={e => { e.preventDefault(); document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' }) }}>
          🔥 Register Now
        </Link>
      </div>
    </header>
  )
}
