import { useState, useEffect, useCallback } from 'react'

export default function Carousel3D({ items, renderCard, autoAdvanceMs = 5000, cardWidth = 320, cardHeight = 420, className = '' }) {
  const safeItems = Array.isArray(items) ? items : []
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const n = safeItems.length

  const next = useCallback(() => setActive(i => (i + 1) % Math.max(n, 1)), [n])
  const prev = useCallback(() => setActive(i => (i - 1 + Math.max(n, 1)) % Math.max(n, 1)), [n])

  useEffect(() => {
    if (paused || n <= 1) return
    const timer = setInterval(next, autoAdvanceMs)
    return () => clearInterval(timer)
  }, [paused, next, autoAdvanceMs, n])

  const sideOff = cardWidth + 20
  const farOff = cardWidth + 260

  function getTransform(idx) {
    const raw = (idx - active + n) % n
    const rel = raw <= n / 2 ? raw : raw - n
    if (rel === 0) return { transform: 'translateX(-50%) scale(1)', opacity: 1, zIndex: 10, filter: 'none', pointerEvents: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }
    if (rel === -1) return { transform: `translateX(calc(-50% - ${sideOff}px)) scale(0.88)`, opacity: 0.65, zIndex: 5, filter: 'blur(1.5px) brightness(0.8)', pointerEvents: 'auto' }
    if (rel === 1) return { transform: `translateX(calc(-50% + ${sideOff}px)) scale(0.88)`, opacity: 0.65, zIndex: 5, filter: 'blur(1.5px) brightness(0.8)', pointerEvents: 'auto' }
    if (rel === -2) return { transform: `translateX(calc(-50% - ${farOff}px)) scale(0.72)`, opacity: 0.3, zIndex: 2, filter: 'blur(3px) brightness(0.6)', pointerEvents: 'none' }
    if (rel === 2) return { transform: `translateX(calc(-50% + ${farOff}px)) scale(0.72)`, opacity: 0.3, zIndex: 2, filter: 'blur(3px) brightness(0.6)', pointerEvents: 'none' }
    return { transform: 'translateX(-50%)', opacity: 0, zIndex: 1, pointerEvents: 'none' }
  }

  if (n === 0) return null

  return (
    <div
      className={`c3d-wrapper${className ? ' ' + className : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={e => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={e => {
        if (touchStart === null) return
        const diff = e.changedTouches[0].clientX - touchStart
        if (Math.abs(diff) > 50) diff > 0 ? prev() : next()
        setTouchStart(null)
      }}
    >
      <div className="c3d-stage" style={{ height: cardHeight + 40 }}>
        {safeItems.map((item, idx) => (
          <div
            key={idx}
            className="c3d-card"
            style={{
              width: cardWidth,
              height: cardHeight,
              transition: 'all 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
              ...getTransform(idx),
            }}
            onClick={() => {
              if (idx === active) return
              const raw = (idx - active + n) % n
              const rel = raw <= n / 2 ? raw : raw - n
              rel < 0 ? prev() : next()
            }}
          >
            {renderCard(item, idx === active)}
          </div>
        ))}
      </div>

      <button className="c3d-arrow c3d-arrow-left" onClick={prev} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button className="c3d-arrow c3d-arrow-right" onClick={next} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div className="c3d-dots">
        {safeItems.map((_, idx) => (
          <button
            key={idx}
            className={`c3d-dot${idx === active ? ' active' : ''}`}
            onClick={() => setActive(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
