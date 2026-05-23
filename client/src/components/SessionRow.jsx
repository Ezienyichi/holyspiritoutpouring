const TYPE_ICONS = {
  worship: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  teaching: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  preaching: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  ),
  prayer: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
    </svg>
  ),
  workshop: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  default: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
}

function isNowSession(time) {
  const now = new Date()
  const [timePart, ampm] = time.split(' ')
  if (!timePart || !ampm) return false
  let [h, m] = timePart.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  const sessionStart = new Date()
  sessionStart.setHours(h, m || 0, 0, 0)
  const sessionEnd = new Date(sessionStart.getTime() + 90 * 60000)
  return now >= sessionStart && now < sessionEnd
}

export default function SessionRow({ session }) {
  const icon = TYPE_ICONS[session.type] || TYPE_ICONS.default
  const live = session.isCurrentlyLive === 1 || isNowSession(session.time)
  return (
    <div className="session-row">
      <div className="session-time">{session.time}</div>
      <div className="session-icon">{icon}</div>
      <div className="session-info">
        <div className="session-title-text">{session.title}</div>
        {session.speaker && <div className="session-speaker">{session.speaker}</div>}
      </div>
      <div className="session-right">
        {live && <span className="now-badge">NOW</span>}
        <svg className="session-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  )
}
