import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PrayerCard from '../components/PrayerCard'

const CATS = ['Healing','Salvation','Finances','Family','Direction','Other']

export default function Prayer() {
  const [prayers, setPrayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', category: 'Other', text: '' })
  const [submitted, setSubmitted] = useState(false)
  const [prayedSet, setPrayedSet] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('op25_prayed') || '[]')) } catch { return new Set() }
  })

  useEffect(() => {
    fetch('/api/prayers').then(r => r.json()).then(d => { setPrayers(d); setLoading(false) })
  }, [])

  function onPray(id) {
    const next = new Set([...prayedSet, id])
    setPrayedSet(next)
    localStorage.setItem('op25_prayed', JSON.stringify([...next]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch('/api/prayers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const newPrayer = await res.json()
    setSubmitted(true)
    setForm({ name: '', email: '', category: 'Other', text: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <>
      <Navbar />
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Prayer Center</span>
          <h1 className="page-banner-title">The Prayer Wall</h1>
        </div>
      </div>
      <section className="section section-dark">
        <div className="container">
          <div className="prayer-grid">
            <div className="prayer-form-card">
              <h3 className="prayer-form-title">🙏 Submit a Prayer Request</h3>
              {submitted && <div className="alert alert-ok">Your prayer has been submitted. The body of Christ is with you!</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name (optional)</label>
                    <input className="form-input" placeholder="Your name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (optional)</label>
                    <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prayer Request *</label>
                  <textarea className="form-textarea" style={{ minHeight: 120 }} placeholder="Share what is on your heart…" required value={form.text} onChange={e=>setForm(f=>({...f,text:e.target.value}))} />
                </div>
                <button type="submit" className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }}>Submit Prayer Request</button>
              </form>
            </div>
            <div>
              {loading ? <div className="loading-state">Loading prayers…</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {prayers.map(p => <PrayerCard key={p.id} prayer={p} prayedSet={prayedSet} onPray={onPray} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
