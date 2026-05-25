import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../api'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '', rememberMe: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid credentials'); return }
      setToken(data.token)
      navigate('/admin')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔥</div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontSize: '1.8rem', marginBottom: '0.25rem' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Outpouring '25</p>
        </div>
        <div style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 16, padding: '2rem' }}>
          {error && <div className="alert alert-err" style={{ marginBottom: '1.5rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))}
              />
              Remember me for 7 days
            </label>
            <button
              type="submit"
              className="btn btn-orange"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
