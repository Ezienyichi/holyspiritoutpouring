import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import Dashboard from './admin/Dashboard'
import SiteConfig from './admin/SiteConfig'
import AdminSpeakers from './admin/AdminSpeakers'
import AdminSchedule from './admin/AdminSchedule'
import AdminPrayers from './admin/AdminPrayers'
import AdminMedia from './admin/AdminMedia'
import AdminGiving from './admin/AdminGiving'
import AdminRegistrations from './admin/AdminRegistrations'
import AdminLivestream from './admin/AdminLivestream'
import AdminUsers from './admin/AdminUsers'

export default function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speakers" element={<Speakers />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/media" element={<Media />} />
        <Route path="/prayer" element={<Prayer />} />
        <Route path="/give" element={<Give />} />
        <Route path="/register" element={<Register />} />
        <Route path="/live" element={<Live />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="config" element={<SiteConfig />} />
          <Route path="speakers" element={<AdminSpeakers />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="prayers" element={<AdminPrayers />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="giving" element={<AdminGiving />} />
          <Route path="registrations" element={<AdminRegistrations />} />
          <Route path="livestream" element={<AdminLivestream />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}
