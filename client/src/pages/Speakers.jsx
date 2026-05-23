import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SpeakerCard from '../components/SpeakerCard'

export default function Speakers() {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/speakers').then(r => r.json()).then(d => { setSpeakers(d); setLoading(false) })
  }, [])

  return (
    <>
      <Navbar />
      <div className="page-banner">
        <div className="container">
          <span className="page-banner-label">Anointed Voices</span>
          <h1 className="page-banner-title">Featured Speakers</h1>
        </div>
      </div>
      <section className="section section-mid">
        <div className="container">
          {loading ? <div className="loading-state">Loading speakers…</div> : (
            <div className="speakers-grid">
              {speakers.map((s, i) => <SpeakerCard key={s.id} speaker={s} index={i} />)}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
