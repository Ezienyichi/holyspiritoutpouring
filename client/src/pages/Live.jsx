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
                <svg className="live-flame" width="48" height="60" viewBox="0 0 22 28" fill="none"><path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="#E8622A"/><path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="#C4501F"/></svg>
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
            <div className="live-schedule-title">Today's Schedule</div>
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
