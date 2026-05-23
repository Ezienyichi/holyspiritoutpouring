import { useState, useEffect } from 'react'
import { api } from '../api'

const EMPTY = { url: '', type: 'photo', caption: '' }

export default function AdminMedia() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [adding, setAdding] = useState(false)

  async function load() {
    const d = await fetch('/api/media').then(r => r.json())
    setItems(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function add(e) {
    e.preventDefault()
    if (!form.url.trim()) return
    setAdding(true)
    await api.post('/media', form)
    setForm(EMPTY)
    setAdding(false)
    load()
  }

  async function del(id) {
    if (!confirm('Delete this media item?')) return
    await api.del(`/media/${id}`)
    load()
  }

  return (
    <div>
      <h2 className="admin-page-title">Media Gallery</h2>

      <div className="admin-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '1rem' }}>Add New Media</h3>
        <form onSubmit={add}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">URL *</label>
              <input className="form-input" placeholder="https://…" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>
            <button type="submit" className="btn btn-orange" disabled={adding} style={{ alignSelf: 'flex-end' }}>
              {adding ? 'Adding…' : '+ Add'}
            </button>
          </div>
          <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            <label className="form-label">Caption</label>
            <input className="form-input" placeholder="Optional caption" value={form.caption} onChange={e=>setForm(f=>({...f,caption:e.target.value}))} />
          </div>
        </form>
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'var(--navy-card)', border: '1px solid var(--navy-border)' }}>
              {item.type === 'photo'
                ? <img src={item.url} alt={item.caption} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} onError={e=>{e.target.style.display='none'}} />
                : <div style={{ width: '100%', height: 150, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎬</div>
              }
              <div style={{ padding: '0.6rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caption || item.url}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ background: 'var(--navy)', borderRadius: 6, padding: '0.1rem 0.4rem', fontSize: '0.7rem', color: 'var(--orange)' }}>{item.type}</span>
                  <button className="admin-btn-del" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => del(item.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
