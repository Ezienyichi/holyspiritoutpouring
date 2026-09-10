import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { apiFetch } from '../utils/api'
import Carousel3D from '../components/Carousel3D'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CountdownTimer from '../components/CountdownTimer'
import SpeakerCard from '../components/SpeakerCard'
import SessionRow from '../components/SessionRow'
import PrayerCard from '../components/PrayerCard'

const API_BASE = import.meta.env.VITE_API_URL || ''

/* ── HERO ─────────────────────────────────────── */
function HeroSection({ config }) {
  const [isMuted, setIsMuted] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  const showDates = config.show_dates !== 'false'
  const showLocation = config.show_location !== 'false'
  const showCountdown = config.show_countdown !== 'false'
  const dateText = config.conference_dates || 'August 15–17, 2026'
  const locationText = [config.venue_city, config.venue_state, config.venue_country].filter(Boolean).join(', ') || 'Port Harcourt, Rivers State, Nigeria'

  function toggleMute() {
    setIsMuted(m => !m)
    setHasInteracted(true)
  }

  const videoSrc = `https://www.youtube.com/embed/n3KjY4xroNw?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=n3KjY4xroNw&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`

  return (
    <section className="hero">
      <div className="hero-video-bg">
        <iframe
          key={isMuted ? 'muted' : 'unmuted'}
          src={videoSrc}
          title="Conference Background"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="hero-video-overlay" />
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 10,
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 50, padding: '8px 16px', color: 'white', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isMuted ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        )}
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      {isMuted && !hasInteracted && (
        <div style={{ position: 'absolute', bottom: '4.5rem', right: '2rem', zIndex: 10, fontSize: 11, color: 'rgba(255,255,255,0.45)', pointerEvents: 'none' }}>
          Click to enable audio
        </div>
      )}
      <div className="hero-content">
        <h1>
          <span className="hero-title-holy">Holy Spirit</span>
          <span className="hero-title-outpouring">Outpouring</span>
        </h1>
        {(showLocation || showDates) && (
          <div className="hero-location-date">
            {showLocation && (
              <>
                <span className="hl-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                </span>
                {locationText}
              </>
            )}
            {showLocation && showDates && <span className="hl-bullet">•</span>}
            {showDates && (
              <>
                <span className="hl-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                </span>
                {dateText}
              </>
            )}
          </div>
        )}
        <p className="hero-subtitle">
          {config.aboutText1 ? config.aboutText1.slice(0, 140) + '…' : 'Experience three days of powerful worship, anointed teachings, and a fresh encounter with the Holy Spirit. Come expecting the supernatural.'}
        </p>
        {showCountdown && <CountdownTimer targetDate={config.countdownDate || '2026-08-15T18:00:00'} />}
        <div className="hero-cta">
          <Link to="/register" className="btn btn-orange btn-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            Register Free
          </Link>
          <a href="#about-section" className="btn btn-outline btn-lg" onClick={e => { e.preventDefault(); document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}

/* ── FALLBACK DATA ───────────────────────────── */
const FALLBACK_SPONSORS = [
  { id:1, name:'Ministry Partner', logo_url:'' },
  { id:2, name:'Church Network', logo_url:'' },
  { id:3, name:'Media Partner', logo_url:'' },
  { id:4, name:'Foundation', logo_url:'' },
  { id:5, name:'Kingdom Network', logo_url:'' },
  { id:6, name:'Gospel Media', logo_url:'' },
  { id:7, name:'Faith Partner', logo_url:'' },
  { id:8, name:'Revival Network', logo_url:'' },
]

const FALLBACK_MINISTERS = [
  { id:1, name:'Min Moses Bliss', ministry_role:'Worship Leader', year:'2024', photo_url:'' },
  { id:2, name:'Min GUC', ministry_role:'Gospel Artist', year:'2024', photo_url:'' },
  { id:3, name:'Min Judikay', ministry_role:'Gospel Artist', year:'2023', photo_url:'' },
  { id:4, name:'Min Empraiz', ministry_role:'Worship Leader', year:'2023', photo_url:'' },
  { id:5, name:'Micah Praise Prophet', ministry_role:'Praise Minister', year:'2023', photo_url:'' },
  { id:6, name:'Min Carlos Rivera', ministry_role:'Worship Leader', year:'2022', photo_url:'' },
  { id:7, name:'Min GP Samz', ministry_role:'Deep Worship', year:'2024', photo_url:'' },
  { id:8, name:'Min Elekwu', ministry_role:'Traditional Praise', year:'2024', photo_url:'' },
  { id:9, name:'Min Caleb', ministry_role:'Gospel Artist', year:'2025', photo_url:'' },
  { id:10, name:'Min DFO', ministry_role:'Deep Worship', year:'2024', photo_url:'' },
]

const FALLBACK_EVENTS = [
  { id:1, year:'2018', title:'Outpouring 2018', tagline:'The First Outpouring — Where It All Began', image_url:'', highlights_url:'' },
  { id:2, year:'2019', title:'Outpouring 2019', tagline:'Deeper Waters — A Year of Miracles', image_url:'', highlights_url:'' },
  { id:3, year:'2020', title:'Outpouring 2020', tagline:'Against All Odds — The Virtual Outpouring', image_url:'', highlights_url:'' },
  { id:4, year:'2021', title:'Outpouring 2021', tagline:'Rising Again — Post Pandemic Revival', image_url:'', highlights_url:'' },
  { id:5, year:'2022', title:'Outpouring 2022', tagline:'Fire Across the Nation', image_url:'', highlights_url:'' },
  { id:6, year:'2023', title:'Outpouring 2023', tagline:'Generation of Power', image_url:'', highlights_url:'' },
  { id:7, year:'2024', title:'Outpouring 2024', tagline:'Heaven Came Down', image_url:'', highlights_url:'' },
  { id:8, year:'2025', title:'Outpouring 2025', tagline:'The Greatest Yet — August 15–17', image_url:'', highlights_url:'' },
]

/* ── SPONSORS STRIP ──────────────────────────── */

function SponsorsStrip({ sponsors }) {
  const items = sponsors.length > 0 ? sponsors : FALLBACK_SPONSORS
  const doubled = [...items, ...items]
  return (
    <div style={{
      height: 80, background: '#FFFFFF', position: 'relative',
      borderTop: '2px solid #EEEEEE', borderBottom: '2px solid #EEEEEE',
      display: 'flex', alignItems: 'center', overflow: 'hidden', width: '100%',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 155,
        background: '#FFFFFF', borderRight: '1px solid #EEEEEE', zIndex: 2,
        display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 20,
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: '#040102',
        whiteSpace: 'nowrap',
      }}>
        Partners &amp; Sponsors
      </div>
      <div style={{ flex: 1, overflow: 'hidden', marginLeft: 155, height: '100%' }}>
        <div className="sponsor-track" style={{ display: 'flex', gap: 40, alignItems: 'center', height: '100%', width: 'max-content' }}>
          {doubled.map((s, i) => (
            s.logo_url ? (
              <a key={i} href={s.website_url || '#'} target={s.website_url ? '_blank' : undefined} rel="noopener noreferrer"
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <img src={s.logo_url} alt={s.name} style={{ height: 44, width: 'auto', objectFit: 'contain', filter: 'none', opacity: 1, display: 'block' }} />
              </a>
            ) : (
              <div key={i} style={{
                flexShrink: 0, background: '#FFFFFF', border: '2px solid #EEEEEE', borderRadius: 8,
                padding: '10px 24px', height: 48, display: 'flex', alignItems: 'center',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 800, color: '#040102',
                whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', letterSpacing: '0.02em',
              }}>
                {s.name}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── ABOUT (with embedded features) ──────────── */
const FEATURES = [
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    title: 'Anointed Worship', body: 'Three nights of Spirit-led worship that will usher you into the very presence of God.'
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    title: 'Power-Packed Teaching', body: 'World-class ministers delivering fresh revelation directly from the throne room of God.'
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
    title: 'Corporate Prayer', body: 'Join thousands in united intercession — heaven responds when believers pray together.'
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    title: 'Global Livestream', body: 'Join from anywhere in the world — the fire of revival has no borders.'
  },
]

function AboutSection({ config }) {
  const heading = config.about_heading || 'A Divine Gathering for Such a Time'
  const attendees = config.about_stats_attendees || '10K+'

  return (
    <section className="about-section" id="about-section">
      <div className="container">
        <div className="about-grid">
          <div>
            <span className="section-label">About the Conference</span>
            <h2 className="about-title">
              {heading.includes('\n') ? (
                heading.split('\n').map((l, i) => i === 0 ? <span key={i}>{l}<br /></span> : <span key={i}>{l}</span>)
              ) : heading}
            </h2>
            <div className="gold-line" />
            <p className="about-body">{config.aboutText1 || "The Holy Spirit Outpouring Conference is more than an event — it's a movement. For three transformative days, believers from every nation will gather to seek the face of God, receive fresh fire, and be equipped for end-time harvest."}</p>
            <p className="about-body">{config.aboutText2 || 'Whether you attend in person in Port Harcourt or join our global livestream, prepare for an encounter that will ignite your faith, restore your passion, and release the supernatural in your life.'}</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/team" className="btn btn-orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Meet the Speakers
              </Link>
              <Link to="/live" className="btn btn-outline-orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                Watch Live
              </Link>
            </div>

            {/* Embedded feature cards */}
            <div className="about-features-grid">
              {FEATURES.map(f => (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon-wrap">
                    <div className="feature-icon">{f.icon}</div>
                  </div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-body">{f.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="about-img-wrap">
            <div className="about-img">
              {config.about_image_url ? (
                <img src={config.about_image_url} alt="Conference Flyer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ color: '#BBBBBB', fontSize: '0.85rem' }}>Conference Flyer</span>
                </div>
              )}
            </div>
            <div className="about-stat-card">
              <span className="stat-num">{attendees}</span>
              <div className="stat-lbl">Expected Attendees</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── PREVIOUS EVENTS CAROUSEL ─────────────────── */
function EventCard({ ev }) {
  const [hlHover, setHlHover] = useState(false)
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0D1B2A' }}>
      {ev.image_url ? (
        <img src={ev.image_url} alt={ev.title} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #1a0030 0%, #0D1B2A 100%)',
        }} />
      )}
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.92) 100%)',
      }} />
      {/* Year badge */}
      {ev.year && (
        <div style={{
          position: 'absolute', top: 18, left: 18,
          background: '#c90505', color: 'white', fontWeight: 700, fontSize: 15,
          padding: '6px 16px', borderRadius: 6,
          fontFamily: 'var(--font-body)',
        }}>{ev.year}</div>
      )}
      {/* Bottom content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'white', marginBottom: 6, lineHeight: 1.3,
        }}>{ev.title}</div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 14,
          color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 16,
        }}>{ev.tagline}</div>
        {ev.highlights_url && (
          <button
            onMouseEnter={() => setHlHover(true)}
            onMouseLeave={() => setHlHover(false)}
            onClick={() => window.open(ev.highlights_url, '_blank')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: hlHover ? 'rgba(201,5,5,0.7)' : 'rgba(255,255,255,0.12)',
              border: `1px solid ${hlHover ? '#c90505' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: 100, padding: '9px 20px',
              color: 'white', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            View Highlights
          </button>
        )}
      </div>
    </div>
  )
}

function PreviousEventsSection({ events }) {
  const display = events.length > 0 ? events : FALLBACK_EVENTS
  return (
    <section style={{ background: '#F8F8F8', padding: '80px 0' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
            color: '#040102', letterSpacing: '0.15em', textTransform: 'uppercase',
            display: 'block', marginBottom: 12,
          }}>Our Journey</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 700, color: '#040102', margin: '0 0 12px',
          }}>Outpouring Through the Years</h2>
          <div className="gold-line centered" />
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 16, color: '#666666',
            marginTop: 16, maxWidth: 560, marginInline: 'auto',
          }}>A legacy of encounters, revivals and transformed lives since 2018.</p>
        </div>
        <Carousel3D
          items={display}
          autoAdvanceMs={6000}
          cardWidth={340}
          cardHeight={460}
          renderCard={(ev) => <EventCard ev={ev} />}
        />
      </div>
    </section>
  )
}

/* ── SPEAKERS ────────────────────────────────── */
function SpeakersSection({ speakers }) {
  const [openBioId, setOpenBioId] = useState(null)
  return (
    <section className="speakers-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">Anointed Voices</span>
          <h2 className="section-title">Featured Speakers</h2>
          <div className="gold-line centered" />
          <p className="section-subtitle centered">God's chosen vessels bringing prophetic insight, powerful teaching, and Spirit-filled worship.</p>
        </div>
        <div className="speakers-grid-new">
          {speakers.slice(0, 4).map((s, i) => (
            <SpeakerCard key={s.id} speaker={s} index={i} openBioId={openBioId} setOpenBioId={setOpenBioId} />
          ))}
        </div>
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <Link to="/team" className="btn btn-navy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            View All Speakers
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── PAST MINISTERS CAROUSEL ─────────────────── */
function MinisterCard({ m }) {
  const initials = (m.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0D1B2A' }}>
      {m.photo_url ? (
        <img src={m.photo_url} alt={m.name} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #0D1B2A 0%, #1E2D45 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(201,5,5,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'white',
          }}>{initials}</div>
        </div>
      )}
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.88) 100%)',
      }} />
      {/* Year badge */}
      {m.year && (
        <div style={{
          position: 'absolute', top: 18, left: 18,
          background: '#c90505', color: 'white', fontWeight: 700, fontSize: 12,
          padding: '5px 12px', borderRadius: 6, letterSpacing: '0.05em',
          fontFamily: 'var(--font-body)',
        }}>{m.year}</div>
      )}
      {/* Bottom content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: 'white', marginBottom: 4, lineHeight: 1.3,
        }}>{m.name}</div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 13,
          color: 'rgba(255,255,255,0.72)',
        }}>{m.ministry_role}</div>
      </div>
    </div>
  )
}

function PastMinistersSection({ ministers }) {
  const display = ministers.length > 0 ? ministers : FALLBACK_MINISTERS
  return (
    <section style={{ background: '#FFFFFF', padding: '80px 0' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
            color: '#040102', letterSpacing: '0.15em', textTransform: 'uppercase',
            display: 'block', marginBottom: 12,
          }}>Anointed Voices Through the Years</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 700, color: '#040102', margin: '0 0 12px',
          }}>Ministers Who Have Graced Our Stage</h2>
          <div className="gold-line centered" />
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 16, color: '#666666',
            marginTop: 16, maxWidth: 560, marginInline: 'auto',
          }}>Gospel ministers, worship leaders and choirs who have ministered at Outpouring.</p>
        </div>
        <Carousel3D
          items={display}
          autoAdvanceMs={5000}
          cardWidth={320}
          cardHeight={420}
          renderCard={(m) => <MinisterCard m={m} />}
        />
      </div>
    </section>
  )
}

/* ── SCHEDULE ────────────────────────────────── */
function ScheduleSection({ config }) {
  const [day, setDay] = useState(1)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(API_BASE + `/api/sessions?day=${day}`)
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [day])

  const year = config?.conference_year || '2026'
  const tabs = [
    { day: 1, label: `Day 1 — Aug 15, ${year}` },
    { day: 2, label: `Day 2 — Aug 16, ${year}` },
    { day: 3, label: `Day 3 — Aug 17, ${year}` },
  ]

  return (
    <section className="schedule-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">Programme</span>
          <h2 className="section-title">Conference Schedule</h2>
          <div className="gold-line centered" />
          <p className="section-subtitle centered">Every moment has been prayerfully planned for your spiritual transformation.</p>
        </div>
        <div className="schedule-tabs">
          <div className="schedule-tabs-inner">
            {tabs.map(t => (
              <button key={t.day} className={`sch-tab${day === t.day ? ' active' : ''}`} onClick={() => setDay(t.day)}>{t.label}</button>
            ))}
          </div>
        </div>
        {loading ? <div className="loading-state">Loading…</div> : (
          <div className="session-list">
            {sessions.map(s => <SessionRow key={s.id} session={s} />)}
          </div>
        )}
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <Link to="/schedule" className="btn btn-navy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            View Full Schedule
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── TESTIMONIALS — infinite auto-scroll ─────── */
const FALLBACK_TESTIMONIALS = [
  { id: 't1', quote: 'I came broken and empty, but the Holy Spirit filled me to overflowing. My life has never been the same since Outpouring 2024.', name: 'Sister Amara O.', location: 'Port Harcourt, Nigeria', bg_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=853&fit=crop' },
  { id: 't2', quote: 'The worship at this conference is unlike anything I have experienced. Heaven literally comes down. I received healing during the evening service.', name: 'Brother James K.', location: 'Nairobi, Kenya', bg_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=640&h=853&fit=crop' },
  { id: 't3', quote: 'As a pastor, I was running on empty. Outpouring reignited my fire and gave me a fresh vision for ministry. I bring my entire team every year.', name: 'Pastor Rebecca M.', location: 'Accra, Ghana', bg_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=640&h=853&fit=crop' },
  { id: 't4', quote: 'Three days of heaven on earth. I came for one session and stayed for all three days. The presence of God was tangible and real.', name: 'Deacon Samuel T.', location: 'Abuja, Nigeria', bg_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=640&h=853&fit=crop' },
  { id: 't5', quote: 'My teenage daughter gave her life to Christ at the youth session. This conference changed our family forever. We are coming back.', name: 'Mrs. Chioma E.', location: 'Enugu, Nigeria', bg_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=640&h=853&fit=crop' },
]

function TestimonialsSection({ testimonials = [] }) {
  const items = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS
  const doubled = [...items, ...items]
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
          <span className="section-label">Testimonies</span>
          <h2 className="section-title" style={{ color: 'white' }}>What People Are Saying</h2>
          <div className="gold-line centered" />
          <p className="section-subtitle centered" style={{ color: 'rgba(255,255,255,0.6)' }}>Lives transformed at every Outpouring since 2018.</p>
        </div>
      </div>
      <div className="tscroll-outer">
        <div className="tscroll-track">
          {doubled.map((t, i) => {
            const bgUrl = t.bg_url || t.bg || ''
            const initial = (t.name || '?').charAt(0).toUpperCase()
            const loc = t.location || t.loc || ''
            return (
              <div key={i} className="tscroll-card">
                <div className="tscroll-img" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined }} />
                <div className="tscroll-overlay" />
                <div className="tscroll-quote">&ldquo;</div>
                <div className="tscroll-body">
                  <p className="tscroll-text">{t.quote || t.text}</p>
                  <div className="tscroll-author">
                    <div className="tscroll-avatar">{initial}</div>
                    <div>
                      <div className="tscroll-name">{t.name}</div>
                      <div className="tscroll-loc">{loc}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── PRAYER ──────────────────────────────────── */
function PrayerSection({ prayers }) {
  const [form, setForm] = useState({ name: '', email: '', category: 'Other', text: '' })
  const [submitted, setSubmitted] = useState(false)
  const [prayedSet, setPrayedSet] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('op25_prayed') || '[]')) } catch { return new Set() }
  })

  function onPray(id) {
    const next = new Set([...prayedSet, id])
    setPrayedSet(next)
    localStorage.setItem('op25_prayed', JSON.stringify([...next]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.text.trim()) return
    await fetch(API_BASE + '/api/prayers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).catch(() => {})
    setSubmitted(true)
    setForm({ name: '', email: '', category: 'Other', text: '' })
  }

  const cats = ['Healing', 'Salvation', 'Finances', 'Family', 'Direction', 'Other']

  return (
    <section className="prayer-section" id="prayer-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
          <span className="section-label">Prayer Center</span>
          <h2 className="section-title">The Prayer Wall</h2>
          <div className="gold-line centered" />
          <p className="section-subtitle centered">Share your prayer request and join thousands in intercession. We believe in the power of united prayer.</p>
        </div>
        <div className="prayer-grid">
          <div className="prayer-form-card">
            <h3 className="prayer-form-title">Submit a Prayer Request</h3>
            {submitted ? (
              <div className="alert alert-ok">Your prayer has been submitted. The body of Christ is standing with you!</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name (optional)</label>
                    <input className="form-input" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (optional)</label>
                    <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {cats.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prayer Request *</label>
                  <textarea className="form-textarea" placeholder="Share what is on your heart…" required value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Submit Prayer Request
                </button>
              </form>
            )}
          </div>
          <div className="prayer-cards-col">
            {prayers.slice(0, 2).map(p => <PrayerCard key={p.id} prayer={p} prayedSet={prayedSet} onPray={onPray} />)}
            <Link to="/prayer" className="prayer-view-all">View All Prayer Requests</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── MEDIA ───────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

function HomeVideoCard({ item }) {
  const ytId = getYouTubeId(item.youtubeUrl || item.url)
  const thumb = item.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : item.url)
  const watchUrl = item.youtubeUrl || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : '#')
  return (
    <div>
      <a
        href={watchUrl} target="_blank" rel="noopener noreferrer"
        className="home-gallery-card"
        style={{ cursor: 'pointer', transition: 'all 0.25s ease', textDecoration: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
      >
        <img src={thumb} alt={item.title || item.caption} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)' }}>
          <div className="yt-play-btn" style={{ width: 44, height: 44, borderRadius: '50%', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
        </div>
      </a>
      {(item.title || item.caption) && <p className="home-gallery-title">{item.title || item.caption}</p>}
    </div>
  )
}

function getVideoThumbnail(item) {
  if (item.thumbnailUrl) return item.thumbnailUrl
  if (item.youtubeUrl || item.url) {
    const url = item.youtubeUrl || item.url
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
  }
  return item.url || ''
}

function MediaSection({ media }) {
  const displayMedia = media.slice(0, 6)
  return (
    <section className="media-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">Gallery</span>
          <h2 className="section-title">Photos &amp; Videos</h2>
          <div className="gold-line centered" />
          <p className="section-subtitle centered">Relive the moments from previous outpourings.</p>
        </div>
        {displayMedia.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '3rem 0' }}>Gallery content coming soon.</div>
        ) : (
          <div className="home-gallery-grid">
            {displayMedia.map(item => (
              item.type === 'video'
                ? <HomeVideoCard key={item.id} item={item} />
                : (
                  <div key={item.id}>
                    <div className="home-gallery-card">
                      <img
                        src={item.url}
                        alt={item.title || item.caption}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    </div>
                    {(item.title || item.caption) && <p className="home-gallery-title">{item.title || item.caption}</p>}
                  </div>
                )
            ))}
          </div>
        )}
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <Link to="/media" className="btn btn-navy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            View Full Gallery
          </Link>
        </div>
      </div>
      <style>{`.yt-play-btn:hover { transform: translate(-50%,-60%) scale(1.1) !important; box-shadow: 0 4px 20px rgba(255,0,0,0.5) !important; }`}</style>
    </section>
  )
}

/* ── GIVE ────────────────────────────────────── */
function GiveSection() {
  const navigate = useNavigate()
  const [giveForm, setGiveForm] = useState({ name: '', location: '', amount: '', reason: '' })
  const tiers = [
    { name: 'Seed Partner', amount: 5000, display: '₦5,000', desc: "Support one attendee's registration and help make this gathering possible." },
    { name: 'Conference Partner', amount: 25000, display: '₦25,000', desc: 'Fund a full session production — sound, lighting, and streaming.' },
    { name: 'Vision Partner', amount: 100000, display: '₦100,000', desc: 'Sponsor the global broadcast reaching thousands online.' },
  ]
  function goToGive(data) {
    sessionStorage.setItem('giveFormData', JSON.stringify(data))
    navigate('/give')
  }
  const fields = [
    { label: 'Full Name', placeholder: 'Your full name', type: 'text', field: 'name' },
    { label: 'Location', placeholder: 'City, State, Country', type: 'text', field: 'location' },
    { label: 'Amount (₦)', placeholder: 'Enter amount', type: 'number', field: 'amount' },
  ]
  return (
    <section className="give-section" id="register-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h2 className="give-title">Support the Vision</h2>
          <p className="give-subtitle">Your giving enables us to host thousands, broadcast globally, and transform lives. Every gift makes Outpouring possible.</p>
        </div>
        <div className="give-grid">
          {tiers.map(t => (
            <div key={t.name} className="give-card">
              <div className="give-tier">{t.name}</div>
              <div className="give-amount">{t.display}</div>
              <p className="give-desc">{t.desc}</p>
              <button className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }} onClick={() => goToGive({ name: '', location: '', amount: String(t.amount), reason: t.name })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Give Now
              </button>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '2px solid rgba(255,255,255,0.25)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '480px',
          margin: '2.5rem auto 0',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
            Give Towards the Vision
          </h3>

          {fields.map(f => (
            <div key={f.field} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={giveForm[f.field]}
                onChange={e => setGiveForm(g => ({ ...g, [f.field]: e.target.value }))}
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#c90505'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
              />
            </div>
          ))}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reason for Giving</label>
            <input
              type="text"
              placeholder="Connect your giving to an expectation from God"
              value={giveForm.reason}
              onChange={e => setGiveForm(g => ({ ...g, reason: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#c90505'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
            />
          </div>

          <button
            onClick={() => goToGive(giveForm)}
            style={{ width: '100%', background: '#c90505', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Give Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── HOME (root) ─────────────────────────────── */
export default function Home() {
  const { config } = useSiteConfig()
  const [speakers, setSpeakers] = useState([])
  const [prayers, setPrayers] = useState([])
  const [media, setMedia] = useState([])
  const [previousEvents, setPreviousEvents] = useState([])
  const [pastMinisters, setPastMinisters] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [testimonials, setTestimonials] = useState([])

  useEffect(() => {
    const loadAll = async () => {
      const [speakersRes, prayersRes, mediaRes, eventsRes, ministersRes, sponsorsRes, testimonialsRes] =
        await Promise.allSettled([
          apiFetch('/api/speakers'),
          apiFetch('/api/prayers'),
          apiFetch('/api/media'),
          apiFetch('/api/previous-events'),
          apiFetch('/api/past-ministers'),
          apiFetch('/api/sponsors'),
          apiFetch('/api/testimonials'),
        ])
      if (speakersRes.status === 'fulfilled') setSpeakers(Array.isArray(speakersRes.value) ? speakersRes.value : [])
      if (prayersRes.status === 'fulfilled') setPrayers(Array.isArray(prayersRes.value) ? prayersRes.value : [])
      if (mediaRes.status === 'fulfilled') setMedia(Array.isArray(mediaRes.value) ? mediaRes.value : [])
      if (eventsRes.status === 'fulfilled') setPreviousEvents(Array.isArray(eventsRes.value) ? eventsRes.value : [])
      if (ministersRes.status === 'fulfilled') setPastMinisters(Array.isArray(ministersRes.value) ? ministersRes.value : [])
      if (sponsorsRes.status === 'fulfilled') setSponsors(Array.isArray(sponsorsRes.value) ? sponsorsRes.value : [])
      if (testimonialsRes.status === 'fulfilled') setTestimonials(Array.isArray(testimonialsRes.value) ? testimonialsRes.value : [])
    }
    loadAll()
  }, [])

  return (
    <>
      <Navbar />
      <HeroSection config={config} />
      <SponsorsStrip sponsors={sponsors} />
      <AboutSection config={config} />
      <SpeakersSection speakers={speakers} />
      <PastMinistersSection ministers={pastMinisters} />
      <PreviousEventsSection events={previousEvents} />
      <ScheduleSection config={config} />
      <TestimonialsSection testimonials={testimonials} />
      <PrayerSection prayers={prayers} />
      <MediaSection media={media} />
      <GiveSection />
      <Footer />
    </>
  )
}
