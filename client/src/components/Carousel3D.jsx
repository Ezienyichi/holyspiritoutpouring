import { useState, useEffect, useRef, useCallback } from 'react'

export default function Carousel3D({ items, renderCard, autoAdvanceMs = 5000, className = '' }) {
  const safeItems = Array.isArray(items) ? items : []
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const timerRef = useRef(null)
  const n = safeItems.length

  const next = useCallback(() => setActive(i => (i + 1) % Math.max(n, 1)), [n])
  const prev = useCallback(() => setActive(i => (i - 1 + Math.max(n, 1)) % Math.max(n, 1)), [n])

  useEffect(() => {
    if (paused || n <= 1) return
    timerRef.current = setInterval(next, autoAdvanceMs)
    return () => clearInterval(timerRef.current)
  }, [paused, next, autoAdvanceMs, n])

  function getTransform(idx) {
    const offset = ((idx - active + n) % n)
    const rel = offset <= n / 2 ? offset : offset - n // -2,-1,0,1,2

    if (rel === 0) return {
      transform: 'translateX(-50%) scale(1.05)',
      opacity: 1, zIndex: 10, filter: 'none', pointerEvents: 'auto',
    }
    if (rel === -1) return {
      transform: 'translateX(calc(-50% - 300px)) scale(0.85) rotateY(8deg)',
      opacity: 0.6, zIndex: 5, filter: 'blur(1px)', pointerEvents: 'auto',
    }
    if (rel === 1) return {
      transform: 'translateX(calc(-50% + 300px)) scale(0.85) rotateY(-8deg)',
      opacity: 0.6, zIndex: 5, filter: 'blur(1px)', pointerEvents: 'auto',
    }
    return {
      transform: `translateX(calc(-50% + ${rel * 400}px)) scale(0.65)`,
      opacity: 0, zIndex: 1, pointerEvents: 'none',
    }
  }

  function handleTouchStart(e) { setDragStart(e.touches[0].clientX) }
  function handleTouchEnd(e) {
    if (dragStart === null) return
    const diff = e.changedTouches[0].clientX - dragStart
    if (Math.abs(diff) > 40) diff > 0 ? prev() : next()
    setDragStart(null)
  }

  if (n === 0) return null

  return (
    <div
      className={`c3d-wrapper${className ? ' ' + className : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="c3d-stage">
        {safeItems.map((item, idx) => (
          <div
            key={idx}
            className="c3d-card"
            style={{ transition: 'all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)', ...getTransform(idx) }}
            onClick={() => idx !== active && (((idx - active + n) % n) <= n / 2 ? next() : prev())}
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
