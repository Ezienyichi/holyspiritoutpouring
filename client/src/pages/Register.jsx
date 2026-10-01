import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useSiteConfig } from '../hooks/useSiteConfig'

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  const shortMatch = url.match(/youtu\.be\/([^?]+)/)
  const liveMatch = url.match(/youtube\.com\/live\/([^?]+)/)
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/)
  const id = watchMatch?.[1] || shortMatch?.[1] || liveMatch?.[1] || embedMatch?.[1]
  return id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1`
    : null
}

function isYouTubeUrl(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'))
}

const API_BASE = import.meta.env.VITE_API_URL || ''

const ATTENDANCE_OPTIONS = [
  {
    value: 'onsite',
    title: 'Onsite',
    desc: 'I will attend in person at Port Harcourt',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    value: 'virtual',
    title: 'Virtually',
    desc: 'I will watch the livestream online',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
]

function SuccessState() {
  return (
    <section className="section section-dark" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="register-success">
          <div className="register-success-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="register-success-title">You're Registered!</h2>
          <p className="register-success-sub">We'll see you at Outpouring '25. A confirmation has been sent to your email.</p>
          <div className="register-success-btns">
            <Link to="/live" className="btn btn-orange btn-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              Watch Live
            </Link>
            <Link to="/schedule" className="btn btn-navy btn-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              View Schedule
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Register() {
  const { config } = useSiteConfig()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    location: '', church: '', attendanceType: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const registrationOpen = config.registration_open !== 'false'

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.attendanceType) { setError('Please select your attendance type.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setSubmitted(true) }
      else { const d = await res.json(); setError(d.error || 'Registration failed. Please try again.') }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      {/* ── Registration Banner ── */}
      <div style={{ width: '100%', position: 'relative', overflow: 'hidden', background: '#0D1B2A', marginTop: '70px' }}>
        {config.register_banner_url ? (
          config.register_banner_type === 'video' ? (
            /* Video banner */
            <div style={{ position: 'relative', width: '100%', paddingBottom: '40%', height: 0, overflow: 'hidden', background: '#000' }}>
              {isYouTubeUrl(config.register_banner_url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(config.register_banner_url)}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '177.78vh', minWidth: '100%', minHeight: '56.25vw', height: '100%', border: 'none', pointerEvents: 'none' }}
                  allow="autoplay; muted; loop; playsinline"
                  title="Registration Banner"
                />
              ) : (
                <video src={config.register_banner_url} autoPlay muted loop playsInline
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,42,0.55)', zIndex: 2 }} />
              <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                <div style={{ background: '#c90505', color: 'white', fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 16px', borderRadius: '100px', marginBottom: '1rem', display: 'inline-block' }}>Registration Open</div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 4vw, 2.8rem)', fontWeight: '700', color: 'white', marginBottom: '0.5rem', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
                  {config.register_banner_title || 'Join Us at Outpouring 2026'}
                </h1>
                <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                  {config.register_banner_subtitle || 'August 15–17, 2026 • Port Harcourt'}
                </p>
              </div>
            </div>
          ) : (
            /* Image / flyer banner */
            <div style={{ position: 'relative', width: '100%', paddingBottom: '40%', height: 0, overflow: 'hidden', background: '#0D1B2A' }}>
              <img src={config.register_banner_url} alt="Registration Banner"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,27,42,0.1) 0%, rgba(13,27,42,0.65) 100%)', zIndex: 2 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3, padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem, 3.5vw, 2.5rem)', fontWeight: '700', color: 'white', marginBottom: '0.25rem', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                  {config.register_banner_title || 'Join Us at Outpouring 2026'}
                </h1>
                <p style={{ fontSize: 'clamp(12px, 1.8vw, 15px)', color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
                  {config.register_banner_subtitle || 'August 15–17, 2026 • Port Harcourt'}
                </p>
              </div>
            </div>
          )
        ) : (
          /* Default banner (no media set) */
          <div style={{ width: '100%', padding: '5rem 1.5rem 3.5rem', background: 'linear-gradient(135deg, #0D1B2A 0%, #1a0a2e 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,5,5,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-block', background: '#c90505', color: 'white', fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 16px', borderRadius: '100px', marginBottom: '1.25rem' }}>Registration Now Open</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: '700', color: 'white', marginBottom: '0.75rem' }}>
                {config.register_banner_title || 'Join Us at Outpouring 2026'}
              </h1>
              <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: 'rgba(255,255,255,0.6)', maxWidth: '500px', margin: '0 auto' }}>
                {config.register_banner_subtitle || 'August 15–17, 2026 • Port Harcourt, Rivers State'}
              </p>
            </div>
          </div>
        )}
      </div>

      {submitted ? <SuccessState /> : !registrationOpen ? (
        <section className="section section-dark" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: '1.5rem' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontSize: '2rem', marginBottom: '0.75rem' }}>Registration is Currently Closed</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 2rem' }}>
              {config.registration_deadline
                ? `Registration closed on ${config.registration_deadline}. Check back for future events.`
                : 'Registration for Outpouring \'25 is not open at this time. Please check back soon.'}
            </p>
            <Link to="/" className="btn btn-orange">Back to Home</Link>
          </div>
        </section>
      ) : (
        <section className="section section-dark">
          <div className="container">
            <div className="register-form-card">
              {error && <div className="alert alert-err" style={{ marginBottom: '1.5rem' }}>{error}</div>}
              <form onSubmit={handleSubmit}>

                {/* First Name + Last Name */}
                <div className="reg-form-row">
                  <div className="reg-form-group">
                    <label className="reg-field-label">First Name *</label>
                    <input className="reg-input" placeholder="Enter your first name" value={form.firstName} onChange={set('firstName')} required />
                  </div>
                  <div className="reg-form-group">
                    <label className="reg-field-label">Last Name *</label>
                    <input className="reg-input" placeholder="Enter your last name" value={form.lastName} onChange={set('lastName')} required />
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="reg-form-row">
                  <div className="reg-form-group">
                    <label className="reg-field-label">Email Address *</label>
                    <input className="reg-input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
                  </div>
                  <div className="reg-form-group">
                    <label className="reg-field-label">Phone Number *</label>
                    <input className="reg-input" type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={set('phone')} required />
                  </div>
                </div>

                {/* Location + Church */}
                <div className="reg-form-row">
                  <div className="reg-form-group">
                    <label className="reg-field-label">Location (City & State) *</label>
                    <input className="reg-input" placeholder="e.g. Port Harcourt, Rivers State" value={form.location} onChange={set('location')} required />
                  </div>
                  <div className="reg-form-group">
                    <label className="reg-field-label">Church / Ministry <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>(optional)</span></label>
                    <input className="reg-input" placeholder="Name of your church or ministry" value={form.church} onChange={set('church')} />
                  </div>
                </div>

                {/* Attendance Type */}
                <div className="reg-form-group">
                  <label className="reg-field-label">Will you be attending virtually or onsite? *</label>
                  <div className="reg-attendance-grid">
                    {ATTENDANCE_OPTIONS.map(opt => (
                      <label
                        key={opt.value}
                        className={`reg-attendance-card${form.attendanceType === opt.value ? ' selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="attendanceType"
                          value={opt.value}
                          style={{ display: 'none' }}
                          onChange={() => setForm(f => ({ ...f, attendanceType: opt.value }))}
                        />
                        <div className="reg-attendance-icon">{opt.icon}</div>
                        <div>
                          <div className="reg-attendance-title">{opt.title}</div>
                          <div className="reg-attendance-desc">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-orange"
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', fontWeight: 700, marginTop: '0.5rem' }}
                  disabled={loading}
                >
                  {loading ? 'Registering…' : (
                    <>
                      Complete Registration
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
      <Footer />
    </>
  )
}
