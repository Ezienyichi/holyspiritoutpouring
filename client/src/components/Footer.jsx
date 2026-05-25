import { Link } from 'react-router-dom'
import { useSiteConfig } from '../hooks/useSiteConfig'

export default function Footer() {
  const { config } = useSiteConfig()

  const showSocial = config.show_social_links !== 'false'
  const instagram = config.social_instagram?.trim()
  const facebook = config.social_facebook?.trim()
  const youtube = config.social_youtube?.trim()

  const addressLine = [config.venue_address, config.venue_city, config.venue_state]
    .filter(Boolean).join(', ')
  const mapUrl = config.venue_map_url?.trim() || '#'

  const tagline = config.footer_tagline || 'A divine gathering for spiritual renewal, revival, and encounter with the Holy Spirit. Three days that will change your life forever.'
  const copyright = config.copyright_text || `© ${new Date().getFullYear()} Holy Spirit Outpouring Conference. All rights reserved.`
  const email = config.contactEmail || 'info@outpouring25.org'
  const phone = config.contactPhone || '+234 800 000 0000'

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <svg width="20" height="26" viewBox="0 0 22 28" fill="none" style={{ flexShrink: 0 }}>
                <path d="M11 0C11 0 4 7 4 14C4 17.31 5.45 20.28 7.73 22.36C7.27 21.34 7 20.2 7 19C7 15.69 9.24 12.94 11 11C12.76 12.94 15 15.69 15 19C15 20.2 14.73 21.34 14.27 22.36C16.55 20.28 18 17.31 18 14C18 7 11 0 11 0Z" fill="#E8622A"/>
                <path d="M11 14C11 14 8 17 8 20C8 21.66 9.34 23 11 23C12.66 23 14 21.66 14 20C14 17 11 14 11 14Z" fill="#C4501F"/>
              </svg>
              utpouring<span className="accent">'25</span>
            </div>
            <p className="footer-desc">{tagline}</p>
          </div>
          <div>
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">About</Link></li>
              <li><Link to="/speakers">Speakers</Link></li>
              <li><Link to="/schedule">Schedule</Link></li>
              <li><Link to="/give">Register / Give</Link></li>
              <li><Link to="/prayer">Prayer Wall</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Contact Us</h4>
            <div className="footer-contact">
              <p>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                {email}
              </p>
              <p>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.1 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.9a16 16 0 0 0 5.54 5.54l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {phone}
              </p>
              {addressLine && (
                <p>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="footer-address-link">
                    {addressLine}
                  </a>
                </p>
              )}
            </div>
          </div>
          {showSocial && (instagram || facebook || youtube) && (
            <div>
              <h4 className="footer-col-title">Follow Us</h4>
              <div className="footer-social">
                {instagram && (
                  <a href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@','')}`}
                    target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                      <defs>
                        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                          <stop offset="0%" stopColor="#ffd600"/>
                          <stop offset="25%" stopColor="#ff7a00"/>
                          <stop offset="50%" stopColor="#ff0069"/>
                          <stop offset="75%" stopColor="#d300c5"/>
                          <stop offset="100%" stopColor="#7638fa"/>
                        </radialGradient>
                      </defs>
                      <circle cx="21" cy="21" r="21" fill="url(#ig-grad)"/>
                      <rect x="13" y="13" width="16" height="16" rx="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
                      <circle cx="21" cy="21" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
                      <circle cx="26.2" cy="15.8" r="1.1" fill="white"/>
                    </svg>
                  </a>
                )}
                {facebook && (
                  <a href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`}
                    target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                      <circle cx="21" cy="21" r="21" fill="#1877F2"/>
                      <path d="M23.5 22.5h3l.5-3H23.5V17.5c0-.83.33-1.5 1.5-1.5H27v-3s-1.1-.17-2.17-.17c-2.57 0-4.33 1.57-4.33 4.34V19.5H18v3h2.5V31h3V22.5z" fill="white"/>
                    </svg>
                  </a>
                )}
                {youtube && (
                  <a href={youtube.startsWith('http') ? youtube : `https://youtube.com/${youtube}`}
                    target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube">
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                      <circle cx="21" cy="21" r="21" fill="#FF0000"/>
                      <path d="M31 17.2s-.3-1.9-1.1-2.7c-1-.8-2.2-.8-2.7-.9C24 13 21 13 21 13s-3 0-6.2.6c-.5 0-1.7.1-2.7.9-.8.8-1.1 2.7-1.1 2.7S11 19.4 11 21.5v2c0 2.1.3 4.3.3 4.3s.3 1.9 1.1 2.7c1 .8 2.4.8 3 .9C17 31.6 21 32 21 32s3 0 6.2-.7c.5 0 1.7-.1 2.7-.9.8-.8 1.1-2.7 1.1-2.7s.3-2.2.3-4.3v-2c0-2.1-.3-4.3-.3-4.3zM18.5 24.5v-7.4l7 3.7-7 3.7z" fill="white"/>
                    </svg>
                  </a>
                )}
              </div>
              <p className="footer-hashtags">#Outpouring25 #HolySpiritFire</p>
            </div>
          )}
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">{copyright}</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
