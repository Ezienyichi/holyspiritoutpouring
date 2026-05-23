function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#E8622A','#7C3AED','#0891B2','#059669','#DC2626','#D97706']

export default function SpeakerCard({ speaker, index = 0 }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  return (
    <div className="speaker-card">
      <div className="speaker-avatar" style={{ borderColor: color }}>
        {speaker.photoUrl
          ? <img src={speaker.photoUrl} alt={speaker.name} />
          : <span style={{ color }}>{getInitials(speaker.name)}</span>}
      </div>
      <div className="speaker-name">{speaker.name}</div>
      <div className="speaker-title">{speaker.title}{speaker.church ? ` · ${speaker.church}` : ''}</div>
      {speaker.topic && <span className="speaker-topic">"{speaker.topic}"</span>}
    </div>
  )
}
