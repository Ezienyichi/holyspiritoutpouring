import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import ToastContainer from '../components/Toast'

const ToastCtx = createContext(null)
const NotifCtx = createContext(null)

const STORAGE_KEY = 'op25_admin_notifs'

function loadNotifs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [notifs, setNotifs] = useState(loadNotifs)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 50))) } catch {}
  }, [notifs])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, title, message }])
    setNotifs(prev => [{ id, type, title, message, time: new Date().toISOString(), read: false }, ...prev].slice(0, 50))
  }, [])

  const markRead    = useCallback((id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), [])
  const markAllRead = useCallback(() => setNotifs(prev => prev.map(n => ({ ...n, read: true }))), [])
  const clearAll    = useCallback(() => setNotifs([]), [])

  const unreadCount = notifs.filter(n => !n.read).length

  const toast = {
    success: (title, msg) => addToast('success', title, msg),
    error:   (title, msg) => addToast('error',   title, msg),
    warning: (title, msg) => addToast('warning', title, msg),
    info:    (title, msg) => addToast('info',    title, msg),
  }

  return (
    <ToastCtx.Provider value={toast}>
      <NotifCtx.Provider value={{ notifs, markRead, markAllRead, clearAll, unreadCount, relTime }}>
        {children}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </NotifCtx.Provider>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
export const useNotifications = () => useContext(NotifCtx)
