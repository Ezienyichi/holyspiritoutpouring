export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params)
  }
}

export function trackPageView() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
}

export function trackRegistration(params = {}) {
  trackEvent('CompleteRegistration', params)
}

export function trackGiving(params = {}) {
  trackEvent('Donate', params)
}

export function trackPrayerSubmit(params = {}) {
  trackEvent('Contact', params)
}
