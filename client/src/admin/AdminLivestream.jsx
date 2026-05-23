import { useState, useEffect } from 'react'
import { api } from '../api'

export default function AdminLivestream() {
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => { setConfig(d); setLoading(false) })
  }, [])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    await api.put('/config', {
      isLive: config.isLive,
      streamUrl: config.streamUrl,
      streamTitle: config.streamTitle,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function toggleLive() {
    const next = config.isLive === 'true' || config.isLive === true ? 'false' : 'true'
    setSaving(true)
    await api.put('/config', { isLive: next })
    setConfig(c => ({ ...c, isLive: next }))
    setSaving(false)
  }

  if (loading) return <div className="loading-state">Loading…</div>

  const isLive = config.isLive === 'true' || config.isLive === true

  return (
    <div>
      <h2 className="admin-page-title">Livestream Control</h2>
      {saved && <div className="alert alert-ok" style={{ marginBottom: '1.5rem' }}>Settings saved!</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 2rem', gap: '1.5rem' }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: isLive ? 'rgba(244,68,68,0.15)' : 'rgba(100,116,139,0.15)',
            border: `3px solid ${isLive ? '#f44444' : 'var(--navy-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem',
            boxShadow: isLive ? '0 0 40px rgba(244,68,68,0.4)' : 'none',
            transition: 'all 0.3s',
          }}>
            {isLive ? '🔴' : '⚫'}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: isLive ? '#f44444' : 'var(--text-muted)', fontWeight: 700 }}>
              {isLive ? 'LIVE' : 'OFFLINE'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {isLive ? 'Stream is live and visible to viewers' : 'Stream is offline'}
            </div>
          </div>
          <button
            className="btn"
            style={{
              background: isLive ? '#f44444' : 'var(--orange)',
              color: 'white', border: 'none', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 700,
              minWidth: 200, justifyContent: 'center',
            }}
            onClick={toggleLive}
            disabled={saving}
          >
            {saving ? 'Updating…' : isLive ? '■ End Stream' : '● Go Live'}
          </button>
        </div>

        <div className="admin-card">
          <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', fontSize: '1rem' }}>Stream Settings</h3>
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Stream URL (YouTube/Vimeo embed)</label>
              <input
                className="form-input"
                placeholder="https://www.youtube.com/embed/..."
                value={config.streamUrl || ''}
                onChange={e => setConfig(c => ({ ...c, streamUrl: e.target.value }))}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                Use the embed URL (with /embed/) not the watch URL
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Stream Title</label>
              <input
                className="form-input"
                placeholder="Holy Spirit Outpouring Conference"
                value={config.streamTitle || ''}
                onChange={e => setConfig(c => ({ ...c, streamTitle: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-orange" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>

      {config.streamUrl && (
        <div className="admin-card">
          <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '1rem' }}>Stream Preview</h3>
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: 'var(--navy)' }}>
            <iframe
              src={config.streamUrl}
              title="Stream Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
