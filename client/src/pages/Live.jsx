import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import SessionRow from '../components/SessionRow'
import LiveChat from '../components/LiveChat'

const BASE_URL = import.meta.env.VITE_API_URL || ''

function getEmbedUrl(config) {
  if (config.stream_url) {
    const url = config.stream_url
    const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0&modestbranding=1`
    const liveMatch = url.match(/youtube\.com\/live\/([^?]+)/)
    if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&rel=0&modestbranding=1`
    const shortMatch = url.match(/youtu\.be\/([^?]+)/)
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0&modestbranding=1`
    if (url.includes('youtube.com/embed/')) return url
    return url
  }
  const channelId = config.youtube_channel_id || 'UCxxxxxxxxxxxxxxxxxxxxxxxxx'
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0&modestbranding=1`
}

export default function Live() {
  const [config, setConfig] = useState({})
  const [isLive, setIsLive] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    function fetchConfig() {
      fetch(`${BASE_URL}/api/config`)
        .then(r => r.ok ? r.json() : {})
        .then(d => {
          setConfig(d || {})
          setIsLive(d?.is_live == 1)
        })
        .catch(() => {})
    }
    fetchConfig()
    const interval = setInterval(fetchConfig, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const dayMap = { '15': 1, '16': 2, '17': 3 }
    const today = new Date().getDate()
    const day = dayMap[String(today)] || 1
    fetch(`${BASE_URL}/api/sessions?day=${day}`)
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setLoadingSessions(false) })
      .catch(() => setLoadingSessions(false))
  }, [])

  const embedUrl = getEmbedUrl(config)

  return (
    <div className="live-page-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div className="live-layout" style={{ flex: 1, overflow: 'hidden' }}>
        <div className="live-main">

          {/* Video player */}
          <div style={{
            width: '100%',
            background: '#000000',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '16/9'
          }}>
            {isLive && (
              <div style={{
                position: 'absolute', top: '16px', left: '16px', zIndex: 10,
                background: '#c90505', color: 'white', fontSize: '11px',
                fontWeight: '800', padding: '5px 14px', borderRadius: '4px',
                letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: 'white', animation: 'blink 1s ease-in-out infinite alternate'
                }} />
                LIVE
              </div>
            )}

            <iframe
              key={embedUrl}
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title={config.stream_title || 'Holy Spirit Outpouring Live Stream'}
            />

            {!isLive && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(13,27,42,0.92)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '20px', zIndex: 5
              }}>
                <div style={{
                  width: '80px', height: '80px', background: '#FF0000',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', opacity: 0.85
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <div style={{ textAlign: 'center', padding: '0 2rem' }}>
                  <div style={{
                    fontSize: '20px', fontWeight: '700', color: 'white',
                    marginBottom: '8px', fontFamily: 'Playfair Display, serif'
                  }}>
                    {config.stream_title || 'Stream Starting Soon'}
                  </div>
                  <div style={{
                    fontSize: '14px', color: 'rgba(255,255,255,0.5)',
                    lineHeight: '1.6', marginBottom: '20px'
                  }}>
                    The livestream will begin when the service starts.
                    Subscribe to our YouTube channel to get notified.
                  </div>
                  <a
                    href={config.youtube_channel_url || 'https://www.youtube.com/@holyspiritoutpouring-o6s'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '10px',
                      background: '#FF0000', color: 'white', textDecoration: 'none',
                      borderRadius: '8px', padding: '12px 24px',
                      fontSize: '14px', fontWeight: '700'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" style={{ fill: 'white' }} />
                    </svg>
                    Subscribe on YouTube
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="live-today-schedule">
            <div className="live-schedule-title">Today's Schedule</div>
            {loadingSessions
              ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div>
              : (
                <div className="session-list">
                  {sessions.map(s => <SessionRow key={s.id} session={s} />)}
                </div>
              )
            }
          </div>
        </div>

        <LiveChat />
      </div>
    </div>
  )
}
