import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import { useToast } from '../context/ToastContext'
import SaveButton from '../components/SaveButton'

function extractYouTubeId(input) {
  if (!input) return null
  const trimmed = input.trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed

  let url
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '')

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0]
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  }
  if (host === 'youtube.com' || host === 'music.youtube.com') {
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v')
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    const liveMatch = url.pathname.match(/^\/live\/([A-Za-z0-9_-]{11})/)
    if (liveMatch) return liveMatch[1]
    const embedMatch = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})/)
    if (embedMatch) return embedMatch[1]
  }
  return null
}

const EMPTY_LIVE = { videoId: '', isActive: false, statusMessage: '', updatedAt: null }

export default function AdminLive() {
  const toast = useToast()
  const [live, setLive] = useState(EMPTY_LIVE)
  const [loading, setLoading] = useState(true)
  const [draftUrl, setDraftUrl] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [goingLive, setGoingLive] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    api.get('/live/status')
      .then(d => {
        setLive(d)
        if (!initialized.current) {
          setDraftUrl(d.videoId || '')
          setDraftMessage(d.statusMessage || '')
          initialized.current = true
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const previewId = extractYouTubeId(draftUrl)

  async function goLive() {
    setError('')
    if (!extractYouTubeId(draftUrl)) {
      setError("Couldn't read a video ID from that link. Paste a youtube.com/watch, youtu.be, /live/, or /embed/ link, or the bare video ID.")
      return
    }
    setGoingLive(true)
    try {
      const updated = await api.post('/live/update', { url: draftUrl.trim(), isActive: true, statusMessage: draftMessage })
      setLive(updated)
      setDraftUrl(updated.videoId)
      toast.success('You Are Live', 'Viewers are now seeing this stream.')
    } catch (e) {
      setError(e.message || 'Could not go live')
    } finally {
      setGoingLive(false)
    }
  }

  async function endStream() {
    setEnding(true)
    try {
      const updated = await api.post('/live/update', { isActive: false, statusMessage: draftMessage })
      setLive(updated)
      toast.info('Stream Ended', 'Viewers now see the offline message.')
    } catch (e) {
      toast.error('Error', e.message || 'Could not end stream')
    } finally {
      setEnding(false)
    }
  }

  async function saveMessageOnly() {
    const updated = await api.post('/live/update', { statusMessage: draftMessage })
    setLive(updated)
  }

  if (loading) return <div className="loading-state">Loading…</div>

  return (
    <div>
      <h2 className="admin-page-title">Live Stream Control</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="admin-card">
          <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '1rem' }}>Paste Stream Link</h3>
          <div className="form-group">
            <label className="form-label">YouTube URL or Video ID</label>
            <input
              className="form-input"
              placeholder="https://www.youtube.com/watch?v=… or bare video ID"
              value={draftUrl}
              onChange={e => setDraftUrl(e.target.value)}
              autoFocus
              style={{ fontSize: '1rem' }}
            />
          </div>
          {error && (
            <div style={{ background: 'rgba(201,5,5,0.15)', border: '1px solid rgba(201,5,5,0.3)', borderRadius: 8, padding: '0.6rem 0.9rem', color: '#ff6b6b', fontSize: 13, marginBottom: '0.75rem' }}>
              {error}
            </div>
          )}
          <button
            className="btn"
            onClick={goLive}
            disabled={goingLive || !draftUrl.trim()}
            style={{ background: 'var(--orange)', color: 'white', border: 'none', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 700, width: '100%', justifyContent: 'center', marginTop: '0.5rem', cursor: goingLive ? 'not-allowed' : 'pointer' }}
          >
            {goingLive ? 'Going Live…' : '● Go Live With This Link'}
          </button>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.6rem' }}>
            Paste any YouTube link (watch, youtu.be, /live/, /embed/) or a bare video ID, then click once — viewers switch immediately, no other steps needed.
          </p>
        </div>

        <div className="admin-card">
          <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '1rem' }}>Preview Before Publishing</h3>
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: 'var(--navy)' }}>
            {previewId ? (
              <iframe
                key={previewId}
                src={`https://www.youtube.com/embed/${previewId}?mute=1`}
                title="Stream preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                Paste a link to preview it here before going live
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: '1rem', margin: 0 }}>What Viewers See Right Now</h3>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', marginTop: 4, flexShrink: 0,
              background: live.isActive ? '#f44444' : 'var(--navy-border)',
              boxShadow: live.isActive ? '0 0 12px rgba(244,68,68,0.7)' : 'none',
            }} />
            <div>
              <div style={{ fontWeight: 700, color: live.isActive ? '#f44444' : 'var(--text-muted)' }}>
                {live.isActive ? 'LIVE' : 'OFFLINE'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {live.isActive
                  ? `Playing youtube.com/watch?v=${live.videoId}`
                  : `Showing message: "${live.statusMessage || 'Reconnecting, please stay on this page'}"`}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Last changed: {live.updatedAt ? new Date(live.updatedAt).toLocaleString() : 'never'}
          </div>
          {live.isActive && (
            <button
              className="btn"
              onClick={endStream}
              disabled={ending}
              style={{ background: '#f44444', color: 'white', border: 'none', padding: '0.6rem 1.5rem', fontWeight: 700, alignSelf: 'flex-start', cursor: ending ? 'not-allowed' : 'pointer' }}
            >
              {ending ? 'Ending…' : '■ End Stream'}
            </button>
          )}
        </div>

        <div className="admin-card">
          <h3 style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '1rem' }}>Off-Air Message</h3>
          <div className="form-group">
            <label className="form-label">Shown to viewers while not live</label>
            <input
              className="form-input"
              placeholder="Reconnecting, please stay on this page"
              value={draftMessage}
              onChange={e => setDraftMessage(e.target.value)}
            />
          </div>
          <SaveButton onClick={saveMessageOnly} label="Save Message" />
        </div>
      </div>
    </div>
  )
}
