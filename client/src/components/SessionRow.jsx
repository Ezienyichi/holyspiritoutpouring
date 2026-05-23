const TYPE_ICONS = { worship: '🎵', teaching: '📖', preaching: '🎙️', prayer: '🙏', workshop: '👥', default: '✨' }

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
        <span className="session-chevron">›</span>
      </div>
    </div>
  )
}
