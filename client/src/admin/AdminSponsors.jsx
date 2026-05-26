import { useState, useEffect, useRef } from 'react'
import { api, getToken } from '../api'
import { useToast } from '../context/ToastContext'

const API_BASE = import.meta.env.VITE_API_URL || ''

const EMPTY = { name: '', logo_url: '', website_url: '', display_order: 0, active: 1 }

function LogoUploader({ value, onChange }) {
  const [tab, setTab] = useState('upload')
  const [preview, setPreview] = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef()

  useEffect(() => { setPreview(value || '') }, [value])

  async function handleFile(file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setUploadErr('File too large — max 5MB'); return }
    setUploadErr('')
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(API_BASE + '/api/media/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setPreview(data.url)
      onChange(data.url)
    } catch (e) {
      setUploadErr(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="form-group" style={{ gridColumn: '1/-1', margin: 0 }}>
      <label className="form-label">Logo Image</label>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
        {['upload', 'url'].map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            padding: '0.3rem 0.8rem', fontSize: '0.78rem', fontWeight: 600,
            borderRadius: 6, border: '1px solid',
            background: tab === t ? 'var(--orange)' : 'transparent',
            borderColor: tab === t ? 'var(--orange)' : 'var(--navy-border)',
            color: tab === t ? 'white' : 'var(--text-muted)', cursor: 'pointer',
          }}>{t === 'upload' ? 'Upload' : 'URL'}</button>
        ))}
      </div>
      {tab === 'upload' && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            height: 80, border: `2px dashed var(--navy-border)`, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            background: 'var(--navy)', transition: 'all 0.2s', overflow: 'hidden', position: 'relative',
          }}
        >
          {preview ? (
            <img src={preview} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 8 }} />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{uploading ? 'Uploading…' : 'Click to upload logo'}</div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
      {tab === 'url' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <input
            className="form-input"
            placeholder="https://example.com/logo.png"
            value={value || ''}
            onChange={e => { onChange(e.target.value); setPreview(e.target.value) }}
            style={{ flex: 1 }}
          />
          {preview && <img src={preview} alt="logo" style={{ height: 40, maxWidth: 80, objectFit: 'contain', borderRadius: 4 }} onError={e => e.target.style.display = 'none'} />}
        </div>
      )}
      {uploadErr && <div style={{ color: '#f44', fontSize: '0.78rem', marginTop: '0.3rem' }}>{uploadErr}</div>}
    </div>
  )
}

export default function AdminSponsors() {
  const toast = useToast()
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [deleted, setDeleted] = useState([])

  async function load() {
    const d = await api.get('/sponsors/all')
    setSponsors(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function loadDeleted() {
    try {
      const res = await fetch(API_BASE + '/api/sponsors/all', { headers: { Authorization: `Bearer ${localStorage.getItem('op25_token')}` } })
      const d = await res.json()
      setDeleted(Array.isArray(d) ? d.filter(s => s.deleted) : [])
    } catch {}
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (showDeleted) loadDeleted() }, [showDeleted])

  function openNew() { setForm(EMPTY); setModal('new') }
  function openEdit(s) { setForm({ ...s, active: s.active === 1 || s.active === true ? 1 : 0 }); setModal(s.id) }
  function closeModal() { setModal(null) }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    if (modal === 'new') {
      await api.post('/sponsors', form)
      toast.success('Sponsor Added', `${form.name} has been added.`)
    } else {
      await api.put(`/sponsors/${modal}`, form)
      toast.success('Sponsor Updated', 'Sponsor details saved.')
    }
    setSaving(false)
    setModal(null)
    load()
  }

  async function del(id, name) {
    if (!confirm(`Remove ${name}?`)) return
    await api.del(`/sponsors/${id}`)
    toast.warning('Sponsor Removed', `${name} has been removed.`)
    load()
  }

  async function restore(id) {
    await fetch(API_BASE + `/api/sponsors/${id}/restore`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('op25_token')}` }
    })
    toast.success('Restored', 'Sponsor restored.')
    load()
    loadDeleted()
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Partners & Sponsors</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-navy" onClick={() => setShowDeleted(v => !v)} style={{ fontSize: '0.82rem' }}>
            {showDeleted ? 'Hide Removed' : 'View Removed'}
          </button>
          <button className="btn btn-orange" onClick={openNew}>+ Add Sponsor</button>
        </div>
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Logo</th><th>Name</th><th>Website</th><th>Active</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sponsors.filter(s => !s.deleted).map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{s.display_order}</td>
                  <td>
                    {s.logo_url
                      ? <img src={s.logo_url} alt={s.name} style={{ height: 36, maxWidth: 80, objectFit: 'contain', borderRadius: 4, background: '#f5f5f5', padding: 4 }} />
                      : <div style={{ background: '#F8F8F8', border: '1px solid #EEE', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#040102', display: 'inline-block' }}>{s.name}</div>
                    }
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {s.website_url ? <a href={s.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>Link</a> : '—'}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.active === 1 ? '#22c55e' : '#ef4444' }}>
                      {s.active === 1 ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <button className="admin-btn-edit" onClick={() => openEdit(s)}>Edit</button>
                    <button className="admin-btn-del" onClick={() => del(s.id, s.name)}>Remove</button>
                  </td>
                </tr>
              ))}
              {sponsors.filter(s => !s.deleted).length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No sponsors yet. Click "+ Add Sponsor" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDeleted && deleted.length > 0 && (
        <div className="admin-card" style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Removed Sponsors</h3>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {deleted.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{s.name}</td>
                  <td><button className="admin-btn-edit" onClick={() => restore(s.id)}>Restore</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">{modal === 'new' ? 'Add Sponsor / Partner' : 'Edit Sponsor'}</h3>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name || ''} onChange={e => f('name', e.target.value)} required placeholder="Sponsor Name" />
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Website URL</label>
                  <input className="form-input" value={form.website_url || ''} onChange={e => f('website_url', e.target.value)} placeholder="https://example.com" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" value={form.display_order || 0} onChange={e => f('display_order', Number(e.target.value))} />
                </div>
                <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label className="form-label" style={{ marginBottom: 8 }}>Visible on Site</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.active === 1 || form.active === true} onChange={e => f('active', e.target.checked ? 1 : 0)} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Show on website</span>
                  </label>
                </div>
                <LogoUploader value={form.logo_url} onChange={url => f('logo_url', url)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-navy" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-orange" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
