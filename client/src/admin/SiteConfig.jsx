import { useState, useEffect } from 'react'
import { api } from '../api'

const FIELDS = [
  { key: 'siteName', label: 'Site Name', placeholder: "Outpouring '25" },
  { key: 'tagline', label: 'Tagline', placeholder: 'A Move of the Holy Spirit' },
  { key: 'heroTitle', label: 'Hero Title', placeholder: 'Holy Spirit Outpouring Conference 2025' },
  { key: 'heroSubtitle', label: 'Hero Subtitle', placeholder: 'Three days of worship, prayer, and revival' },
  { key: 'eventDates', label: 'Event Dates', placeholder: 'August 15–17, 2025' },
  { key: 'eventLocation', label: 'Event Location', placeholder: 'Lagos, Nigeria' },
  { key: 'targetDate', label: 'Countdown Target (ISO)', placeholder: '2025-08-15T18:00:00' },
  { key: 'streamUrl', label: 'Stream URL', placeholder: 'https://www.youtube.com/embed/...' },
  { key: 'streamTitle', label: 'Stream Title', placeholder: 'Holy Spirit Outpouring Conference' },
  { key: 'isLive', label: 'Is Live (true/false)', placeholder: 'false' },
  { key: 'registrationOpen', label: 'Registration Open (true/false)', placeholder: 'true' },
  { key: 'contactEmail', label: 'Contact Email', placeholder: 'info@outpouring25.org' },
  { key: 'contactPhone', label: 'Contact Phone', placeholder: '+234 XXX XXX XXXX' },
]

export default function SiteConfig() {
  const [config, setConfig] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => { setConfig(d); setLoading(false) })
  }, [])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    await api.put('/config', config)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="loading-state">Loading config…</div>

  return (
    <div>
      <h2 className="admin-page-title">Site Configuration</h2>
      {saved && <div className="alert alert-ok" style={{ marginBottom: '1.5rem' }}>Configuration saved!</div>}
      <form onSubmit={save}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {FIELDS.map(f => (
            <div className="admin-card" key={f.key} style={{ padding: '1rem' }}>
              <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>{f.label}</label>
              <input
                className="form-input"
                placeholder={f.placeholder}
                value={config[f.key] || ''}
                onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-orange" style={{ marginTop: '1.5rem' }} disabled={saving}>
          {saving ? 'Saving…' : 'Save Configuration'}
        </button>
      </form>
    </div>
  )
}
