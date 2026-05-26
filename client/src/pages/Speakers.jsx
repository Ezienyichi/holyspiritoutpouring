import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SpeakerCard from '../components/SpeakerCard'

const API_BASE = import.meta.env.VITE_API_URL || ''

/* ── All-but-me blur hover grid ─────────────────── */
function HoverGrid({ children, className = '' }) {
  const gridRef = useRef(null)
  function handleEnter(e) {
    gridRef.current?.classList.add('is-hovered')
    e.currentTarget.classList.add('card-active')
  }
  function handleLeave(e) {
    gridRef.current?.classList.remove('is-hovered')
    e.currentTarget.classList.remove('card-active')
  }
  const items = Array.isArray(children) ? children : [children]
  return (
    <div ref={gridRef} className={`cards-grid ${className}`}>
      {items.map((child, i) => (
        <div key={i} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>{child}</div>
      ))}
    </div>
  )
}

/* ── PersonCard — used for Hosts, Mgmt, Sub Team ── */
function PersonCard({ member, index, imgHeight = 240, namePx = 15, rolePx = 12, openBioId, setOpenBioId }) {
  const initials = (member.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const bioOpen = openBioId === (member.id || index)
  return (
    <div
      style={{
        borderRadius: 14, overflow: 'hidden', border: '1px solid #EEEEEE', background: '#F8F8F8',
        transition: 'all 0.25s', cursor: member.bio ? 'pointer' : 'default',
      }}
      className="team-person-card"
      onClick={() => member.bio && setOpenBioId && setOpenBioId(bioOpen ? null : (member.id || index))}
    >
      <div style={{ height: imgHeight, background: '#EEEEEE', overflow: 'hidden', position: 'relative' }}>
        {member.photoUrl || member.photo_url ? (
          <img
            src={member.photoUrl || member.photo_url}
            alt={member.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F0F0' }}>
            <span style={{ fontSize: imgHeight * 0.22, fontWeight: 700, color: '#BBBBBB', fontFamily: 'var(--font-display)' }}>{initials}</span>
          </div>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: namePx, fontWeight: 700, color: '#040102', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>{member.name}</div>
        <div style={{ fontSize: rolePx, color: '#c90505', fontWeight: 600, marginTop: 4 }}>{member.title || member.ministry_role || member.role_label || ''}</div>
        {member.bio && (
          <div style={{ fontSize: 11, color: '#999', marginTop: 6, cursor: 'pointer' }}>{bioOpen ? '▲ Hide bio' : '▼ Read bio'}</div>
        )}
      </div>
      {bioOpen && member.bio && (
        <div style={{ padding: '0 16px 16px', fontSize: 13, color: '#555', lineHeight: 1.6, borderTop: '1px solid #EEEEEE', paddingTop: 12 }}>{member.bio}</div>
      )}
    </div>
  )
}

/* ── VolunteerCard — compact ─────────────────────── */
function VolunteerCard({ member, index }) {
  const initials = (member.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      style={{
        borderRadius: 10, overflow: 'hidden', border: '1px solid #EEEEEE', background: '#F8F8F8',
        transition: 'all 0.2s',
      }}
      className="team-volunteer-card"
    >
      <div style={{ height: 140, background: '#EEEEEE', overflow: 'hidden' }}>
        {member.photoUrl || member.photo_url ? (
          <img src={member.photoUrl || member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F0F0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#BBBBBB', fontFamily: 'var(--font-display)' }}>{initials}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#040102', lineHeight: 1.3 }}>{member.name}</div>
        <div style={{ fontSize: 11, color: '#c90505', fontWeight: 600, marginTop: 3 }}>{member.title || member.role_label || ''}</div>
      </div>
    </div>
  )
}

/* ── Section divider ─────────────────────────────── */
function Divider() {
  return <div style={{ height: 1, background: '#EEEEEE', margin: '60px 0' }} />
}

/* ── PLACEHOLDER seed data (shown until admin adds real members) ── */
const SEED_CONVENERS = [
  { id: 's-c1', name: 'Convener Name 1', title: 'Lead Convener', photoUrl: '' },
  { id: 's-c2', name: 'Convener Name 2', title: 'Co-Convener', photoUrl: '' },
  { id: 's-c3', name: 'Host Name 1', title: 'Conference Host', photoUrl: '' },
  { id: 's-c4', name: 'Host Name 2', title: 'Conference Host', photoUrl: '' },
  { id: 's-c5', name: 'Host Name 3', title: 'Programme Host', photoUrl: '' },
]

const SEED_MANAGEMENT = [
  { id: 's-m1', name: 'Manager Name 1', title: 'Conference Director', photoUrl: '' },
  { id: 's-m2', name: 'Manager Name 2', title: 'Operations Manager', photoUrl: '' },
  { id: 's-m3', name: 'Manager Name 3', title: 'Creative Director', photoUrl: '' },
  { id: 's-m4', name: 'Manager Name 4', title: 'Finance Manager', photoUrl: '' },
  { id: 's-m5', name: 'Manager Name 5', title: 'Communications Manager', photoUrl: '' },
]

const SUB_ROLES = ['Worship Lead','Prayer Lead','Media Lead','Hospitality Lead','Ushering Lead','Creative Arts Lead','Security Lead','Registration Lead','Children Ministry Lead','Welfare Lead','Transport Lead','Communications Lead']
const SEED_SUBTEAM = SUB_ROLES.map((r, i) => ({ id: `s-s${i+1}`, name: `Sub Team Head ${i+1}`, title: r, photoUrl: '' }))

const VOL_ROLES = ['Worship Team','Prayer Team','Media Team','Hospitality Team','Ushering Team','Registration Team','Children Ministry','Welfare Team','Transport Team','Creative Team','Security Team','Communications Team']
const SEED_VOLUNTEERS = Array.from({ length: 30 }, (_, i) => ({ id: `s-v${i+1}`, name: `Volunteer ${i+1}`, title: VOL_ROLES[i % VOL_ROLES.length], photoUrl: '' }))

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
  const conveners = speakers.filter(s => s.role === 'convener')
  const management = speakers.filter(s => s.role === 'management')
  const subTeamHeads = speakers.filter(s => s.role === 'sub_team_head')
  const volunteers = speakers.filter(s => s.role === 'volunteer')

  const displayConveners = conveners.length > 0 ? conveners : SEED_CONVENERS
  const displayManagement = management.length > 0 ? management : SEED_MANAGEMENT
  const displaySubTeam = subTeamHeads.length > 0 ? subTeamHeads : SEED_SUBTEAM
  const displayVolunteers = volunteers.length > 0 ? volunteers : SEED_VOLUNTEERS

  return (
    <>
      <Navbar />
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Our People</span>
          <h1 className="page-banner-title">The Team</h1>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', paddingBottom: '4rem' }}>
        <div className="container" style={{ paddingTop: '3rem' }}>

          {/* ── Section A: Hosts and Conveners ──────────── */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#040102', display: 'block', marginBottom: '0.5rem' }}>Leadership</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-display)', color: '#040102', fontWeight: 700, marginBottom: '0.5rem' }}>Hosts and Conveners</h2>
            <div className="gold-line" style={{ marginBottom: '2rem' }} />
          </div>

          {loading ? <div className="loading-state">Loading…</div> : (
            <HoverGrid className="team-grid-5col">
              {displayConveners.map((m, i) => (
                <PersonCard key={m.id || i} member={m} index={i} imgHeight={240} namePx={15} rolePx={12} openBioId={openBioId} setOpenBioId={setOpenBioId} />
              ))}
            </HoverGrid>
          )}

          <Divider />

          {/* ── Section B: Management Team ──────────────── */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#040102', display: 'block', marginBottom: '0.5rem' }}>Management</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-display)', color: '#040102', fontWeight: 700, marginBottom: '0.5rem' }}>Management Team</h2>
            <div className="gold-line" style={{ marginBottom: '2rem' }} />
          </div>

          {loading ? <div className="loading-state">Loading…</div> : (
            <HoverGrid className="team-grid-5col">
              {displayManagement.map((m, i) => (
                <PersonCard key={m.id || i} member={m} index={i} imgHeight={240} namePx={15} rolePx={12} openBioId={openBioId} setOpenBioId={setOpenBioId} />
              ))}
            </HoverGrid>
          )}

          <Divider />

          {/* ── Section C: Sub Team Heads (12 in 2 rows of 6) ── */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#040102', display: 'block', marginBottom: '0.5rem' }}>Coordination</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-display)', color: '#040102', fontWeight: 700, marginBottom: '0.5rem' }}>Sub Team Heads</h2>
            <div className="gold-line" style={{ marginBottom: '2rem' }} />
          </div>

          {loading ? <div className="loading-state">Loading…</div> : (
            <HoverGrid className="team-grid-6col">
              {displaySubTeam.map((m, i) => (
                <PersonCard key={m.id || i} member={m} index={i} imgHeight={180} namePx={14} rolePx={12} openBioId={openBioId} setOpenBioId={setOpenBioId} />
              ))}
            </HoverGrid>
          )}

          <Divider />

          {/* ── Section D: Volunteers (30 cards) ─────────── */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#040102', display: 'block', marginBottom: '0.5rem' }}>Serving With Love</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-display)', color: '#040102', fontWeight: 700, marginBottom: '0.5rem' }}>Our Volunteers</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: '0.5rem' }}>The heartbeat of Outpouring — serving faithfully behind the scenes.</p>
            <div className="gold-line" style={{ marginBottom: '2rem' }} />
          </div>

          {loading ? <div className="loading-state">Loading…</div> : (
            <div className="team-grid-volunteers-6col">
              {displayVolunteers.map((m, i) => (
                <VolunteerCard key={m.id || i} member={m} index={i} />
              ))}
            </div>
          )}

          <Divider />

          {/* ── Section E: Gospel Ministers ───────────────── */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#040102', display: 'block', marginBottom: '0.5rem' }}>Anointed Voices</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-display)', color: '#040102', fontWeight: 700, marginBottom: '0.5rem' }}>Featured Ministers</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: '0.5rem' }}>God's chosen vessels bringing prophetic insight, powerful teaching, and Spirit-filled worship.</p>
            <div className="gold-line" style={{ marginBottom: '2rem' }} />
          </div>

          {loading ? (
            <div className="loading-state">Loading speakers…</div>
          ) : ministers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888', fontSize: 14 }}>Speakers will be announced soon. Check back closer to the conference.</div>
          ) : (
            <HoverGrid className="speakers-grid-new">
              {ministers.map((s, i) => (
                <SpeakerCard key={s.id} speaker={s} index={i} openBioId={openBioId} setOpenBioId={setOpenBioId} />
              ))}
            </HoverGrid>
          )}

        </div>
      </div>

      <Footer />

      <style>{`
        .team-grid-5col { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
        .team-grid-6col { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
        .team-grid-volunteers-6col { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        .team-person-card:hover { border-color: #c90505 !important; transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .team-volunteer-card:hover { border-color: #c90505 !important; transform: translateY(-2px); }
        @media (max-width: 1024px) {
          .team-grid-5col { grid-template-columns: repeat(3, 1fr); }
          .team-grid-6col { grid-template-columns: repeat(4, 1fr); }
          .team-grid-volunteers-6col { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 768px) {
          .team-grid-5col { grid-template-columns: repeat(2, 1fr); }
          .team-grid-6col { grid-template-columns: repeat(2, 1fr); }
          .team-grid-volunteers-6col { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 480px) {
          .team-grid-volunteers-6col { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  )
}
