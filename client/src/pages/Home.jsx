import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSiteConfig } from '../hooks/useSiteConfig'

const API_BASE = import.meta.env.VITE_API_URL || ''
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CountdownTimer from '../components/CountdownTimer'
import SpeakerCard from '../components/SpeakerCard'
import SessionRow from '../components/SessionRow'
import PrayerCard from '../components/PrayerCard'

/* ── HERO ────────────────────────────────────── */
function HeroSection({ config }) {
  const [isMuted, setIsMuted] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

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
        <span className="hero-eyebrow">Port Harcourt, Rivers State, Nigeria &bull; August 15–17, 2025</span>
        <h1>
          <span className="hero-title-holy">Holy Spirit</span>
          <span className="hero-title-outpouring">Outpouring</span>
        </h1>
        <p className="hero-subtitle">
          Experience three days of powerful worship, anointed teachings, and a fresh encounter with the Holy Spirit. Come expecting the supernatural.
        </p>
        <CountdownTimer targetDate={config.countdownDate || '2025-08-15T18:00:00'} />
        <div className="hero-cta">
          <a href="#register-section" className="btn btn-orange btn-lg" onClick={e => { e.preventDefault(); document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            Register Free
          </a>
          <a href="#about-section" className="btn btn-outline btn-lg" onClick={e => { e.preventDefault(); document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}

/* ── ABOUT ───────────────────────────────────── */
function AboutSection({ config }) {
  const heading = config.about_heading || 'A Divine Gathering\nfor Such a Time'
  const [headLine1, headLine2] = heading.includes('\n') ? heading.split('\n') : [heading, '']
  const attendees = config.about_stats_attendees || '10K+'
  return (
    <section className="about-section" id="about-section">
      <div className="container">
        <div className="about-grid">
          <div>
            <span className="section-label">About the Conference</span>
            <h2 className="about-title">
              {headLine1}<br />
              {headLine2 && <span>{headLine2}</span>}
            </h2>
            <div className="gold-line" />
            <p className="about-body">{config.aboutText1 || "The Holy Spirit Outpouring Conference is more than an event — it's a movement. For three transformative days, believers from every nation will gather to seek the face of God, receive fresh fire, and be equipped for end-time harvest."}</p>
            <p className="about-body">{config.aboutText2 || 'Whether you attend in person in Port Harcourt or join our global livestream, prepare for an encounter that will ignite your faith, restore your passion, and release the supernatural in your life.'}</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/speakers" className="btn btn-orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Meet the Speakers
              </Link>
              <Link to="/live" className="btn btn-outline-orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                Watch Live
              </Link>
            </div>
          </div>
          <div className="about-img-wrap">
            <div className="about-img">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <svg width="64" height="64" viewBox="0 0 22 28" fill="none">
                  <path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="#E8622A" opacity="0.4"/>
                  <path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="#C4501F" opacity="0.4"/>
                </svg>
                <span className="about-img-label">Conference photo coming soon</span>
              </div>
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

/* ── FEATURES ────────────────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
      title: 'Anointed Worship', body: 'Three nights of Spirit-led worship that will usher you into the very presence of God.'
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
      title: 'Power-Packed Teaching', body: 'World-class ministers delivering fresh revelation directly from the throne room of God.'
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
      title: 'Corporate Prayer', body: 'Join thousands in united intercession — heaven responds when believers pray together.'
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      title: 'Global Livestream', body: 'Join from anywhere in the world — the fire of revival has no borders.'
    },
  ]
  return (
    <section className="features-section" id="features-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">What to Expect</span>
          <h2 className="section-title">Three Days of Heaven on Earth</h2>
          <div className="gold-line centered" />
        </div>
        <div className="features-grid">
          {features.map(f => (
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
          <Link to="/speakers" className="btn btn-navy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            View All Speakers
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── SCHEDULE ────────────────────────────────── */
function ScheduleSection() {
  const [day, setDay] = useState(1)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(API_BASE + `/api/sessions?day=${day}`).then(r => r.json()).then(d => { setSessions(d); setLoading(false) })
  }, [day])

  const tabs = [
    { day: 1, label: 'Day 1 — Aug 15' },
    { day: 2, label: 'Day 2 — Aug 16' },
    { day: 3, label: 'Day 3 — Aug 17' },
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

/* ── TESTIMONIALS — AUTO CAROUSEL ────────────── */
function TestimonialsSection() {
  const items = [
    { quote: 'I came broken and empty, but the Holy Spirit filled me to overflowing. My life has never been the same since Outpouring 2024.', name: 'Sister Amara O.', loc: 'Port Harcourt, Nigeria', bg: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=700&fit=crop' },
    { quote: "The worship at this conference is unlike anything I've experienced. Heaven literally comes down. I received healing during the evening service.", name: 'Brother James K.', loc: 'Nairobi, Kenya', bg: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&h=700&fit=crop' },
    { quote: "As a pastor, I was running on empty. Outpouring reignited my fire and gave me a fresh vision for ministry. I bring my entire team every year.", name: 'Pastor Rebecca M.', loc: 'Accra, Ghana', bg: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=700&fit=crop' },
    { quote: 'Three days of heaven on earth. I came for one session and stayed for all three days. The presence of God was tangible.', name: 'Deacon Samuel T.', loc: 'Abuja, Nigeria', bg: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500&h=700&fit=crop' },
    { quote: 'My teenage daughter gave her life to Christ at the youth session. This conference changed our family forever.', name: 'Mrs. Chioma E.', loc: 'Enugu, Nigeria', bg: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=500&h=700&fit=crop' },
  ]
  const doubled = [...items, ...items]

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">Testimonies</span>
          <h2 className="section-title">Lives Transformed</h2>
          <div className="gold-line centered" />
        </div>
      </div>
      <div className="testimonials-carousel-outer">
        <div className="testimonials-track">
          {doubled.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-bg" style={{ backgroundImage: `url(${t.bg})` }} />
              <div className="testimonial-overlay" />
              <div className="testimonial-content">
                <div className="testimonial-quote-mark">"</div>
                <p className="testimonial-text">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-location">{t.loc}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    await fetch(API_BASE + '/api/prayers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSubmitted(true)
    setForm({ name: '', email: '', category: 'Other', text: '' })
  }

  const cats = ['Healing','Salvation','Finances','Family','Direction','Other']

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
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block', position: 'relative', borderRadius: 12,
        overflow: 'hidden', aspectRatio: '16/9', cursor: 'pointer',
        transition: 'all 0.25s ease', textDecoration: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <img src={thumb} alt={item.title || item.caption} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)',
        width: 56, height: 56, borderRadius: '50%', background: '#FF0000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease', boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}
        className="yt-play-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 12px', color: 'white', fontSize: 13, fontWeight: 700, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.title || item.caption}
      </div>
    </a>
  )
}

function MediaSection({ media }) {
  const videos = media.filter(m => m.type === 'video').slice(0, 6)
  return (
    <section className="media-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">Gallery</span>
          <h2 className="section-title">Watch Our Videos</h2>
          <div className="gold-line centered" />
          <p className="section-subtitle centered">Relive the moments from previous outpourings. Click any video to watch on YouTube.</p>
        </div>
        {videos.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>Gallery content coming soon.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {videos.map(v => <HomeVideoCard key={v.id} item={v} />)}
          </div>
        )}
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <Link to="/media" className="btn btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            View All Videos
          </Link>
        </div>
      </div>
      <style>{`.yt-play-btn:hover { transform: translate(-50%,-60%) scale(1.1) !important; box-shadow: 0 4px 20px rgba(255,0,0,0.5) !important; }`}</style>
    </section>
  )
}

/* ── GIVE ────────────────────────────────────── */
function GiveSection() {
  const [custom, setCustom] = useState('')
  const tiers = [
    { name: 'Seed Partner', amount: '₦5,000', desc: "Support one attendee's registration and help make this gathering possible." },
    { name: 'Conference Partner', amount: '₦25,000', desc: 'Fund a full session production — sound, lighting, and streaming.' },
    { name: 'Vision Partner', amount: '₦100,000', desc: 'Sponsor the global broadcast reaching thousands online.' },
  ]
  async function giveAmount(amount, tier) {
    await fetch(API_BASE + '/api/giving', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, tier }) })
    alert(`Thank you! Your gift of ${amount} has been received. God bless you!`)
  }
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
              <div className="give-amount">{t.amount}</div>
              <p className="give-desc">{t.desc}</p>
              <button className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }} onClick={() => giveAmount(t.amount, t.name)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Give Now
              </button>
            </div>
          ))}
        </div>
        <div className="give-custom">
          <input placeholder="Custom amount (₦)" value={custom} onChange={e => setCustom(e.target.value)} />
          <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }} onClick={() => custom && giveAmount(custom, 'Custom')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Give
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

  useEffect(() => {
    fetch(API_BASE + '/api/speakers').then(r => r.json()).then(setSpeakers).catch(() => {})
    fetch(API_BASE + '/api/prayers').then(r => r.json()).then(setPrayers).catch(() => {})
    fetch(API_BASE + '/api/media').then(r => r.json()).then(setMedia).catch(() => {})
  }, [])

  return (
    <>
      <Navbar />
      <HeroSection config={config} />
      <AboutSection config={config} />
      <FeaturesSection />
      <SpeakersSection speakers={speakers} />
      <ScheduleSection />
      <TestimonialsSection />
      <PrayerSection prayers={prayers} />
      <MediaSection media={media} />
      <GiveSection />
      <Footer />
    </>
  )
}
