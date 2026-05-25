import { useState, useEffect } from 'react'
import { api } from '../api'

export default function AdminGiving() {
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/giving').then(d => { setGifts(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const total = gifts.reduce((s, g) => s + (g.amount || 0), 0)

  function exportCsv() {
    const headers = ['ID', 'Name', 'Email', 'Amount', 'Tier', 'Reason', 'Date']
    const rows = gifts.map(g => [g.id, g.name || '', g.email || '', g.amount || 0, g.tier || '', g.reason_for_giving || '', g.createdAt || ''])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'giving.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Giving Records</h2>
        <button className="btn btn-outline" onClick={exportCsv} style={{ fontSize: '0.85rem' }}>Export CSV</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="admin-stat-card">
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--orange)', fontFamily: 'var(--font-display)' }}>₦{total.toLocaleString()}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Giving</div>
        </div>
        <div className="admin-stat-card">
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c6af7', fontFamily: 'var(--font-display)' }}>{gifts.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Gifts</div>
        </div>
        <div className="admin-stat-card">
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4af78a', fontFamily: 'var(--font-display)' }}>
            ₦{gifts.length ? Math.round(total / gifts.length).toLocaleString() : 0}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Average Gift</div>
        </div>
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Amount</th><th>Tier</th><th>Reason</th><th>Date</th></tr>
            </thead>
            <tbody>
              {gifts.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No gifts yet.</td></tr>
              )}
              {gifts.map(g => (
                <tr key={g.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{g.id}</td>
                  <td>{g.name || <span style={{ color: 'var(--text-muted)' }}>Anonymous</span>}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{g.email || '—'}</td>
                  <td style={{ color: 'var(--orange)', fontWeight: 600 }}>₦{(g.amount || 0).toLocaleString()}</td>
                  <td style={{ fontSize: '0.85rem' }}>{g.tier}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{g.reason_for_giving || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{g.createdAt ? new Date(g.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
