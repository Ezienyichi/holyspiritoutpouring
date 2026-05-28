import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken, getToken } from '../api'
import { useToast } from '../context/ToastContext'

const API_BASE = import.meta.env.VITE_API_URL || ''

function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) } catch { return null }
}

export default function AdminLogin() {
  const toast = useToast()
  const [form, setForm] = useState({ username: '', password: '', rememberMe: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const decoded = parseJwt(token)
    if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
      navigate('/admin', { replace: true })
    }
  }, [navigate])

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
      if (!res.ok) {
        toast.error('Login Failed', data.error || 'Invalid username or password. Please try again.')
        setError(data.error || 'Invalid credentials')
        return
      }
      setToken(data.token)
      toast.success('Welcome Back', 'You are now logged in to the admin panel.')
      navigate('/admin', { replace: true })
    } catch {
      toast.error('Login Failed', 'Network error. Please check your connection.')
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="40" height="52" viewBox="0 0 22 28" fill="none" style={{ marginBottom: '0.5rem' }}><path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="#E8622A"/><path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="#C4501F"/></svg>
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
