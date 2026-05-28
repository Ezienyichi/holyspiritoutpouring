import { useState, useEffect } from 'react'
import { getToken } from '../api'
import { useToast } from '../context/ToastContext'
import SaveButton from '../components/SaveButton'
import { saveRecord } from '../utils/adminSave'

const API_BASE = import.meta.env.VITE_API_URL || ''
const EMPTY = { day: 1, time: '', title: '', speaker: '', type: 'session', description: '', isCurrentlyLive: false }
const TYPES = ['worship', 'session', 'prayer', 'break', 'special']
const DAYS = [1, 2, 3]

export default function AdminSchedule() {
  const toast = useToast()
  const [sessions, setSessions] = useState([])
  const [activeDay, setActiveDay] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)

  async function load(day) {
    setLoading(true)
    try {
      const res = await fetch(API_BASE + `/api/sessions?day=${day}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const d = await res.json()
      setSessions(Array.isArray(d) ? d : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(activeDay) }, [activeDay])

  function openNew() { setForm({ ...EMPTY, day: activeDay }); setModal('new') }
  function openEdit(s) { setForm({ ...s, isCurrentlyLive: !!s.isCurrentlyLive }); setModal(s.id) }
  function closeModal() { setModal(null) }

  const handleSave = async () => {
    if (!form.time?.trim()) throw new Error('Time is required')
    if (!form.title?.trim()) throw new Error('Title is required')
    const id = modal !== 'new' ? modal : null
    const body = { ...form, isCurrentlyLive: form.isCurrentlyLive ? 1 : 0 }
    const saved = await saveRecord('/api/sessions', body, id)
    if (id) {
      setSessions(prev => prev.map(s => s.id === id ? saved : s))
      toast.success('Session Updated', 'Schedule changes have been saved successfully.')
    } else {
      await load(activeDay)
      toast.success('Session Added', 'The new session has been added to the conference schedule.')
    }
    setModal(null)
    setForm(EMPTY)
  }

  async function del(id) {
    if (!confirm('Delete this session?')) return
    try {
      await fetch(API_BASE + `/api/sessions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setSessions(prev => prev.filter(s => s.id !== id))
      toast.warning('Session Removed', 'The session has been removed from the schedule.')
    } catch { toast.error('Error', 'Could not delete session.') }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Schedule</h2>
        <button className="btn btn-orange" onClick={openNew}>+ Add Session</button>
      </div>

      <div className="schedule-tabs" style={{ marginBottom: '1.5rem' }}>
        {DAYS.map(d => (
          <button key={d} className={`sch-tab${activeDay === d ? ' active' : ''}`} onClick={() => setActiveDay(d)}>Day {d} — Aug {14 + d}</button>
        ))}
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Time</th><th>Title</th><th>Speaker</th><th>Type</th><th>Live</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--orange)' }}>{s.time}</td>
                  <td style={{ fontWeight: 600 }}>{s.title}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.speaker || '—'}</td>
                  <td><span style={{ background: 'var(--navy)', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.type}</span></td>
                  <td>{s.isCurrentlyLive ? <span style={{ color: '#f44', fontWeight: 700 }}>● LIVE</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>
                    <button className="admin-btn-edit" onClick={() => openEdit(s)}>Edit</button>
                    <button className="admin-btn-del" onClick={() => del(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No sessions for this day yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">{modal === 'new' ? 'Add Session' : 'Edit Session'}</h3>
            <form onSubmit={e => e.preventDefault()}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Day</label>
                  <select className="form-select" value={form.day} onChange={e => f('day', Number(e.target.value))}>
                    {DAYS.map(d => <option key={d} value={d}>Day {d} — Aug {14 + d}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Time *</label>
                  <input className="form-input" value={form.time || ''} onChange={e => f('time', e.target.value)} placeholder="9:00 AM" />
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title || ''} onChange={e => f('title', e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Speaker</label>
                  <input className="form-input" value={form.speaker || ''} onChange={e => f('speaker', e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => f('type', e.target.value)}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description || ''} onChange={e => f('description', e.target.value)} rows={3} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <input type="checkbox" checked={!!form.isCurrentlyLive} onChange={e => f('isCurrentlyLive', e.target.checked)} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mark as currently live</span>
              </label>
              <div className="modal-footer">
                <button type="button" className="btn btn-navy" onClick={closeModal}>Cancel</button>
                <SaveButton onClick={handleSave} label="Save Session" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
