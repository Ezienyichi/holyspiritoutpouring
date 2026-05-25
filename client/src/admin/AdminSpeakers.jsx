import { useState, useEffect, useRef } from 'react'
import { api, getToken } from '../api'
import { useToast } from '../context/ToastContext'

const API_BASE = import.meta.env.VITE_API_URL || ''

const EMPTY = { name: '', title: '', church: '', topic: '', bio: '', photoUrl: '', instagram: '', twitter: '', displayOrder: 0, role: 'minister' }

const ROLES = [
  { value: 'minister', label: 'Featured Speaker / Minister' },
  { value: 'convening_team', label: 'Convening Team' },
  { value: 'sub_team_head', label: 'Sub Team Head' },
  { value: 'volunteer', label: 'Volunteer' },
]

function PhotoUploader({ value, onChange }) {
  const [tab, setTab] = useState('upload')
  const [preview, setPreview] = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  async function handleFile(file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setUploadErr('File too large — max 5MB'); return }
    setUploadErr('')
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
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
    const url = e.target.value
    onChange(url)
    setPreview(url)
  }

  return (
    <div className="form-group" style={{ gridColumn: '1/-1', margin: 0 }}>
      <label className="form-label">Speaker Photo</label>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
        {['upload','url'].map(t => (
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
            justifyContent: 'center', cursor: 'pointer', background: dragOver ? 'rgba(232,98,42,0.05)' : 'var(--navy)',
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
            onBlur={onUrlChange}
            style={{ flex: 1 }}
          />
          {preview && (
            <img src={preview} alt="preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              onError={e => e.target.style.display = 'none'} />
          )}
        </div>
      )}
      {uploadErr && <div style={{ color: '#f44', fontSize: '0.78rem', marginTop: '0.3rem' }}>{uploadErr}</div>}
    </div>
  )
}

export default function AdminSpeakers() {
  const toast = useToast()
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const d = await api.get('/speakers')
    setSpeakers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setModal('new') }
  function openEdit(s) { setForm({ ...s }); setModal(s.id) }
  function closeModal() { setModal(null) }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    if (modal === 'new') {
      await api.post('/speakers', form)
      toast.success('Speaker Added', `${form.name} has been added to the speakers list.`)
    } else {
      await api.put(`/speakers/${modal}`, form)
      toast.success('Speaker Updated', 'Speaker details have been saved successfully.')
    }
    setSaving(false)
    setModal(null)
    load()
  }

  async function del(id) {
    if (!confirm('Delete this speaker?')) return
    await api.del(`/speakers/${id}`)
    toast.warning('Speaker Removed', 'The speaker has been removed from the website.')
    load()
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Speakers</h2>
        <button className="btn btn-orange" onClick={openNew}>+ Add Speaker</button>
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Photo</th><th>Name</th><th>Title / Church</th><th>Role</th><th>Topic</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {speakers.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{s.displayOrder}</td>
                  <td>
                    {s.photoUrl
                      ? <img src={s.photoUrl} alt={s.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1rem' }}>{s.name?.[0]}</div>
                    }
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.title}<br />{s.church}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--orange)' }}>{ROLES.find(r => r.value === (s.role || 'minister'))?.label || s.role}</td>
                  <td style={{ fontSize: '0.85rem' }}>{s.topic}</td>
                  <td>
                    <button className="admin-btn-edit" onClick={() => openEdit(s)}>Edit</button>
                    <button className="admin-btn-del" onClick={() => del(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">{modal === 'new' ? 'Add Speaker' : 'Edit Speaker'}</h3>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['name','Name *'],['title','Title'],['church','Church/Ministry'],['topic','Session Topic']].map(([k,lbl]) => (
                  <div className="form-group" key={k} style={{ margin: 0 }}>
                    <label className="form-label">{lbl}</label>
                    <input className="form-input" value={form[k]||''} onChange={e=>f(k,e.target.value)} required={k==='name'} />
                  </div>
                ))}
                <PhotoUploader value={form.photoUrl} onChange={url => f('photoUrl', url)} />
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Instagram</label>
                  <input className="form-input" value={form.instagram||''} onChange={e=>f('instagram',e.target.value)} placeholder="@handle" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Twitter</label>
                  <input className="form-input" value={form.twitter||''} onChange={e=>f('twitter',e.target.value)} placeholder="@handle" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" value={form.displayOrder||0} onChange={e=>f('displayOrder',Number(e.target.value))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Role / Category</label>
                  <select className="form-select" value={form.role||'minister'} onChange={e=>f('role',e.target.value)}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio||''} onChange={e=>f('bio',e.target.value)} rows={3} />
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
