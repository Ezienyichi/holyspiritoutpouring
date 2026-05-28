export default function AdminTestimonials() {
  return (
    <div>
      <h2 className="admin-page-title">Testimonials</h2>
      <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: '1rem', opacity: 0.4 }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem' }}>Testimonials — Coming Soon</p>
        <p style={{ fontSize: '0.85rem' }}>This section will allow you to manage attendee testimonials displayed on the website.</p>
      </div>
    </div>
  )
}
