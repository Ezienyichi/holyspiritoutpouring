import { useState, useEffect } from 'react'
import { api } from '../api'

export default function AdminPrayers() {
  const [prayers, setPrayers] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const d = await api.get('/prayers?all=true')
    setPrayers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(id) {
    await api.patch(`/prayers/${id}/approve`, { approved: true })
    load()
  }

  async function del(id) {
    if (!confirm('Delete this prayer request?')) return
    await api.del(`/prayers/${id}`)
    load()
  }

  const filtered = filter === 'all' ? prayers
    : filter === 'pending' ? prayers.filter(p => !p.approved)
    : prayers.filter(p => p.approved)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Prayer Requests</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {prayers.filter(p => !p.approved).length} pending
        </span>
      </div>

      <div className="media-filter-tabs" style={{ marginBottom: '1.5rem' }}>
        {[['pending','⏳ Pending'],['approved','✅ Approved'],['all','📋 All']].map(([val,lbl]) => (
          <button key={val} className={`media-tab${filter===val?' active':''}`} onClick={()=>setFilter(val)}>{lbl}</button>
        ))}
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No prayers in this category.</p>}
          {filtered.map(p => (
            <div key={p.id} className="admin-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--white)' }}>{p.name || 'Anonymous'}</span>
                  <span style={{ background: 'var(--navy)', borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.75rem', color: 'var(--orange)' }}>{p.category}</span>
                  {p.approved
                    ? <span style={{ background: '#1a3a2a', borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.75rem', color: '#4af78a' }}>Approved</span>
                    : <span style={{ background: '#3a2a1a', borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.75rem', color: '#f7c26a' }}>Pending</span>
                  }
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>🙏 {p.prayCount}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{p.text}</p>
                {p.email && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{p.email}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                {!p.approved && (
                  <button className="admin-btn-edit" style={{ background: '#1a3a2a', color: '#4af78a', borderColor: '#4af78a' }} onClick={() => approve(p.id)}>Approve</button>
                )}
                <button className="admin-btn-del" onClick={() => del(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
