import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TIERS = [
  { name: 'Seed Partner', amount: 5000, display: '₦5,000', desc: "Support one attendee's registration and help make this gathering possible." },
  { name: 'Conference Partner', amount: 25000, display: '₦25,000', desc: 'Fund a full session production — sound, lighting, and streaming equipment.' },
  { name: 'Vision Partner', amount: 100000, display: '₦100,000', desc: 'Sponsor the global broadcast reaching thousands worldwide.' },
]

export default function Give() {
  const [form, setForm] = useState({ name: '', email: '', amount: '', tier: '' })
  const [success, setSuccess] = useState(false)

  async function give(amount, tier) {
    await fetch('/api/giving', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount, tier }) })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 6000)
  }

  return (
    <>
      <Navbar />
      <section className="give-section" style={{ minHeight: '40vh' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="give-title">Support the Vision</h2>
            <p className="give-subtitle">Your giving enables us to host thousands, broadcast globally, and transform lives. Every gift makes Outpouring '25 possible.</p>
          </div>
          {success && <div className="alert alert-ok" style={{ maxWidth: 500, margin: '0 auto 2rem' }}>Thank you! Your gift has been received. God bless you richly!</div>}
          <div className="give-grid">
            {TIERS.map(t => (
              <div key={t.name} className="give-card">
                <div className="give-tier">{t.name}</div>
                <div className="give-amount">{t.display}</div>
                <p className="give-desc">{t.desc}</p>
                <button className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }} onClick={() => give(t.amount, t.name)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Give Now
              </button>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: 480, margin: '2rem auto 0', background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '1.75rem' }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Custom Amount</h3>
            <div className="form-row" style={{ marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <input className="form-input" placeholder="Your name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input className="form-input" type="email" placeholder="Email address" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }} />
              </div>
            </div>
            <div className="give-custom">
              <input placeholder="Amount in ₦" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} />
              <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} onClick={() => form.amount && give(Number(form.amount), 'Custom')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Give
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
