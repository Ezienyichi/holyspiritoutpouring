import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API_BASE = import.meta.env.VITE_API_URL || ''
import Footer from '../components/Footer'
import SessionRow from '../components/SessionRow'

const DAYS = [
  { day: 1, label: 'Day 1 — Aug 15' },
  { day: 2, label: 'Day 2 — Aug 16' },
  { day: 3, label: 'Day 3 — Aug 17' },
]

export default function Schedule() {
  const [activeDay, setActiveDay] = useState(1)
  const [sessions, setSessions] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(API_BASE + `/api/sessions?day=${activeDay}`).then(r => r.json()).then(d => { setSessions(d); setLoading(false); setExpanded(null) }).catch(() => setLoading(false))
  }, [activeDay])

  return (
    <>
      <Navbar />
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Programme</span>
          <h1 className="page-banner-title">Conference Schedule</h1>
        </div>
      </div>
      <section className="section section-dark">
        <div className="container">
          <div className="schedule-tabs">
            <div className="schedule-tabs-inner">
              {DAYS.map(t => (
                <button
                  key={t.day}
                  className={`sch-tab${activeDay === t.day ? ' active' : ''}`}
                  onClick={() => setActiveDay(t.day)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? <div className="loading-state">Loading…</div> : (
            <div className="session-list">
              {sessions.map(s => (
                <div key={s.id}>
                  <div onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{ cursor: 'pointer' }}>
                    <SessionRow session={s} />
                  </div>
                  {expanded === s.id && s.description && (
                    <div className="session-expand-panel">
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{s.description}</p>
                      {s.speaker && <p style={{ fontSize: '0.8rem', color: 'var(--orange)', marginTop: '0.5rem', fontWeight: 600 }}>{s.speaker}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
