import { useState, useEffect, useRef } from 'react'
import { api, getToken } from '../api'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function AdminMedia() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('url')
  const [urlForm, setUrlForm] = useState({ url: '', type: 'photo', caption: '', title: '' })
  const [ytForm, setYtForm] = useState({ youtubeUrl: '', title: '', caption: '' })
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const fileRef = useRef()

  async function loadItems() {
    const d = await api.get('/media')
    setItems(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { loadItems() }, [])

  async function addByUrl(e) {
    e.preventDefault()
    if (!urlForm.url.trim()) return
    setAdding(true)
    await api.post('/media', urlForm)
    setUrlForm({ url: '', type: 'photo', caption: '', title: '' })
    setAdding(false)
    loadItems()
  }

  function extractYouTubeId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/)
    return m ? m[1] : null
  }

  async function addYouTube(e) {
    e.preventDefault()
    const id = extractYouTubeId(ytForm.youtubeUrl)
    if (!id) { alert('Invalid YouTube URL'); return }
    setAdding(true)
    const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    await api.post('/media', {
      title: ytForm.title,
      url: thumbnailUrl,
      thumbnailUrl,
      youtubeUrl: ytForm.youtubeUrl,
      type: 'video',
      caption: ytForm.caption || ytForm.title,
    })
    setYtForm({ youtubeUrl: '', title: '', caption: '' })
    setAdding(false)
    loadItems()
  }

  async function uploadFile(file) {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(API_BASE + '/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Upload failed'); return }
      await api.post('/media', {
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: data.url,
        type: file.type.startsWith('video') ? 'video' : 'photo',
        caption: '',
      })
      loadItems()
    } finally {
      setUploading(false)
    }
  }

  async function del(id) {
    if (!confirm('Delete this media item?')) return
    await api.del(`/media/${id}`)
    loadItems()
  }

  const ytPreviewId = ytForm.youtubeUrl ? extractYouTubeId(ytForm.youtubeUrl) : null

  return (
    <div>
      <h2 className="admin-page-title">Media Gallery</h2>

      <div className="admin-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div className="media-tabs">
          <button className={`media-tab-btn${tab === 'url' ? ' active' : ''}`} onClick={() => setTab('url')}>
            Add by URL
          </button>
          <button className={`media-tab-btn${tab === 'youtube' ? ' active' : ''}`} onClick={() => setTab('youtube')}>
            YouTube Video
          </button>
          <button className={`media-tab-btn${tab === 'upload' ? ' active' : ''}`} onClick={() => setTab('upload')}>
            Upload File
          </button>
        </div>

        {tab === 'url' && (
          <form onSubmit={addByUrl}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="Media title" value={urlForm.title} onChange={e => setUrlForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Type</label>
                <select className="form-select" value={urlForm.type} onChange={e => setUrlForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ margin: '0 0 0.75rem' }}>
              <label className="form-label">Image URL *</label>
              <input className="form-input" placeholder="https://…" value={urlForm.url} onChange={e => setUrlForm(f => ({ ...f, url: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: '0 0 1rem' }}>
              <label className="form-label">Caption</label>
              <input className="form-input" placeholder="Optional caption" value={urlForm.caption} onChange={e => setUrlForm(f => ({ ...f, caption: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-orange" disabled={adding}>{adding ? 'Adding…' : '+ Add Media'}</button>
          </form>
        )}

        {tab === 'youtube' && (
          <form onSubmit={addYouTube}>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">YouTube URL *</label>
              <input className="form-input" placeholder="https://www.youtube.com/watch?v=…" value={ytForm.youtubeUrl} onChange={e => setYtForm(f => ({ ...f, youtubeUrl: e.target.value }))} required />
            </div>
            {ytPreviewId && (
              <div style={{ marginBottom: '0.75rem' }}>
                <img
                  src={`https://img.youtube.com/vi/${ytPreviewId}/maxresdefault.jpg`}
                  alt="Thumbnail preview"
                  style={{ height: 90, borderRadius: 8, objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Video title" value={ytForm.title} onChange={e => setYtForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Caption</label>
                <input className="form-input" placeholder="Optional caption" value={ytForm.caption} onChange={e => setYtForm(f => ({ ...f, caption: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-orange" disabled={adding}>{adding ? 'Adding…' : '+ Add Video'}</button>
          </form>
        )}

        {tab === 'upload' && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={e => uploadFile(e.target.files[0])}
            />
            <div
              className={`upload-zone${dragOver ? ' drag-over' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]) }}
            >
              <div className="upload-zone-icon">☁️</div>
              {uploading
                ? <div className="upload-zone-text">Uploading…</div>
                : <div className="upload-zone-text"><strong>Click to choose</strong> or drag and drop a file here</div>
              }
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Images and videos supported</div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
              Requires Cloudinary env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
            </p>
          </div>
        )}
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'var(--navy-card)', border: '1px solid var(--navy-border)' }}>
              {item.type === 'photo'
                ? <img src={item.url} alt={item.caption} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
                : (
                  <div style={{ position: 'relative', width: '100%', height: 150 }}>
                    <img src={item.thumbnailUrl || item.url} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                  </div>
                )
              }
              <div style={{ padding: '0.6rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.caption || item.title || item.url}
                </div>
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
