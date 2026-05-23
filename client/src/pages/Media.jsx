import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MediaCard from '../components/MediaCard'

export default function Media() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/media').then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? items : items.filter(m => m.type === filter)

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
          <div className="media-filter-tabs" style={{ marginBottom: '2rem' }}>
            {[['all','📷 All'],['photo','🖼️ Photos'],['video','🎬 Videos']].map(([val,lbl]) => (
              <button key={val} className={`media-tab${filter===val?' active':''}`} onClick={()=>setFilter(val)}>{lbl}</button>
            ))}
          </div>
          {loading ? <div className="loading-state">Loading…</div> : (
            <div className="media-masonry">
              {filtered.map(item => <MediaCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
