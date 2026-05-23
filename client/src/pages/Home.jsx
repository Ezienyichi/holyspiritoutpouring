import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CountdownTimer from '../components/CountdownTimer'
import SpeakerCard from '../components/SpeakerCard'
import SessionRow from '../components/SessionRow'
import PrayerCard from '../components/PrayerCard'
import MediaCard from '../components/MediaCard'

/* ── HERO ────────────────────────────────────── */
function HeroSection({ config }) {
  const hasVideo = config.heroVideoUrl?.trim()
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <span className="hero-eyebrow">✦ Lagos, Nigeria &bull; August 15–17, 2025 ✦</span>
        <h1>
          <span className="hero-title-holy">Holy Spirit</span>
          <span className="hero-title-outpouring">Outpouring</span>
        </h1>
        <p className="hero-subtitle">
          Experience three days of powerful worship, anointed teachings, and a fresh encounter with the Holy Spirit. Come expecting the supernatural.
        </p>
        <div className="hero-iframe-wrap">
          {hasVideo ? (
            <iframe src={config.heroVideoUrl} title="Conference Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <div className="hero-iframe-placeholder">
              <div className="play-icon">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <p>Conference video coming soon</p>
            </div>
          )}
        </div>
        <CountdownTimer targetDate={config.countdownDate || '2025-08-15T18:00:00'} />
        <div className="hero-cta">
          <a href="#register-section" className="btn btn-orange btn-lg">🔥 Register Free</a>
          <a href="#about-section" className="btn btn-outline btn-lg">Learn More</a>
        </div>
      </div>
    </section>
  )
}

/* ── ABOUT ───────────────────────────────────── */
function AboutSection({ config }) {
  return (
    <section className="about-section" id="about-section">
      <div className="container">
        <div className="about-grid">
          <div>
            <span className="section-label">About the Conference</span>
            <h2 className="about-title">
              A Divine Gathering<br />
              <span>for</span> Such a Time
            </h2>
            <div className="gold-line" />
            <p className="about-body">{config.aboutText1 || 'The Holy Spirit Outpouring Conference is more than an event — it\'s a movement. For three transformative days, believers from every nation will gather to seek the face of God, receive fresh fire, and be equipped for end-time harvest.'}</p>
            <p className="about-body">{config.aboutText2 || 'Whether you attend in person in Lagos or join our global livestream, prepare for an encounter that will ignite your faith, restore your passion, and release the supernatural in your life.'}</p>
            <Link to="/speakers" className="btn btn-outline-orange" style={{ marginTop: '1.5rem' }}>Learn More About Outpouring '25</Link>
          </div>
          <div className="about-img-wrap">
            <div className="about-img">
              <img src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=700&h=520&fit=crop" alt="Conference crowd worshipping" />
            </div>
            <div className="about-stat-card">
              <span className="stat-num">10K+</span>
              <span className="stat-lbl">Expected Attendees</span>
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
    { icon: '❤️', title: 'Deep Worship', body: 'Hours of unhindered, Spirit-led worship that ushers you into the very presence of God.' },
    { icon: '📖', title: 'Powerful Teachings', body: 'Anointed ministers bringing fresh revelation from the Word for this crucial season.' },
    { icon: '👥', title: 'Community', body: 'Connect with thousands of believers from across the globe united in one purpose.' },
    { icon: '✨', title: 'Miracles & Healing', body: 'Come expecting signs, wonders, and a personal encounter with the Holy Spirit.' },
  ]
  return (
    <section className="features-section">
      <div className="container">
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon-wrap">
                <span className="feature-icon">{f.icon}</span>
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
  return (
    <section className="speakers-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">Anointed Voices</span>
          <h2 className="section-title">Featured Speakers</h2>
          <div className="gold-line centered" />
          <p className="section-subtitle centered">God's chosen vessels bringing prophetic insight, powerful teaching, and Spirit-filled worship.</p>
        </div>
        <div className="speakers-grid">
          {speakers.slice(0, 4).map((s, i) => <SpeakerCard key={s.id} speaker={s} index={i} />)}
        </div>
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <Link to="/speakers" className="btn btn-outline-orange">View All Speakers →</Link>
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
    fetch(`/api/sessions?day=${day}`).then(r => r.json()).then(d => { setSessions(d); setLoading(false) })
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
          {tabs.map(t => (
            <button key={t.day} className={`sch-tab${day === t.day ? ' active' : ''}`} onClick={() => setDay(t.day)}>{t.label}</button>
          ))}
        </div>
        {loading ? <div className="loading-state">Loading…</div> : (
          <div className="session-list">
            {sessions.map(s => <SessionRow key={s.id} session={s} />)}
          </div>
        )}
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <Link to="/schedule" className="btn btn-outline-orange">View Full Schedule →</Link>
        </div>
      </div>
    </section>
  )
}

/* ── TESTIMONIALS ────────────────────────────── */
function TestimonialsSection() {
  const items = [
    { quote: 'I came broken and empty, but the Holy Spirit filled me to overflowing. My life has never been the same since Outpouring 2024.', name: 'Sister Amara O.', loc: 'Lagos, Nigeria', bg: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=700&fit=crop' },
    { quote: 'The worship at this conference is unlike anything I\'ve experienced. Heaven literally comes down. I received healing during the evening service.', name: 'Brother James K.', loc: 'Nairobi, Kenya', bg: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&h=700&fit=crop' },
    { quote: "As a pastor, I was running on empty. Outpouring reignited my fire and gave me a fresh vision for ministry. I bring my entire team every year.", name: 'Pastor Rebecca M.', loc: 'Accra, Ghana', bg: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=700&fit=crop' },
  ]
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">Testimonies</span>
          <h2 className="section-title">Lives Transformed</h2>
          <div className="gold-line centered" />
        </div>
        <div className="testimonials-grid">
          {items.map(t => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-bg" style={{ backgroundImage: `url(${t.bg})` }} />
              <div className="testimonial-overlay" />
              <div className="testimonial-content">
                <div className="testimonial-quote-mark">"</div>
                <p className="testimonial-text">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
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
    await fetch('/api/prayers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
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
            <h3 className="prayer-form-title">🙏 Submit a Prayer Request</h3>
            {submitted ? (
              <div className="alert alert-ok">Your prayer has been submitted. The body of Christ is standing with you!</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name (optional)</label>
                    <input className="form-input" placeholder="Your name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (optional)</label>
                    <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                    {cats.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prayer Request *</label>
                  <textarea className="form-textarea" placeholder="Share what is on your heart…" required value={form.text} onChange={e => setForm(f=>({...f,text:e.target.value}))} />
                </div>
                <button type="submit" className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }}>Submit Prayer Request</button>
              </form>
            )}
          </div>
          <div className="prayer-cards-col">
            {prayers.slice(0, 2).map(p => <PrayerCard key={p.id} prayer={p} prayedSet={prayedSet} onPray={onPray} />)}
            <Link to="/prayer" className="prayer-view-all">View All Prayer Requests →</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── MEDIA ───────────────────────────────────── */
function MediaSection({ media }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? media : media.filter(m => m.type === filter)
  return (
    <section className="media-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="section-label">Gallery</span>
          <h2 className="section-title">Media Gallery</h2>
          <div className="gold-line centered" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <div className="media-filter-tabs">
            {['all','photo','video'].map(f => (
              <button key={f} className={`media-tab${filter===f?' active':''}`} onClick={()=>setFilter(f)}>
                {f === 'all' ? '📷 All' : f === 'photo' ? '🖼️ Photos' : '🎬 Videos'}
              </button>
            ))}
          </div>
        </div>
        <div className="media-masonry">
          {filtered.map(item => <MediaCard key={item.id} item={item} />)}
        </div>
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <Link to="/media" className="btn btn-outline">Load More Media</Link>
        </div>
      </div>
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
    await fetch('/api/giving', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, tier }) })
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
              <button className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }} onClick={() => giveAmount(t.amount, t.name)}>Give Now</button>
            </div>
          ))}
        </div>
        <div className="give-custom">
          <input placeholder="Custom amount (₦)" value={custom} onChange={e => setCustom(e.target.value)} />
          <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }} onClick={() => custom && giveAmount(custom, 'Custom')}>Give Custom</button>
        </div>
      </div>
    </section>
  )
}

/* ── HOME (root) ─────────────────────────────── */
export default function Home() {
  const [config, setConfig] = useState({})
  const [speakers, setSpeakers] = useState([])
  const [prayers, setPrayers] = useState([])
  const [media, setMedia] = useState([])

  useEffect(() => {
    fetch('/api/config').then(r=>r.json()).then(setConfig)
    fetch('/api/speakers').then(r=>r.json()).then(setSpeakers)
    fetch('/api/prayers').then(r=>r.json()).then(setPrayers)
    fetch('/api/media').then(r=>r.json()).then(setMedia)
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
