import { useState } from 'react'

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function PrayerCard({ prayer, prayedSet, onPray }) {
  const [count, setCount] = useState(prayer.prayCount)
  const prayed = prayedSet.has(prayer.id)

  async function handlePray() {
    if (prayed) return
    try {
      const res = await fetch(`/api/prayers/${prayer.id}/pray`, { method: 'PUT' })
      const data = await res.json()
      setCount(data.prayCount)
      onPray(prayer.id)
    } catch {}
  }

  return (
    <div className="prayer-card">
      <div className="prayer-card-header">
        <span className="prayer-card-cat">{prayer.category}</span>
        <span className="prayer-card-name">{prayer.name}</span>
        <span className="prayer-card-time">{relTime(prayer.createdAt)}</span>
      </div>
      <p className="prayer-card-text">{prayer.text}</p>
      <button className={`prayer-pray-btn${prayed ? ' active' : ''}`} onClick={handlePray}>
        🙏 Praying · {count}
      </button>
    </div>
  )
}
