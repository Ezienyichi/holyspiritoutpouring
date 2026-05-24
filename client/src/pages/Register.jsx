import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    location: '', church: '', attendanceType: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.attendanceType) { setError('Please select your attendance type.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/registrations', {
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
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Join Us</span>
          <h1 className="page-banner-title">Register for Outpouring '25</h1>
          <p className="page-banner-subtitle">Secure your place at the most transformative conference of the year. Registration is free.</p>
        </div>
      </div>

      {submitted ? <SuccessState /> : (
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
