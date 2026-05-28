import { useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || ''

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('op25_token', data.token)
      window.location.href = '/admin/dashboard'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B2A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'rgba(22,32,50,0.9)',
        border: '1px solid rgba(201,5,5,0.2)',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: '#c90505',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '24px',
            color: 'white',
            fontWeight: '700'
          }}>O</div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.5rem',
            color: 'white',
            margin: '0 0 4px'
          }}>Admin Panel</h1>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            margin: 0
          }}>Holy Spirit Outpouring Conference</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(201,5,5,0.15)',
            border: '1px solid rgba(201,5,5,0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#ff6b6b',
            fontSize: '13px',
            marginBottom: '1rem'
          }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '6px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '6px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(201,5,5,0.5)' : '#c90505',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.2)',
          marginTop: '1.5rem'
        }}>
          Default: admin / outpouring2025
        </p>
      </div>
    </div>
  )
}
