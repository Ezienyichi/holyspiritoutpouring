import { useState } from 'react'

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#E8622A','#7C3AED','#0891B2','#059669','#DC2626','#D97706']

export default function SpeakerCard({ speaker, index = 0, openBioId, setOpenBioId }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const bioOpen = openBioId === speaker.id

  function toggleBio(e) {
    e.stopPropagation()
    setOpenBioId(bioOpen ? null : speaker.id)
  }

  return (
    <div className="speaker-card-new">
      <div className="speaker-card-img">
        {speaker.photoUrl ? (
          <img src={speaker.photoUrl} alt={speaker.name} loading="lazy" />
        ) : (
          <div className="speaker-card-avatar-fallback" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, borderBottom: `3px solid ${color}` }}>
            <span style={{ color, fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700 }}>
              {getInitials(speaker.name)}
            </span>
          </div>
        )}
        <div className="speaker-card-text-overlay">
          <div className="speaker-card-name">{speaker.name}</div>
          <div className="speaker-card-title-line">{speaker.title}{speaker.church ? ` · ${speaker.church}` : ''}</div>
          {speaker.topic && <div className="speaker-card-topic">"{speaker.topic}"</div>}
        </div>
      </div>

      {speaker.bio && (
        <>
          <button
            className={`speaker-read-bio-btn${bioOpen ? ' open' : ''}`}
            onClick={toggleBio}
          >
            {bioOpen ? 'Close Bio' : 'Read Bio'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div className={`speaker-bio-panel${bioOpen ? ' open' : ''}`}>
            <p>{speaker.bio}</p>
          </div>
        </>
      )}
    </div>
  )
}
