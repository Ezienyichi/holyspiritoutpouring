export function initMetaPixel(pixelId) {
  if (!pixelId) return
  if (typeof window === 'undefined') return
  if (window._fbPixelInitialized) return
  window._fbPixelInitialized = true

  if (!window.fbq) {
    window.fbq = function() {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments)
    }
    if (!window._fbq) window._fbq = window.fbq
    window.fbq.push = window.fbq
    window.fbq.loaded = true
    window.fbq.version = '2.0'
    window.fbq.queue = []

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
  console.log('Meta Pixel initialized:', pixelId)
}
