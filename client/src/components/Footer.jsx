import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">🔥utpouring<span className="accent">'25</span></div>
            <p className="footer-desc">A divine gathering for spiritual renewal, revival, and encounter with the Holy Spirit. Three days that will change your life forever.</p>
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
              <p>📧 info@outpouring25.org</p>
              <p>📞 +234 800 000 0000</p>
              <p>📍 The Arena, Victoria Island,<br />Lagos, Nigeria</p>
            </div>
          </div>
          <div>
            <h4 className="footer-col-title">Follow Us</h4>
            <div className="footer-social">
              <a href="#" className="footer-social-btn" aria-label="YouTube">▶</a>
              <a href="#" className="footer-social-btn" aria-label="Instagram">📷</a>
              <a href="#" className="footer-social-btn" aria-label="Facebook">f</a>
            </div>
            <p className="footer-hashtags">#Outpouring25 #HolySpiritFire</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2025 Holy Spirit Outpouring Conference. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
