import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s?]+)/)
  return m ? m[1] : null
}

function VideoCard({ item, onPlay }) {
  const thumb = item.thumbnailUrl || item.url
  return (
    <div className="video-card" onClick={() => onPlay(item)}>
      <div className="video-card-thumb">
        <img src={thumb} alt={item.title || item.caption} loading="lazy" onError={e => { e.target.style.display = 'none' }} />
        <div className="video-card-overlay" />
        <div className="video-play-circle">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div className="video-card-title">{item.title || item.caption}</div>
      </div>
    </div>
  )
}

function PhotoCard({ item }) {
  return (
    <div className="media-card">
      <img src={item.url} alt={item.title || item.caption || 'Photo'} loading="lazy" />
      <div className="media-card-overlay">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.85 }}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
        </svg>
      </div>
    </div>
  )
}

function Lightbox({ item, onClose }) {
  const ytId = item.youtubeId || getYouTubeId(item.youtubeUrl || item.url)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <div className="lightbox-video-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={item.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {(item.title || item.caption) && (
          <p className="lightbox-title">{item.title || item.caption}</p>
        )}
      </div>
    </div>
  )
}

export default function Media() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [lightboxItem, setLightboxItem] = useState(null)

  useEffect(() => {
    fetch('/api/media').then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }, [])

  useEffect(() => {
    document.body.style.overflow = lightboxItem ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxItem])

  const filtered = filter === 'all' ? items : items.filter(m => m.type === filter)
  const photos = filtered.filter(m => m.type === 'photo')
  const videos = filtered.filter(m => m.type === 'video')

  return (
    <>
      <Navbar />
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Gallery</span>
          <h1 className="page-banner-title">Photos & Videos</h1>
        </div>
      </div>
      <section className="section section-mid">
        <div className="container">
          <div className="media-filter-tabs" style={{ marginBottom: '2.5rem' }}>
            {[['all','All'],['photo','Photos'],['video','Videos']].map(([val,lbl]) => (
              <button key={val} className={`media-tab${filter===val?' active':''}`} onClick={() => setFilter(val)}>{lbl}</button>
            ))}
          </div>

          {loading ? <div className="loading-state">Loading…</div> : (
            <>
              {(filter === 'all' || filter === 'video') && videos.length > 0 && (
                <div style={{ marginBottom: filter === 'all' ? '3rem' : 0 }}>
                  {filter === 'all' && (
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Videos</h3>
                  )}
                  <div className="video-grid">
                    {videos.map(item => (
                      <VideoCard key={item.id} item={item} onPlay={setLightboxItem} />
                    ))}
                  </div>
                </div>
              )}

              {(filter === 'all' || filter === 'photo') && photos.length > 0 && (
                <div>
                  {filter === 'all' && (
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Photos</h3>
                  )}
                  <div className="media-masonry">
                    {photos.map(item => <PhotoCard key={item.id} item={item} />)}
                  </div>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="loading-state">No items found.</div>
              )}
            </>
          )}
        </div>
      </section>

      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}

      <Footer />
    </>
  )
}
