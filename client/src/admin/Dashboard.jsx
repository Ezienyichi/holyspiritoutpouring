import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getToken } from '../api'

const BASE_URL = import.meta.env.VITE_API_URL || ''

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }
}

async function safeFetch(url, fallback) {
  try {
    const res = await Promise.race([
      fetch(url, { headers: authHeaders() }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 7000)),
    ])
    if (!res.ok) return fallback
    return res.json()
  } catch {
    return fallback
  }
}

export default function Dashboard() {
  const { user } = useOutletContext() || {}
  const role = user?.role || 'admin'
  const isSuperAdmin = role === 'super_admin' || role === 'admin'

  const [stats, setStats] = useState({ speakers: 0, sessions: 0, prayers: 0, registrations: 0, media: 0, giving: 0, totalGiving: 0, pendingPrayers: 0 })
  const [recentReg, setRecentReg] = useState([])
  const [recentGiving, setRecentGiving] = useState([])
  const [recentPrayers, setRecentPrayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const safetyTimer = setTimeout(() => setLoading(false), 8000)

    async function fetchAll() {
      const statsData = await safeFetch(`${BASE_URL}/api/dashboard/stats`, {})
      setStats(prev => ({
        ...prev,
        speakers: statsData.speakers || 0,
        sessions: statsData.sessions || 0,
        prayers: statsData.prayers || 0,
        registrations: statsData.registrations || 0,
        media: statsData.media || 0,
        giving: statsData.giving || 0,
        totalGiving: statsData.totalGiving || 0,
      }))

      const prayersData = await safeFetch(`${BASE_URL}/api/prayers?all=true`, [])
      const prayers = Array.isArray(prayersData) ? prayersData : []
      setStats(prev => ({ ...prev, pendingPrayers: prayers.filter(p => !p.approved).length }))
      setRecentPrayers(prayers.filter(p => !p.approved).slice(0, 5))

      if (isSuperAdmin) {
        const regData = await safeFetch(`${BASE_URL}/api/registrations`, [])
        setRecentReg(Array.isArray(regData) ? regData.slice(-5).reverse() : [])

        const givingData = await safeFetch(`${BASE_URL}/api/giving`, [])
        setRecentGiving(Array.isArray(givingData) ? givingData.slice(-5).reverse() : [])
      }

      clearTimeout(safetyTimer)
      setLoading(false)
    }

    fetchAll()
    return () => clearTimeout(safetyTimer)
  }, [isSuperAdmin])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(232,98,42,0.2)',
        borderTop: '3px solid var(--orange)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading dashboard...</p>
      <p style={{ color: 'var(--text-dim)', fontSize: '12px', textAlign: 'center' }}>If this takes too long the database may be connecting. Please wait.</p>
    </div>
  )

  const statCards = [
    ...(isSuperAdmin ? [{ label: 'Registrations', value: stats.registrations, color: 'var(--orange)' }] : []),
    { label: 'Prayer Requests', value: stats.prayers, color: '#7c6af7' },
    { label: 'Pending Prayers', value: stats.pendingPrayers, color: '#f7c26a' },
    { label: 'Media Items', value: stats.media, color: '#4af78a' },
    { label: 'Speakers', value: stats.speakers, color: '#60a5fa' },
    ...(isSuperAdmin ? [{ label: 'Total Giving', value: `₦${(stats.totalGiving || 0).toLocaleString()}`, color: '#f7a24a' }] : []),
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="admin-page-title" style={{ marginBottom: '0.25rem' }}>
          Welcome back, {user?.name || user?.username || 'Admin'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {role === 'super_admin' ? 'Super Admin' : role === 'content_manager' ? 'Content Manager' : 'Admin'} · Outpouring '25 Dashboard
        </p>
      </div>

      <div className="admin-stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {isSuperAdmin && (
          <div className="admin-card">
            <h3 className="admin-card-title">Recent Registrations</h3>
            {recentReg.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registrations yet.</p>
              : (
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Email</th></tr></thead>
                  <tbody>
                    {recentReg.map(r => (
                      <tr key={r.id}>
                        <td>{r.firstName} {r.lastName}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        )}

        <div className="admin-card">
          <h3 className="admin-card-title">Pending Prayer Requests</h3>
          {recentPrayers.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending prayers.</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentPrayers.map(p => (
                  <div key={p.id} style={{ background: 'var(--navy)', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.25rem' }}>{p.name || 'Anonymous'} · {p.category}</div>
                    <div style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.text}</div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {isSuperAdmin && (
          <div className="admin-card">
            <h3 className="admin-card-title">Recent Gifts</h3>
            {recentGiving.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No gifts yet.</p>
              : (
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Amount</th><th>Tier</th></tr></thead>
                  <tbody>
                    {recentGiving.map(g => (
                      <tr key={g.id}>
                        <td>{g.name || 'Anonymous'}</td>
                        <td style={{ color: 'var(--orange)' }}>₦{(g.amount || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{g.tier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
        </div>
        )}
      </div>
    </div>
  )
}
