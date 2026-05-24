import { useState, useEffect } from 'react'

function getTimeLeft(target) {
  const diff = new Date(target) - new Date()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export default function CountdownTimer({ targetDate = '2025-08-15T18:00:00' }) {
  const [time, setTime] = useState(getTimeLeft(targetDate))

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Minutes' },
    { value: time.seconds, label: 'Seconds' },
  ]

  return (
    <div className="countdown">
      {units.flatMap((u, i) => [
        i > 0 ? <div key={`div-${i}`} className="countdown-divider" /> : null,
        <div key={u.label} className="countdown-unit">
          <span className="countdown-num">{String(u.value).padStart(2, '0')}</span>
          <span className="countdown-lbl">{u.label.toUpperCase()}</span>
        </div>,
      ]).filter(Boolean)}
    </div>
  )
}
