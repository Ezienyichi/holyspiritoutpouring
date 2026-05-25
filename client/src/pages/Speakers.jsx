import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SpeakerCard from '../components/SpeakerCard'

const API_BASE = import.meta.env.VITE_API_URL || ''

const TEAM_COLORS = ['#E8622A','#7C3AED','#0891B2','#059669','#DC2626','#D97706']

function SubTeamCard({ member, index }) {
  const color = TEAM_COLORS[index % TEAM_COLORS.length]
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="sub-team-card">
      <div className="sub-team-card-img">
        {member.photoUrl
          ? <img src={member.photoUrl} alt={member.name} />
          : <div className="sub-team-card-fallback" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
              <span style={{ color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem' }}>{initials}</span>
            </div>
        }
      </div>
      <div className="sub-team-card-body">
        <div className="sub-team-card-name">{member.name}</div>
        <div className="sub-team-card-role">{member.title || member.role}</div>
      </div>
    </div>
  )
}

function TeamCard({ member, index, size = 'regular' }) {
  const color = TEAM_COLORS[index % TEAM_COLORS.length]
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`team-card team-card-${size}`}>
      <div className="team-card-avatar" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, border: `2px solid ${color}` }}>
        {member.photoUrl
          ? <img src={member.photoUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : <span style={{ color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size === 'small' ? '1rem' : '1.4rem' }}>{initials}</span>
        }
      </div>
      <div className="team-card-name">{member.name}</div>
      <div className="team-card-role">{member.title || member.role}</div>
    </div>
  )
}

function HoverGrid({ children, className = '' }) {
  const gridRef = useRef(null)

  function handleEnter(e) {
    const card = e.currentTarget
    gridRef.current?.classList.add('is-hovered')
    card.classList.add('card-active')
  }

  function handleLeave(e) {
    const card = e.currentTarget
    gridRef.current?.classList.remove('is-hovered')
    card.classList.remove('card-active')
  }

  return (
    <div ref={gridRef} className={`cards-grid ${className}`}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
              {child}
            </div>
          ))
        : children}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
      {message}
    </div>
  )
}

export default function Speakers() {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openBioId, setOpenBioId] = useState(null)

  useEffect(() => {
    fetch(API_BASE + '/api/speakers')
      .then(r => r.json())
      .then(d => { setSpeakers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const ministers = speakers.filter(s => !s.role || s.role === 'minister')
  const conveningTeam = speakers.filter(s => s.role === 'convening_team')
  const subTeamHeads = speakers.filter(s => s.role === 'sub_team_head')
  const volunteers = speakers.filter(s => s.role === 'volunteer')

  return (
    <>
      <Navbar />
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Anointed Voices</span>
          <h1 className="page-banner-title">Featured Speakers</h1>
        </div>
      </div>

      {/* Featured Speakers / Ministers */}
      <section className="section section-mid">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <span className="section-label">Ministers</span>
            <h2 className="section-title">Featured Speakers</h2>
            <div className="gold-line centered" />
            <p className="section-subtitle centered" style={{ marginTop: '0.75rem' }}>
              God's chosen vessels bringing prophetic insight, powerful teaching, and Spirit-filled worship.
            </p>
          </div>
          {loading ? (
            <div className="loading-state">Loading speakers…</div>
          ) : ministers.length === 0 ? (
            <EmptyState message="Speakers will be announced soon. Check back closer to the conference." />
          ) : (
            <HoverGrid className="speakers-grid-new">
              {ministers.map((s, i) => (
                <SpeakerCard key={s.id} speaker={s} index={i} openBioId={openBioId} setOpenBioId={setOpenBioId} />
              ))}
            </HoverGrid>
          )}
        </div>
      </section>

      {/* Convening Team — only shown when populated */}
      {(loading || conveningTeam.length > 0) && (
        <section className="section section-dark">
          <div className="container">
            <div className="text-center" style={{ marginBottom: '2.5rem' }}>
              <span className="section-label">Leadership</span>
              <h2 className="section-title">Convening Team</h2>
              <div className="gold-line centered" />
            </div>
            {loading ? (
              <div className="loading-state">Loading…</div>
            ) : (
              <HoverGrid className="team-grid-convening">
                {conveningTeam.map((m, i) => <TeamCard key={m.id} member={m} index={i} size="large" />)}
              </HoverGrid>
            )}
          </div>
        </section>
      )}

      {/* Sub Team Heads — only shown when populated */}
      {(loading || subTeamHeads.length > 0) && (
        <section className="section section-mid">
          <div className="container">
            <div className="text-center" style={{ marginBottom: '2.5rem' }}>
              <span className="section-label">Coordination</span>
              <h2 className="section-title">Sub Team Heads</h2>
              <div className="gold-line centered" />
            </div>
            {loading ? (
              <div className="loading-state">Loading…</div>
            ) : (
              <HoverGrid className="team-grid-sub-6">
                {subTeamHeads.map((m, i) => <SubTeamCard key={m.id} member={m} index={i} />)}
              </HoverGrid>
            )}
          </div>
        </section>
      )}

      {/* Volunteers — only shown when populated */}
      {(loading || volunteers.length > 0) && (
        <section className="section section-dark">
          <div className="container">
            <div className="text-center" style={{ marginBottom: '2.5rem' }}>
              <span className="section-label">Serving With Love</span>
              <h2 className="section-title">Our Volunteers</h2>
              <div className="gold-line centered" />
            </div>
            {loading ? (
              <div className="loading-state">Loading…</div>
            ) : (
              <HoverGrid className="team-grid-volunteers">
                {volunteers.map((m, i) => <TeamCard key={m.id} member={m} index={i} size="small" />)}
              </HoverGrid>
            )}
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
