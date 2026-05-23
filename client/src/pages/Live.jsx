import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import SessionRow from '../components/SessionRow'
import LiveChat from '../components/LiveChat'

export default function Live() {
  const [config, setConfig] = useState({})
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setConfig)
    // Show today's day (1/2/3) based on August 15/16/17 or default to day 1
    const dayMap = { '15': 1, '16': 2, '17': 3 }
    const today = new Date().getDate()
    const day = dayMap[String(today)] || 1
    fetch(`/api/sessions?day=${day}`).then(r => r.json()).then(d => { setSessions(d); setLoading(false) })
  }, [])

  const isLive = config.isLive === 'true' || config.isLive === true
  const hasStream = config.streamUrl?.trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div className="live-layout" style={{ flex: 1, overflow: 'hidden' }}>
        <div className="live-main">
          <div className="live-video-wrap">
            {hasStream ? (
              <>
                <iframe src={config.streamUrl} title="Live Stream" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                {isLive && (
                  <div className="live-badge-wrap">
                    <div className="live-red-dot" />
                    LIVE
                  </div>
                )}
              </>
            ) : (
              <div className="live-offline">
                <span className="live-flame">🔥</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--white)', textAlign: 'center' }}>
                  {config.streamTitle || 'Holy Spirit Outpouring Conference'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {isLive ? 'Stream starting momentarily…' : 'Stream Offline — Service will begin shortly'}
                </p>
              </div>
            )}
          </div>

          <div className="live-today-schedule">
            <div className="live-schedule-title">📅 Today's Schedule</div>
            {loading ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div> : (
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
