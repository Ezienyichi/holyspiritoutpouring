export default function MediaCard({ item }) {
  return (
    <div className="media-card">
      <img src={item.url} alt={item.title || item.caption || 'Media'} loading="lazy" />
      <div className="media-card-overlay">
        {item.type === 'video'
          ? <div className="media-play-btn">▶</div>
          : <span className="media-overlay-icon">📷</span>}
      </div>
    </div>
  )
}
