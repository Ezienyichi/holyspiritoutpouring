import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import Home from './pages/Home'
import Speakers from './pages/Speakers'
import Schedule from './pages/Schedule'
import Media from './pages/Media'
import Prayer from './pages/Prayer'
import Give from './pages/Give'
import Register from './pages/Register'
import Live from './pages/Live'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import ScrollToTop from './components/ScrollToTop'
import { initMetaPixel } from './utils/initPixel'
import { trackPageView } from './utils/metaPixel'

const API_BASE = import.meta.env.VITE_API_URL || ''

function PageTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView()
  }, [location.pathname])
  return null
}

function PixelInit() {
  useEffect(() => {
    fetch(API_BASE + '/api/config')
      .then(r => r.json())
      .then(d => {
        if (d && d.meta_pixel_id) initMetaPixel(d.meta_pixel_id)
      })
      .catch(() => {})
  }, [])
  return null
}

export default function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <PixelInit />
      <ScrollToTop />
      <PageTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speakers" element={<Speakers />} />
        <Route path="/team" element={<Speakers />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/media" element={<Media />} />
        <Route path="/prayer" element={<Prayer />} />
        <Route path="/give" element={<Give />} />
        <Route path="/register" element={<Register />} />
        <Route path="/live" element={<Live />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}
