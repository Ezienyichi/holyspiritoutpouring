import { useState, useEffect, useRef } from 'react'
import { api, getToken } from '../api'
import { useToast } from '../context/ToastContext'

const API_BASE = import.meta.env.VITE_API_URL || ''

const EMPTY = { name: '', ministry_role: '', year: '', photo_url: '', display_order: 0 }

function PhotoUploader({ value, onChange }) {
  const [tab, setTab] = useState('upload')
  const [preview, setPreview] = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const [dragOver, setDragOver] = useState(false)
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

  function onUrlChange(e) {
    onChange(e.target.value)
    setPreview(e.target.value)
  }

  return (
    <div className="form-group" style={{ gridColumn: '1/-1', margin: 0 }}>
      <label className="form-label">Minister Photo</label>
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
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          style={{
            height: 160, border: `2px dashed ${dragOver ? 'var(--orange)' : 'var(--navy-border)'}`,
            borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(201,5,5,0.05)' : 'var(--navy)',
            transition: 'all 0.2s', overflow: 'hidden', position: 'relative',
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          ) : (
            <>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <div style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginTop: '0.5rem' }}>Click to upload or drag photo here</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>JPG, PNG, WebP — up to 5MB</div>
            </>
          )}
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,27,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem' }}>Uploading…</div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
      {tab === 'url' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <input
            className="form-input"
            placeholder="https://example.com/photo.jpg"
            value={value || ''}
            onChange={onUrlChange}
            style={{ flex: 1 }}
          />
          {preview && (
            <img src={preview} alt="preview" style={{ width: 50, height: 67, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              onError={e => e.target.style.display = 'none'} />
          )}
        </div>
      )}
      {uploadErr && <div style={{ color: '#f44', fontSize: '0.78rem', marginTop: '0.3rem' }}>{uploadErr}</div>}
    </div>
  )
}

export default function AdminPastMinisters() {
  const toast = useToast()
  const [ministers, setMinisters] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const d = await api.get('/past-ministers')
    setMinisters(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setModal('new') }
  function openEdit(m) { setForm({ ...m }); setModal(m.id) }
  function closeModal() { setModal(null) }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    if (modal === 'new') {
      await api.post('/past-ministers', form)
      toast.success('Minister Added', `${form.name} has been added.`)
    } else {
      await api.put(`/past-ministers/${modal}`, form)
      toast.success('Minister Updated', 'Minister details have been saved.')
    }
    setSaving(false)
    setModal(null)
    load()
  }

  async function del(id) {
    if (!confirm('Delete this minister?')) return
    await api.del(`/past-ministers/${id}`)
    toast.warning('Minister Removed', 'The minister has been removed.')
    load()
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Past Ministers</h2>
        <button className="btn btn-orange" onClick={openNew}>+ Add Minister</button>
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Photo</th><th>Year</th><th>Name</th><th>Ministry Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {ministers.map(m => (
                <tr key={m.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{m.display_order}</td>
                  <td>
                    {m.photo_url
                      ? <img src={m.photo_url} alt={m.name} style={{ width: 40, height: 54, borderRadius: 6, objectFit: 'cover' }} />
                      : <div style={{ width: 40, height: 54, borderRadius: 6, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1rem' }}>{m.name?.[0]}</div>
                    }
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{m.year}</td>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.ministry_role}</td>
                  <td>
                    <button className="admin-btn-edit" onClick={() => openEdit(m)}>Edit</button>
                    <button className="admin-btn-del" onClick={() => del(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {ministers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No ministers yet. Click "+ Add Minister" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">{modal === 'new' ? 'Add Past Minister' : 'Edit Minister'}</h3>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name || ''} onChange={e => f('name', e.target.value)} required placeholder="Moses Bliss" />
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Ministry Role</label>
                  <input className="form-input" value={form.ministry_role || ''} onChange={e => f('ministry_role', e.target.value)} placeholder="Worship Leader" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Year *</label>
                  <input className="form-input" value={form.year || ''} onChange={e => f('year', e.target.value)} required placeholder="2024" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" value={form.display_order || 0} onChange={e => f('display_order', Number(e.target.value))} />
                </div>
                <PhotoUploader value={form.photo_url} onChange={url => f('photo_url', url)} />
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
