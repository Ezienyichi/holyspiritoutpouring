import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentReg, setRecentReg] = useState([])
  const [recentGiving, setRecentGiving] = useState([])
  const [recentPrayers, setRecentPrayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/registrations'),
      api.get('/giving'),
      api.get('/prayers?all=true'),
      api.get('/media'),
    ]).then(([reg, giving, prayers, media]) => {
      const totalGifts = giving.reduce((s, g) => s + (g.amount || 0), 0)
      setStats({
        registrations: reg.length,
        prayers: prayers.length,
        pendingPrayers: prayers.filter(p => !p.approved).length,
        media: media.length,
        totalGifts,
      })
      setRecentReg(reg.slice(-5).reverse())
      setRecentGiving(giving.slice(-5).reverse())
      setRecentPrayers(prayers.filter(p => !p.approved).slice(0, 5))
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-state">Loading dashboard…</div>

  const statCards = [
    { label: 'Registrations', value: stats.registrations, icon: '📋', color: 'var(--orange)' },
    { label: 'Prayer Requests', value: stats.prayers, icon: '🙏', color: '#7c6af7' },
    { label: 'Pending Prayers', value: stats.pendingPrayers, icon: '⏳', color: '#f7c26a' },
    { label: 'Media Items', value: stats.media, icon: '📷', color: '#4af78a' },
    { label: 'Total Giving', value: `₦${stats.totalGifts.toLocaleString()}`, icon: '💛', color: '#f7a24a' },
  ]

  return (
    <div>
      <h2 className="admin-page-title">Dashboard</h2>
      <div className="admin-stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="admin-card">
          <h3 className="admin-card-title">Recent Registrations</h3>
          {recentReg.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registrations yet.</p> : (
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {recentReg.map(r => (
                  <tr key={r.id}><td>{r.name}</td><td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.email}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title">Pending Prayer Requests</h3>
          {recentPrayers.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending prayers.</p> : (
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

        <div className="admin-card">
          <h3 className="admin-card-title">Recent Gifts</h3>
          {recentGiving.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No gifts yet.</p> : (
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
      </div>
    </div>
  )
}
