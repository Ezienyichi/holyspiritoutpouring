import { useState, useEffect } from 'react'
import { getToken } from '../api'
import { useToast } from '../context/ToastContext'
import SaveButton from '../components/SaveButton'
import { saveRecord } from '../utils/adminSave'
import VisibilityToggle from '../components/VisibilityToggle'
import { toggleVisibility } from '../utils/visibility'

const API_BASE = import.meta.env.VITE_API_URL || ''
const EMPTY = { name: '', location: '', year: '', text: '', approved: 0, visible: 1 }

export default function AdminTestimonials() {
  const toast = useToast()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)

  async function load() {
    try {
      const res = await fetch(API_BASE + '/api/testimonials', { headers: { Authorization: `Bearer ${getToken()}` } })
      const d = await res.json()
      setTestimonials(Array.isArray(d) ? d : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setModal('new') }
  function openEdit(t) { setForm({ ...t }); setModal(t.id) }
  function closeModal() { setModal(null) }

  const handleSave = async () => {
    if (!form.text?.trim()) throw new Error('Testimonial text is required')
    const id = modal !== 'new' ? modal : null
    const saved = await saveRecord('/api/testimonials', form, id)
    setTestimonials(prev => id ? prev.map(t => t.id === id ? saved : t) : [saved, ...prev])
    setModal(null)
    setForm(EMPTY)
    toast.success(id ? 'Testimonial Updated' : 'Testimonial Added', 'Saved successfully.')
  }

  async function handleToggleVisibility(testimonial) {
    try {
      const updated = await toggleVisibility('testimonials', testimonial.id, testimonial.visible == 1)
      setTestimonials(prev => prev.map(t => t.id === testimonial.id ? { ...t, visible: updated.visible } : t))
    } catch { toast.error('Error', 'Could not update visibility.') }
  }

  async function del(id) {
    if (!confirm('Delete this testimonial?')) return
    try {
      await fetch(API_BASE + `/api/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setTestimonials(prev => prev.filter(t => t.id !== id))
      toast.warning('Removed', 'Testimonial deleted.')
    } catch { toast.error('Error', 'Could not delete.') }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Testimonials</h2>
        <button className="btn btn-orange" onClick={openNew}>+ Add Testimonial</button>
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Location</th><th>Year</th><th>Preview</th><th>Approved</th><th>Visibility</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {testimonials.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name || 'Anonymous'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t.location || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.year || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text}</td>
                  <td>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: t.approved ? '#22c55e' : '#f59e0b' }}>
                      {t.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td><VisibilityToggle isVisible={t.visible == 1 || t.visible === null} onToggle={() => handleToggleVisibility(t)} /></td>
                  <td>
                    <button className="admin-btn-edit" onClick={() => openEdit(t)}>Edit</button>
                    <button className="admin-btn-del" onClick={() => del(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No testimonials yet. Click "+ Add Testimonial" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">{modal === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}</h3>
            <form onSubmit={e => e.preventDefault()}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name || ''} onChange={e => f('name', e.target.value)} placeholder="John Doe" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Location</label>
                  <input className="form-input" value={form.location || ''} onChange={e => f('location', e.target.value)} placeholder="Lagos, Nigeria" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Year</label>
                  <input className="form-input" value={form.year || ''} onChange={e => f('year', e.target.value)} placeholder="2024" />
                </div>
                <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label className="form-label" style={{ marginBottom: 8 }}>Approved</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.approved == 1} onChange={e => f('approved', e.target.checked ? 1 : 0)} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Show on website</span>
                  </label>
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Testimonial *</label>
                  <textarea className="form-textarea" value={form.text || ''} onChange={e => f('text', e.target.value)} rows={4} placeholder="Share what God did…" />
                </div>
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Visibility</label>
                  <VisibilityToggle
                    isVisible={form.visible == 1 || form.visible === undefined}
                    onToggle={() => f('visible', form.visible == 1 ? 0 : 1)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-navy" onClick={closeModal}>Cancel</button>
                <SaveButton onClick={handleSave} label="Save Testimonial" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
