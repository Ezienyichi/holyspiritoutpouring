import { useState, useEffect } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || ''

let cachedConfig = null
const listeners = new Set()

export function invalidateConfig() {
  cachedConfig = null
}

export function useSiteConfig() {
  const [config, setConfig] = useState(cachedConfig || {})
  const [loading, setLoading] = useState(!cachedConfig)

  useEffect(() => {
    if (cachedConfig) return
    fetch(BASE_URL + '/api/config')
      .then(r => r.json())
      .then(data => {
        cachedConfig = data
        setConfig(data)
        setLoading(false)
        listeners.forEach(fn => fn(data))
      })
      .catch(() => setLoading(false))
  }, [])

  return { config, loading }
}
