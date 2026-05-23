export default function MediaCard({ item }) {
  return (
    <div className="media-card">
      <img src={item.url} alt={item.title || item.caption || 'Media'} loading="lazy" />
      <div className="media-card-overlay">
        {item.type === 'video'
          ? <div className="media-play-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
          : <span className="media-overlay-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </span>}
      </div>
    </div>
  )
}
