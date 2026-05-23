import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SpeakerCard from '../components/SpeakerCard'

const CONVENING_TEAM = [
  { id: 'c1', name: 'To Be Announced', role: 'Conference Convener', photoUrl: '' },
  { id: 'c2', name: 'To Be Announced', role: 'Operations Lead', photoUrl: '' },
  { id: 'c3', name: 'To Be Announced', role: 'Creative Director', photoUrl: '' },
]

const SUB_TEAM_HEADS = [
  { id: 's1', name: 'To Be Announced', role: 'Worship Team Lead', photoUrl: '' },
  { id: 's2', name: 'To Be Announced', role: 'Prayer Team Lead', photoUrl: '' },
  { id: 's3', name: 'To Be Announced', role: 'Media Team Lead', photoUrl: '' },
  { id: 's4', name: 'To Be Announced', role: 'Hospitality Lead', photoUrl: '' },
]

const VOLUNTEERS = [
  { id: 'v1', name: 'Volunteer', role: 'Ushering' },
  { id: 'v2', name: 'Volunteer', role: 'Registration' },
  { id: 'v3', name: 'Volunteer', role: 'Prayer Ministry' },
  { id: 'v4', name: 'Volunteer', role: 'Technical Support' },
  { id: 'v5', name: 'Volunteer', role: 'Children Ministry' },
  { id: 'v6', name: 'Volunteer', role: 'Security' },
  { id: 'v7', name: 'Volunteer', role: 'First Aid' },
  { id: 'v8', name: 'Volunteer', role: 'Photography' },
  { id: 'v9', name: 'Volunteer', role: 'Guest Relations' },
  { id: 'v10', name: 'Volunteer', role: 'Worship Support' },
]

const TEAM_COLORS = ['#E8622A','#7C3AED','#0891B2','#059669','#DC2626','#D97706']

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
      <div className="team-card-role">{member.role}</div>
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

export default function Speakers() {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openBioId, setOpenBioId] = useState(null)

  useEffect(() => {
    fetch('/api/speakers').then(r => r.json()).then(d => { setSpeakers(d); setLoading(false) })
  }, [])

  return (
    <>
      <Navbar />
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Anointed Voices</span>
          <h1 className="page-banner-title">Featured Speakers</h1>
        </div>
      </div>

      {/* Convening Team */}
      <section className="section section-dark">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <span className="section-label">Leadership</span>
            <h2 className="section-title">Convening Team</h2>
            <div className="gold-line centered" />
          </div>
          <HoverGrid className="team-grid-convening">
            {CONVENING_TEAM.map((m, i) => <TeamCard key={m.id} member={m} index={i} size="large" />)}
          </HoverGrid>
        </div>
      </section>

      {/* Sub Team Heads */}
      <section className="section section-mid">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <span className="section-label">Coordination</span>
            <h2 className="section-title">Sub Team Heads</h2>
            <div className="gold-line centered" />
          </div>
          <HoverGrid className="team-grid-sub">
            {SUB_TEAM_HEADS.map((m, i) => <TeamCard key={m.id} member={m} index={i} size="regular" />)}
          </HoverGrid>
        </div>
      </section>

      {/* Volunteers */}
      <section className="section section-dark">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <span className="section-label">Serving With Love</span>
            <h2 className="section-title">Our Volunteers</h2>
            <div className="gold-line centered" />
          </div>
          <HoverGrid className="team-grid-volunteers">
            {VOLUNTEERS.map((m, i) => <TeamCard key={m.id} member={m} index={i} size="small" />)}
          </HoverGrid>
        </div>
      </section>

      {/* Featured Speakers */}
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
          {loading ? <div className="loading-state">Loading speakers…</div> : (
            <HoverGrid className="speakers-grid-new">
              {speakers.map((s, i) => (
                <SpeakerCard key={s.id} speaker={s} index={i} openBioId={openBioId} setOpenBioId={setOpenBioId} />
              ))}
            </HoverGrid>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
