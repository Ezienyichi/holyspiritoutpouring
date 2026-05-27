import { useState, useEffect, useRef } from 'react'

export default function Carousel3D({
  items,
  renderCard,
  autoAdvanceMs = 5000,
  cardWidth = 320,
  cardHeight = 420,
}) {
  const safeItems = Array.isArray(items) ? items : []
  const n = safeItems.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [hoverArrow, setHoverArrow] = useState(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    if (isPaused || n <= 1) return
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % n)
    }, autoAdvanceMs)
    return () => clearInterval(timer)
  }, [isPaused, n, autoAdvanceMs])

  if (n === 0) return null

  const cw = isMobile ? Math.min(cardWidth, 260) : cardWidth
  const ch = isMobile ? Math.min(cardHeight, 340) : cardHeight
  const arrowSize = isMobile ? 44 : 52

  function getDiff(index) {
    let diff = index - activeIndex
    if (diff > n / 2) diff -= n
    if (diff < -n / 2) diff += n
    return diff
  }

  function getStyle(index) {
    const diff = getDiff(index)
    const base = {
      position: 'absolute',
      left: '50%',
      marginLeft: -cw / 2,
      top: '50%',
      marginTop: -ch / 2,
      width: cw,
      height: ch,
      borderRadius: 20,
      overflow: 'hidden',
      transition: 'all 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
      transformOrigin: 'center center',
    }
    if (diff === 0) return {
      ...base,
      transform: 'translateX(0) scale(1)',
      opacity: 1, filter: 'none', zIndex: 10,
      boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
      pointerEvents: 'auto', cursor: 'default',
    }
    if (diff === -1) return {
      ...base,
      transform: isMobile ? 'translateX(-280px) scale(0.82)' : 'translateX(-360px) scale(0.87)',
      opacity: 0.6, filter: 'blur(2px) brightness(0.75)',
      zIndex: 5, pointerEvents: 'auto', cursor: 'pointer',
    }
    if (diff === 1) return {
      ...base,
      transform: isMobile ? 'translateX(280px) scale(0.82)' : 'translateX(360px) scale(0.87)',
      opacity: 0.6, filter: 'blur(2px) brightness(0.75)',
      zIndex: 5, pointerEvents: 'auto', cursor: 'pointer',
    }
    if (!isMobile && diff === -2) return {
      ...base,
      transform: 'translateX(-600px) scale(0.72)',
      opacity: 0.25, filter: 'blur(4px) brightness(0.5)',
      zIndex: 2, pointerEvents: 'none',
    }
    if (!isMobile && diff === 2) return {
      ...base,
      transform: 'translateX(600px) scale(0.72)',
      opacity: 0.25, filter: 'blur(4px) brightness(0.5)',
      zIndex: 2, pointerEvents: 'none',
    }
    return { ...base, opacity: 0, zIndex: 0, pointerEvents: 'none', transform: 'translateX(0)' }
  }

  const arrowStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: isMobile ? 8 : 'calc(50% - 240px)',
    width: arrowSize,
    height: arrowSize,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hoverArrow === side ? '#c90505' : '#FFFFFF',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    transition: 'all 0.2s',
    flexShrink: 0,
  })

  const stageH = ch + (isMobile ? 60 : 80)

  return (
    <div
      style={{ position: 'relative', width: '100%', userSelect: 'none' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); setHoverArrow(null) }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) {
          if (diff > 0) setActiveIndex(p => (p + 1) % n)
          else setActiveIndex(p => (p - 1 + n) % n)
        }
        touchStartX.current = null
      }}
    >
      {/* Stage */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: stageH,
        minHeight: isMobile ? 400 : 500,
        overflow: 'hidden',
      }}>
        {safeItems.map((item, idx) => (
          <div
            key={idx}
            style={getStyle(idx)}
            onClick={() => {
              const diff = getDiff(idx)
              if (diff === 0) return
              if (diff < 0) setActiveIndex(p => (p - 1 + n) % n)
              else setActiveIndex(p => (p + 1) % n)
            }}
          >
            {renderCard(item, idx === activeIndex)}
          </div>
        ))}

        <button
          aria-label="Previous"
          onMouseEnter={() => setHoverArrow('left')}
          onMouseLeave={() => setHoverArrow(null)}
          onClick={e => { e.stopPropagation(); setActiveIndex(p => (p - 1 + n) % n) }}
          style={arrowStyle('left')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={hoverArrow === 'left' ? 'white' : '#040102'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <button
          aria-label="Next"
          onMouseEnter={() => setHoverArrow('right')}
          onMouseLeave={() => setHoverArrow(null)}
          onClick={e => { e.stopPropagation(); setActiveIndex(p => (p + 1) % n) }}
          style={arrowStyle('right')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={hoverArrow === 'right' ? 'white' : '#040102'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 36 }}>
        {safeItems.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setActiveIndex(idx)}
            style={{
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              borderRadius: idx === activeIndex ? 4 : '50%',
              width: idx === activeIndex ? 28 : 8,
              height: 8,
              background: idx === activeIndex ? '#c90505' : '#CCCCCC',
              transition: 'all 0.3s',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
