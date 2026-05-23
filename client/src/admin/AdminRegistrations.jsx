import { useState, useEffect } from 'react'
import { api } from '../api'

export default function AdminRegistrations() {
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/registrations').then(d => { setRegs(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  function exportCsv() {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Attendance Type', 'Date']
    const rows = regs.map(r => [r.id, r.firstName || '', r.lastName || '', r.email || '', r.phone || '', r.attendanceType || '', r.createdAt || ''])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'registrations.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = search
    ? regs.filter(r => {
        const name = `${r.firstName||''} ${r.lastName||''}`.toLowerCase()
        return name.includes(search.toLowerCase()) || (r.email||'').toLowerCase().includes(search.toLowerCase())
      })
    : regs

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Registrations</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{regs.length} total</span>
          <button className="btn btn-outline" onClick={exportCsv} style={{ fontSize: '0.85rem' }}>↓ Export CSV</button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          className="form-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Type</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  {search ? 'No results found.' : 'No registrations yet.'}
                </td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.email}</td>
                  <td style={{ fontSize: '0.85rem' }}>{r.phone || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{r.city || '—'}</td>
                  <td>
                    <span style={{
                      background: r.attendanceType === 'in-person' ? 'rgba(74,247,138,0.15)' : 'rgba(124,106,247,0.15)',
                      color: r.attendanceType === 'in-person' ? '#4af78a' : '#7c6af7',
                      borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.75rem'
                    }}>
                      {r.attendanceType || 'online'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
