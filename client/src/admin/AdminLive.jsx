import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  padding: '12px 16px',
  color: 'white',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: 'rgba(255,255,255,0.6)',
  marginBottom: '6px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const hintStyle = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.3)',
  marginTop: '6px',
}

export default function AdminLive() {
  const toast = useToast()
  const [form, setForm] = useState({
    youtube_channel_id: '',
    youtube_channel_url: '',
    stream_url: '',
    stream_title: '',
    is_live: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${BASE_URL}/api/config`)
      .then(r => r.ok ? r.json() : {})
      .then(d => {
        setForm({
          youtube_channel_id: d.youtube_channel_id || '',
          youtube_channel_url: d.youtube_channel_url || '',
          stream_url: d.stream_url || '',
          stream_title: d.stream_title || '',
          is_live: d.is_live == 1 ? 1 : 0,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${BASE_URL}/api/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          youtube_channel_id: form.youtube_channel_id,
          youtube_channel_url: form.youtube_channel_url,
          stream_url: form.stream_url,
          stream_title: form.stream_title,
          is_live: form.is_live,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success(
        'Stream settings saved',
        form.is_live == 1
          ? 'Your stream is now LIVE on the website'
          : 'Stream settings saved. Toggle GO LIVE when ready.'
      )
    } catch (err) {
      toast.error('Save failed', err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-state">Loading…</div>

  return (
    <div style={{ maxWidth: '640px' }}>
      <h2 className="admin-page-title" style={{ marginBottom: '0.5rem' }}>Live Stream Control</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '2rem' }}>
        Set your YouTube Channel ID once — the live page automatically shows your stream whenever you go live.
      </p>

      <div style={{ background: 'var(--navy-mid)', border: '1px solid var(--navy-border)', borderRadius: '16px', padding: '2rem' }}>

        {/* Stream Status Toggle */}
        <div style={{
          background: form.is_live == 1 ? 'rgba(201,5,5,0.1)' : 'rgba(255,255,255,0.04)',
          border: form.is_live == 1 ? '2px solid rgba(201,5,5,0.4)' : '2px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
              Stream Status
            </div>
            <div style={{ fontSize: '13px', color: form.is_live == 1 ? '#c90505' : 'rgba(255,255,255,0.4)' }}>
              {form.is_live == 1
                ? 'LIVE — Visitors can see your stream'
                : 'OFFLINE — Stream placeholder is showing'}
            </div>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, is_live: f.is_live == 1 ? 0 : 1 }))}
            style={{
              background: form.is_live == 1 ? '#c90505' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: form.is_live == 1 ? 'white' : 'rgba(255,255,255,0.3)',
              animation: form.is_live == 1 ? 'blink 1s ease-in-out infinite alternate' : 'none',
            }} />
            {form.is_live == 1 ? 'GO OFFLINE' : 'GO LIVE'}
          </button>
        </div>

        {/* YouTube Channel ID */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>YouTube Channel ID</label>
          <input
            type="text"
            value={form.youtube_channel_id}
            onChange={e => setForm(f => ({ ...f, youtube_channel_id: e.target.value }))}
            placeholder="UCxxxxxxxxxxxxxxxxxxxxxxxx"
            style={{ ...inputStyle, fontFamily: 'monospace' }}
            onFocus={e => e.target.style.borderColor = '#c90505'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
          />
          <p style={hintStyle}>
            When set, the live page automatically embeds your channel stream whenever you go live on YouTube — no URL needed each time.
          </p>
          <p style={{ ...hintStyle, marginTop: '4px' }}>
            Find your Channel ID: YouTube Studio → Settings → Channel → Basic Info → Channel ID (starts with UC)
          </p>
        </div>

        {/* YouTube Channel URL */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>YouTube Channel URL</label>
          <input
            type="url"
            value={form.youtube_channel_url}
            onChange={e => setForm(f => ({ ...f, youtube_channel_url: e.target.value }))}
            placeholder="https://www.youtube.com/@holyspiritoutpouring-o6s"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#c90505'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
          />
          <p style={hintStyle}>Used for the Subscribe button on the offline placeholder screen.</p>
        </div>

        {/* Specific Stream URL */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Specific Stream URL <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional override)</span></label>
          <input
            type="url"
            value={form.stream_url}
            onChange={e => setForm(f => ({ ...f, stream_url: e.target.value }))}
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#c90505'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
          />
          <p style={hintStyle}>
            Optional: paste a specific YouTube video URL to override the channel embed. Leave empty to use the channel auto-embed. Accepts watch URLs, live URLs, or embed URLs — auto-converted.
          </p>
        </div>

        {/* Stream Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={labelStyle}>Stream Title</label>
          <input
            type="text"
            value={form.stream_title}
            onChange={e => setForm(f => ({ ...f, stream_title: e.target.value }))}
            placeholder="e.g. Opening Night — Holy Spirit Outpouring 2026"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#c90505'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            background: saving ? '#7a0303' : '#c90505',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: saving ? 'not-allowed' : 'pointer',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {saving ? 'Saving…' : 'Save Stream Settings'}
        </button>
      </div>

      {/* How it works */}
      <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>How to go live</div>
        {[
          'Start your YouTube live stream in YouTube Studio',
          'Come back here and click GO LIVE',
          'Click Save Stream Settings',
          'Your website live page now shows your stream automatically',
          'When the service ends, click GO OFFLINE and Save',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#c90505', color: 'white', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
              {i + 1}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.5' }}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
