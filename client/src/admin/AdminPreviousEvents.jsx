import { useState, useEffect, useRef } from 'react'
import { getToken } from '../api'
import { useToast } from '../context/ToastContext'
import SaveButton from '../components/SaveButton'
import { saveRecord } from '../utils/adminSave'

const API_BASE = import.meta.env.VITE_API_URL || ''

const EMPTY = { year: '', title: '', tagline: '', image_url: '', highlights_url: '', display_order: 0 }

function ImageUploader({ value, onChange, label = 'Event Image' }) {
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
      <label className="form-label">{label}</label>
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
              <div style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginTop: '0.5rem' }}>Click to upload or drag image here</div>
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
            placeholder="https://example.com/image.jpg"
            value={value || ''}
            onChange={onUrlChange}
            style={{ flex: 1 }}
          />
          {preview && (
            <img src={preview} alt="preview" style={{ width: 60, height: 80, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              onError={e => e.target.style.display = 'none'} />
          )}
        </div>
      )}
      {uploadErr && <div style={{ color: '#f44', fontSize: '0.78rem', marginTop: '0.3rem' }}>{uploadErr}</div>}
    </div>
  )
}

export default function AdminPreviousEvents() {
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  async function load() {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/previous-events', { headers: { Authorization: `Bearer ${getToken()}` } })
      const d = await res.json()
      setEvents(Array.isArray(d) ? d : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setModal('new') }
  function openEdit(ev) { setForm({ ...ev }); setModal(ev.id) }
  function closeModal() { setModal(null) }

  const handleSave = async () => {
    if (!form.year?.trim()) throw new Error('Year is required')
    if (!form.title?.trim()) throw new Error('Title is required')
    const id = modal !== 'new' ? modal : null
    const saved = await saveRecord('/api/previous-events', form, id)
    setEvents(prev => id ? prev.map(e => e.id === id ? saved : e) : [saved, ...prev])
    setModal(null)
    setForm(EMPTY)
    toast.success(id ? 'Event Updated' : 'Event Added', `${saved.year} — ${saved.title} has been saved.`)
  }

  async function del(id) {
    if (!confirm('Delete this event?')) return
    try {
      await fetch((import.meta.env.VITE_API_URL || '') + `/api/previous-events/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setEvents(prev => prev.filter(e => e.id !== id))
      toast.warning('Event Removed', 'The event has been removed.')
    } catch { toast.error('Error', 'Could not delete event.') }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Previous Events</h2>
        <button className="btn btn-orange" onClick={openNew}>+ Add Event</button>
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Image</th><th>Year</th><th>Title</th><th>Tagline</th><th>Highlights URL</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{ev.display_order}</td>
                  <td>
                    {ev.image_url
                      ? <img src={ev.image_url} alt={ev.title} style={{ width: 40, height: 54, borderRadius: 6, objectFit: 'cover' }} />
                      : <div style={{ width: 40, height: 54, borderRadius: 6, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{ev.year}</div>
                    }
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{ev.year}</td>
                  <td style={{ fontWeight: 600 }}>{ev.title}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 200 }}>{ev.tagline}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {ev.highlights_url ? <a href={ev.highlights_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>Link</a> : '—'}
                  </td>
                  <td>
                    <button className="admin-btn-edit" onClick={() => openEdit(ev)}>Edit</button>
                    <button className="admin-btn-del" onClick={() => del(ev.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No events yet. Click "+ Add Event" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">{modal === 'new' ? 'Add Previous Event' : 'Edit Event'}</h3>
            <form onSubmit={e => e.preventDefault()}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Year *</label>
                  <input className="form-input" value={form.year || ''} onChange={e => f('year', e.target.value)} placeholder="2025" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" value={form.display_order || 0} onChange={e => f('display_order', Number(e.target.value))} />
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title || ''} onChange={e => f('title', e.target.value)} placeholder="Outpouring '25" />
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Tagline</label>
                  <input className="form-input" value={form.tagline || ''} onChange={e => f('tagline', e.target.value)} placeholder="A short description of the event" />
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Highlights URL</label>
                  <input className="form-input" value={form.highlights_url || ''} onChange={e => f('highlights_url', e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <ImageUploader value={form.image_url} onChange={url => f('image_url', url)} label="Event Cover Image (Portrait 3:4)" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-navy" onClick={closeModal}>Cancel</button>
                <SaveButton onClick={handleSave} label="Save Event" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
