import { useState, useEffect } from 'react'
import { api } from '../api'
import { useToast } from '../context/ToastContext'

const API_BASE = import.meta.env.VITE_API_URL || ''

/* ── Helpers ── */
function isOn(v) { return v === 'true' || v === true || v === 1 || v === '1' }

function toEmbedUrl(url) {
  if (!url) return ''
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1`
  return url
}

/* ── Toggle ── */
function Toggle({ value, onChange, labelOn = 'ON', labelOff = 'OFF', colorOn = 'var(--orange)' }) {
  const on = isOn(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <button
        type="button"
        onClick={() => onChange(on ? 'false' : 'true')}
        style={{
          width: 52, height: 28, borderRadius: 14, flexShrink: 0,
          background: on ? colorOn : 'var(--navy-border)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 4, left: on ? 28 : 4,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: on ? colorOn : 'var(--text-muted)' }}>
        {on ? labelOn : labelOff}
      </span>
    </div>
  )
}

/* ── Accordion Section ── */
function Section({ id, open, onToggle, title, icon, children }) {
  const isOpen = open === id
  return (
    <div style={{ borderBottom: '1px solid var(--navy-border)' }}>
      <button
        type="button"
        onClick={() => onToggle(isOpen ? null : id)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', background: isOpen ? 'rgba(232,98,42,0.08)' : 'transparent',
          border: 'none', cursor: 'pointer',
          color: isOpen ? 'var(--orange)' : 'var(--text-light)',
          fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {icon}
          {title}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div style={{ padding: '1.5rem' }}>{children}</div>}
    </div>
  )
}

/* ── Save Button ── */
function SaveBtn({ onClick, saving }) {
  return (
    <button
      type="button"
      className="btn btn-orange"
      onClick={onClick}
      disabled={saving}
      style={{ marginTop: '1.25rem' }}
    >
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

/* ── Field helpers ── */
function FG({ label, hint, children, charCount, max }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{hint}</div>}
      {max != null && <div style={{ fontSize: '0.72rem', color: charCount > max * 0.9 ? 'var(--orange)' : 'var(--text-muted)', marginTop: '0.3rem', textAlign: 'right' }}>{charCount}/{max}</div>}
    </div>
  )
}

export default function SiteConfig() {
  const toast = useToast()
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState('general')
  const [regCount, setRegCount] = useState(null)

  useEffect(() => {
    fetch(API_BASE + '/api/config')
      .then(r => r.json())
      .then(d => { setConfig((d && typeof d === 'object' && !Array.isArray(d)) ? d : {}); setLoading(false) })
      .catch(() => setLoading(false))
    api.get('/registrations').then(d => setRegCount(Array.isArray(d) ? d.length : null)).catch(() => {})
  }, [])

  const set = k => val => setConfig(c => ({ ...c, [k]: val }))
  const inp = k => ({ className: 'form-input', value: config[k] ?? '', onChange: e => set(k)(e.target.value) })
  const ta = k => ({ className: 'form-textarea', value: config[k] ?? '', onChange: e => set(k)(e.target.value) })

  async function saveKeys(keys) {
    setSaving(true)
    try {
      const payload = {}
      keys.forEach(k => { payload[k] = config[k] ?? '' })
      const updated = await api.put('/config', payload)
      if (typeof updated === 'object' && updated !== null && !updated.success) {
        setConfig(c => ({ ...c, ...updated }))
      }
      toast.success('Settings Saved', 'Your changes have been saved successfully.')
    } catch (e) {
      toast.error('Save Failed', e.message || 'Could not save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-state">Loading configuration…</div>

  const streamUrl = config.streamUrl || ''
  const embedPreview = toEmbedUrl(streamUrl)
  const annActive = isOn(config.announcement_active)
  const regOpen = isOn(config.registration_open)

  return (
    <div>
      <h2 className="admin-page-title">Site Configuration</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Manage all website content, SEO, and settings. Click any section to expand it.
      </p>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* ── 1. General ── */}
        <Section id="general" open={open} onToggle={setOpen} title="General Settings"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>}>
          <FG label="Site Title"><input {...inp('site_title')} /></FG>
          <FG label="Site Tagline"><input {...inp('site_tagline')} /></FG>
          <FG label="Site Description" max={160} charCount={(config.site_description || '').length} hint="Shown in Google search results">
            <textarea {...ta('site_description')} rows={3} maxLength={160} />
          </FG>
          <FG label="SEO Keywords" hint="Comma separated: Holy Spirit, Revival, Conference, Nigeria">
            <input {...inp('site_keywords')} />
          </FG>
          <FG label="Logo URL"><input {...inp('site_logo_url')} placeholder="https://…" /></FG>
          <FG label="Favicon URL"><input {...inp('favicon_url')} placeholder="https://…" /></FG>
          <SaveBtn onClick={() => saveKeys(['site_title','site_tagline','site_description','site_keywords','site_logo_url','favicon_url'])} saving={saving} />
        </Section>

        {/* ── 2. Conference Details ── */}
        <Section id="conference" open={open} onToggle={setOpen} title="Conference Details"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FG label="Conference Name"><input {...inp('conference_name')} /></FG>
            <FG label="Conference Year"><input {...inp('conference_year')} /></FG>
            <FG label="Conference Dates" hint="e.g. August 15–17, 2025"><input {...inp('conference_dates')} /></FG>
            <FG label="Countdown Target Date"><input type="datetime-local" {...inp('countdownDate')} /></FG>
            <FG label="Venue Name"><input {...inp('venue_name')} /></FG>
            <FG label="Venue Address"><input {...inp('venue_address')} /></FG>
            <FG label="City"><input {...inp('venue_city')} /></FG>
            <FG label="State"><input {...inp('venue_state')} /></FG>
            <FG label="Country"><input {...inp('venue_country')} /></FG>
            <FG label="Postal Code"><input {...inp('venue_postal_code')} /></FG>
          </div>
          <FG label="Google / Bing Maps URL" hint="Wrap the venue address in a map link">
            <input {...inp('venue_map_url')} placeholder="https://maps.google.com/…" />
          </FG>
          <SaveBtn onClick={() => saveKeys(['conference_name','conference_dates','conference_year','countdownDate','venue_name','venue_address','venue_city','venue_state','venue_country','venue_postal_code','venue_map_url'])} saving={saving} />
        </Section>

        {/* ── 3. Contact ── */}
        <Section id="contact" open={open} onToggle={setOpen} title="Contact Information"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.1 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.9a16 16 0 0 0 5.54 5.54l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}>
          <FG label="Contact Email"><input type="email" {...inp('contactEmail')} placeholder="info@outpouring25.org" /></FG>
          <FG label="Contact Phone"><input type="tel" {...inp('contactPhone')} placeholder="+234 800 000 0000" /></FG>
          <FG label="WhatsApp Number"><input type="tel" {...inp('contact_whatsapp')} placeholder="+234 800 000 0000" /></FG>
          <SaveBtn onClick={() => saveKeys(['contactEmail','contactPhone','contact_whatsapp'])} saving={saving} />
        </Section>

        {/* ── 4. Social Media ── */}
        <Section id="social" open={open} onToggle={setOpen} title="Social Media Links"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>}>
          {[
            ['social_instagram','Instagram','https://www.instagram.com/hsoutpouring/'],
            ['social_facebook','Facebook','https://web.facebook.com/Holyspiritoutpouring/'],
            ['social_youtube','YouTube','https://www.youtube.com/@holyspiritoutpouring-o6s'],
            ['social_twitter','X (Twitter)','https://x.com/…'],
            ['social_tiktok','TikTok','https://www.tiktok.com/@…'],
          ].map(([k,lbl,ph]) => (
            <FG key={k} label={lbl}><input type="url" {...inp(k)} placeholder={ph} /></FG>
          ))}
          <SaveBtn onClick={() => saveKeys(['social_instagram','social_facebook','social_youtube','social_twitter','social_tiktok'])} saving={saving} />
        </Section>

        {/* ── 5. Livestream ── */}
        <Section id="livestream" open={open} onToggle={setOpen} title="Livestream Settings"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="2"/><path d="M16.72 7.28a6 6 0 0 1 0 9.44M7.28 7.28a6 6 0 0 0 0 9.44"/><path d="M19.7 4.3a10 10 0 0 1 0 15.4M4.3 4.3a10 10 0 0 0 0 15.4"/></svg>}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: isOn(config.isLive) ? 'rgba(244,68,68,0.1)' : 'rgba(100,116,139,0.1)', borderRadius: 10, marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: isOn(config.isLive) ? '#f44444' : 'var(--text-muted)', fontSize: '1rem' }}>
                {isOn(config.isLive) ? 'STREAM IS LIVE' : 'STREAM IS OFFLINE'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Toggle to show or hide the live stream on the website</div>
            </div>
            <Toggle value={config.isLive} onChange={set('isLive')} labelOn="LIVE" labelOff="OFFLINE" colorOn="#f44444" />
          </div>
          <FG label="YouTube Channel ID" hint="Find in YouTube Studio → Settings. Starts with UC. Used for auto-embed when no stream URL is set.">
            <input {...inp('youtube_channel_id')} placeholder="UCxxxxxxxxxxxxxxxxxxxxxxxx" />
          </FG>
          <FG label="YouTube Channel URL">
            <input type="url" {...inp('youtube_channel_url')} placeholder="https://www.youtube.com/@yourchannel" />
          </FG>
          <FG label="Stream Title">
            <input {...inp('streamTitle')} placeholder="Opening Night — Holy Spirit Outpouring Conference" />
          </FG>
          <FG label="Stream Description">
            <textarea {...ta('stream_description')} rows={2} placeholder="Brief description shown to viewers…" />
          </FG>
          <FG label="Stream URL" hint="Paste a YouTube watch URL — it auto-converts to embed format.">
            <input
              {...inp('streamUrl')}
              placeholder="https://www.youtube.com/watch?v=… or embed URL"
              onBlur={e => {
                const converted = toEmbedUrl(e.target.value)
                if (converted !== e.target.value) set('streamUrl')(converted)
              }}
            />
          </FG>
          {embedPreview && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stream Preview</div>
              <div style={{ position: 'relative', paddingTop: '56.25%', maxWidth: 480, borderRadius: 10, overflow: 'hidden', background: 'var(--navy)' }}>
                <iframe src={embedPreview} title="Stream Preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
              </div>
            </div>
          )}
          <SaveBtn onClick={() => saveKeys(['isLive','youtube_channel_id','youtube_channel_url','streamTitle','stream_description','streamUrl'])} saving={saving} />
        </Section>

        {/* ── 6. About Section ── */}
        <Section id="about" open={open} onToggle={setOpen} title="About Section Content"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}>
          <FG label="About Heading"><input {...inp('about_heading')} placeholder="A Divine Gathering for Such a Time" /></FG>
          <FG label="About Section Flyer / Image" hint="Upload a landscape (16:9) conference flyer or event photo. Shows in the About section image box.">
            <input type="url" {...inp('about_image_url')} placeholder="https://… or upload via Cloudinary" />
            {config.about_image_url && (
              <img src={config.about_image_url} alt="About flyer preview" style={{ marginTop: '0.5rem', width: '100%', maxWidth: 480, aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display = 'none'} />
            )}
          </FG>
          <FG label="About Paragraph 1"><textarea {...ta('aboutText1')} rows={4} /></FG>
          <FG label="About Paragraph 2"><textarea {...ta('aboutText2')} rows={4} /></FG>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 1rem' }}>
            <FG label="Expected Attendees"><input {...inp('about_stats_attendees')} placeholder="10K+" /></FG>
            <FG label="Speakers"><input {...inp('about_stats_speakers')} placeholder="8+" /></FG>
            <FG label="Days"><input {...inp('about_stats_days')} placeholder="3" /></FG>
            <FG label="Sessions"><input {...inp('about_stats_sessions')} placeholder="40+" /></FG>
          </div>
          <SaveBtn onClick={() => saveKeys(['about_heading','about_image_url','aboutText1','aboutText2','about_stats_attendees','about_stats_speakers','about_stats_days','about_stats_sessions'])} saving={saving} />
        </Section>

        {/* ── 7. SEO ── */}
        <Section id="seo" open={open} onToggle={setOpen} title="SEO & Meta Tags"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}>
          <div style={{ background: 'rgba(232,98,42,0.07)', border: '1px solid rgba(232,98,42,0.2)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            These fields control how your site appears when shared on WhatsApp, Facebook, and in Google search results.
          </div>
          <FG label="OG Title (Social Share Title)"><input {...inp('og_title')} /></FG>
          <FG label="OG Description" max={160} charCount={(config.og_description || '').length}>
            <textarea {...ta('og_description')} rows={3} maxLength={160} />
          </FG>
          <FG label="OG Image URL" hint="Recommended: 1200×630px image for social sharing">
            <input type="url" {...inp('og_image_url')} placeholder="https://…" />
            {config.og_image_url && (
              <img src={config.og_image_url} alt="OG Preview" style={{ marginTop: '0.5rem', maxWidth: 240, borderRadius: 6 }} onError={e => e.target.style.display = 'none'} />
            )}
          </FG>
          <FG label="Canonical URL"><input type="url" {...inp('canonical_url')} /></FG>
          <FG label="Twitter Card">
            <select className="form-select" value={config.twitter_card || 'summary_large_image'} onChange={e => set('twitter_card')(e.target.value)}>
              <option value="summary_large_image">Summary Large Image</option>
              <option value="summary">Summary</option>
            </select>
          </FG>
          <SaveBtn onClick={() => saveKeys(['og_title','og_description','og_image_url','canonical_url','twitter_card'])} saving={saving} />
        </Section>

        {/* ── 8. Registration ── */}
        <Section id="registration" open={open} onToggle={setOpen} title="Registration Settings"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: regOpen ? 'rgba(74,247,138,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 10, marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: regOpen ? '#4af78a' : '#f87171', fontSize: '0.9rem' }}>
                Registration is {regOpen ? 'Open' : 'Closed'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>When closed, the registration form is hidden from the public site</div>
            </div>
            <Toggle value={config.registration_open} onChange={set('registration_open')} labelOn="OPEN" labelOff="CLOSED" colorOn="#4af78a" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FG label="Registration Deadline"><input type="date" {...inp('registration_deadline')} /></FG>
            <FG label={`Max Attendees${regCount != null ? ` (${regCount} registered so far)` : ''}`}>
              <input type="number" {...inp('max_attendees')} placeholder="10000" />
            </FG>
          </div>
          <SaveBtn onClick={() => saveKeys(['registration_open','registration_deadline','max_attendees'])} saving={saving} />
        </Section>

        {/* ── 9. Announcements ── */}
        <Section id="announcements" open={open} onToggle={setOpen} title="Announcements"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>}>
          <FG label="Announcement Text" hint="Shown as a banner at the top of every page. Leave blank to hide.">
            <textarea {...ta('announcement_text')} rows={2} placeholder="e.g. Registration closes August 14. Register now to secure your place." />
          </FG>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label className="form-label" style={{ marginBottom: 0 }}>Show Banner on Public Site</label>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Toggle ON to display the announcement banner to all visitors</div>
            </div>
            <Toggle value={config.announcement_active} onChange={set('announcement_active')} labelOn="VISIBLE" labelOff="HIDDEN" />
          </div>
          {config.announcement_text && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Banner Preview</div>
              <div style={{ background: '#E8622A', color: 'white', fontSize: 13, textAlign: 'center', padding: '10px 48px', borderRadius: 8, position: 'relative' }}>
                {config.announcement_text}
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.7, fontSize: 18 }}>×</span>
              </div>
            </div>
          )}
          <SaveBtn onClick={() => saveKeys(['announcement_text','announcement_active'])} saving={saving} />
        </Section>

        {/* ── 10. Footer ── */}
        <Section id="footer" open={open} onToggle={setOpen} title="Footer Settings"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="15" x2="21" y2="15"/></svg>}>
          <FG label="Footer Tagline"><input {...inp('footer_tagline')} placeholder="A divine gathering for spiritual renewal…" /></FG>
          <FG label="Copyright Text"><input {...inp('copyright_text')} placeholder="© 2025 Holy Spirit Outpouring Conference. All rights reserved." /></FG>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Show Social Media Icons in Footer</label>
            <Toggle value={config.show_social_links} onChange={set('show_social_links')} labelOn="VISIBLE" labelOff="HIDDEN" />
          </div>
          <SaveBtn onClick={() => saveKeys(['footer_tagline','copyright_text','show_social_links'])} saving={saving} />
        </Section>

      </div>
    </div>
  )
}
