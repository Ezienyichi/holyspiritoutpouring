import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { useToast } from '../context/ToastContext'

const API_BASE = import.meta.env.VITE_API_URL || ''
const AMOUNT_PILLS = [5000, 10000, 25000, 50000, 100000]

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '2px solid rgba(255,255,255,0.3)',
  borderRadius: '10px',
  padding: '14px 16px',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background 0.2s',
}

function onFocusRed(e) { e.target.style.borderColor = '#c90505'; e.target.style.background = 'rgba(201,5,5,0.05)' }
function onBlurDefault(e) { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.background = 'rgba(255,255,255,0.06)' }

export default function Give() {
  const toast = useToast()
  const { config } = useSiteConfig()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', location: '', amount: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('giveFormData')
    if (saved) {
      try { setForm(f => ({ ...f, ...JSON.parse(saved) })) } catch {}
      sessionStorage.removeItem('giveFormData')
    }
  }, [])

  const giveConfig = {
    bank_name: config.bank_name || 'First Bank Nigeria',
    account_name: config.account_name || 'Holy Spirit Outpouring Conference',
    account_number: config.account_number || '0123456789',
    sort_code: config.sort_code || '',
    additional_info: config.giving_info || 'Please use your full name as payment reference.',
    whatsapp: (config.contact_whatsapp || config.contactPhone || '2348000000000').replace(/[^\d]/g, ''),
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.location.trim() || !form.amount || Number(form.amount) <= 0) {
      toast.error('Missing Details', 'Please fill in your name, location and a valid amount.')
      return
    }
    setSubmitting(true)
    try {
      await fetch(API_BASE + '/api/giving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, amount: Number(form.amount), tier: 'Custom', reason_for_giving: form.reason ? `${form.reason} (${form.location})` : form.location }),
      })
      setStep(2)
    } catch {
      toast.error('Something Went Wrong', 'Could not submit your details. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function copyValue(label, value) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(''), 2000)
    }).catch(() => {})
  }

  const accountRows = [
    { label: 'Bank Name', value: giveConfig.bank_name },
    { label: 'Account Name', value: giveConfig.account_name },
    { label: 'Account Number', value: giveConfig.account_number },
    ...(giveConfig.sort_code ? [{ label: 'Sort Code', value: giveConfig.sort_code }] : []),
  ]

  return (
    <>
      <Navbar />
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Giving</span>
          <h1 className="page-banner-title">Support the Vision</h1>
        </div>
      </div>
      <section className="give-section" style={{ minHeight: '70vh' }}>
        <div className="container">
          {step === 1 ? (
            <>
              <div className="text-center" style={{ marginBottom: '2.5rem' }}>
                <p className="give-subtitle" style={{ margin: '0 auto' }}>Your giving enables us to host thousands and broadcast the gospel globally.</p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ background: 'rgba(22,32,50,0.8)', border: '1px solid rgba(201,5,5,0.2)', borderRadius: '16px', padding: '2.5rem', maxWidth: '560px', margin: '0 auto' }}
              >
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Full Name *</label>
                  <input required style={inputStyle} onFocus={onFocusRed} onBlur={onBlurDefault} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Location *</label>
                  <input required style={inputStyle} onFocus={onFocusRed} onBlur={onBlurDefault} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, State, Country" />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Amount (₦) *</label>
                  <input required type="number" min="1" style={inputStyle} onFocus={onFocusRed} onBlur={onBlurDefault} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Enter amount" />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {AMOUNT_PILLS.map(a => (
                    <button
                      key={a} type="button"
                      onClick={() => setForm(f => ({ ...f, amount: String(a) }))}
                      style={{
                        background: String(a) === form.amount ? '#c90505' : 'rgba(255,255,255,0.08)',
                        border: `1px solid ${String(a) === form.amount ? '#c90505' : 'rgba(255,255,255,0.2)'}`,
                        color: 'white', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      ₦{a.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reason for Giving</label>
                  <input style={inputStyle} onFocus={onFocusRed} onBlur={onBlurDefault} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Connect your giving to an expectation from God" />
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>e.g. Healing, Breakthrough, Salvation of a loved one, Business growth</p>
                </div>

                <button type="submit" className="btn btn-orange" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                  {submitting ? 'Please wait…' : 'Proceed to Payment Details'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ background: 'rgba(22,32,50,0.8)', border: '1px solid rgba(201,5,5,0.2)', borderRadius: '16px', padding: '2.5rem', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(29,158,117,0.15)', border: '2px solid #1D9E75', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>Transfer Your Gift</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
                Please transfer ₦{Number(form.amount || 0).toLocaleString()} to the account details below
              </p>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c90505', marginBottom: '1rem' }}>
                  Bank Account Details
                </div>
                {accountRows.map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{item.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', color: 'white', fontWeight: 700 }}>{item.value}</span>
                      <button
                        onClick={() => copyValue(item.label, item.value)}
                        style={{ background: 'rgba(201,5,5,0.15)', border: '1px solid rgba(201,5,5,0.3)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', color: '#c90505', fontWeight: 600, whiteSpace: 'nowrap' }}
                      >
                        {copied === item.label ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
                {giveConfig.additional_info && (
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '1rem', lineHeight: 1.6 }}>{giveConfig.additional_info}</p>
                )}
              </div>

              <div style={{ background: 'rgba(201,5,5,0.08)', border: '1px solid rgba(201,5,5,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', fontSize: '13px' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Your giving details:</div>
                <div style={{ color: 'white', fontWeight: 600 }}>{form.name} • {form.location}</div>
                <div style={{ color: '#c90505', fontWeight: 700, fontSize: '16px' }}>₦{Number(form.amount || 0).toLocaleString()}</div>
                {form.reason && <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontStyle: 'italic' }}>"{form.reason}"</div>}
              </div>

              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                After transferring please send your payment proof to our WhatsApp for confirmation.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${giveConfig.whatsapp}?text=${encodeURIComponent(`I just gave ₦${form.amount} - ${form.name} from ${form.location}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Send Proof on WhatsApp
                </a>
                <button
                  onClick={() => { setStep(1); setForm({ name: '', location: '', amount: '', reason: '' }) }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Give Again
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
