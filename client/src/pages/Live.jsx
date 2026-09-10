import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'
import SessionRow from '../components/SessionRow'
import LiveChat from '../components/LiveChat'
import { useSiteConfig } from '../hooks/useSiteConfig'

const API_BASE = import.meta.env.VITE_API_URL || ''
const POLL_INTERVAL = 10000

function buildEmbedUrl(videoId) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    origin: window.location.origin,
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

function postPlayerCommand(iframe, func) {
  try {
    iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')
  } catch {}
}

export default function Live() {
  const { config } = useSiteConfig()
  const [status, setStatus] = useState(null)
  const [muted, setMuted] = useState(true)
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const iframeRef = useRef(null)
  const currentVideoId = useRef(null)

  const poll = useCallback(() => {
    fetch(`${API_BASE}/api/live/status`, { cache: 'no-store' })
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {})
  }, [])

  useEffect(() => {
    poll()
    const t = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(t)
  }, [poll])

  // Swap the existing iframe's src imperatively when the video id changes —
  // never remounts the iframe or its siblings, so LiveChat stays mounted.
  useEffect(() => {
    if (!status?.isActive || !status.videoId) {
      currentVideoId.current = null
      return
    }
    if (status.videoId === currentVideoId.current) return
    currentVideoId.current = status.videoId
    setMuted(true) // new src = new autoplay context, browsers require muted-first
    if (iframeRef.current) iframeRef.current.src = buildEmbedUrl(status.videoId)
  }, [status])

  useEffect(() => {
    const dayMap = { '15': 1, '16': 2, '17': 3 }
    const today = new Date().getDate()
    const day = dayMap[String(today)] || 1
    fetch(`${API_BASE}/api/sessions?day=${day}`)
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setLoadingSessions(false) })
      .catch(() => setLoadingSessions(false))
  }, [])

  function handleUnmute() {
    postPlayerCommand(iframeRef.current, 'unMute')
    postPlayerCommand(iframeRef.current, 'playVideo')
    setMuted(false)
  }

  const isActive = !!status?.isActive && !!status?.videoId

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div className="live-layout" style={{ flex: 1, overflow: 'hidden' }}>
        <div className="live-main">
          <div className="live-video-wrap">
            <iframe
              ref={iframeRef}
              title="Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: isActive ? 'block' : 'none' }}
            />

            {isActive && (
              <>
                <div className="live-badge-wrap">
                  <div className="live-red-dot" />
                  LIVE
                </div>
                {muted && (
                  <button className="live-unmute-btn" onClick={handleUnmute}>
                    🔇 Tap to unmute
                  </button>
                )}
              </>
            )}

            {!isActive && (
              <div className="live-offline">
                <svg className="live-flame" width="48" height="60" viewBox="0 0 22 28" fill="none"><path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="#E8622A"/><path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="#C4501F"/></svg>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--white)' }}>
                  {config.streamTitle || 'Holy Spirit Outpouring Conference'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  {status?.statusMessage || 'Reconnecting, please stay on this page'}
                </p>
                <div className="live-connected-note">
                  <span className="live-connected-dot" />
                  You're still connected — this page updates automatically
                </div>
              </div>
            )}
          </div>

          <div className="live-today-schedule">
            <div className="live-schedule-title">Today's Schedule</div>
            {loadingSessions ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div> : (
              <div className="session-list">
                {sessions.map(s => <SessionRow key={s.id} session={s} />)}
              </div>
            )}
          </div>
        </div>

        <LiveChat />
      </div>
    </div>
  )
}
