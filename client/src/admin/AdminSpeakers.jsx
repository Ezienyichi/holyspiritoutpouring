import { useState, useEffect } from 'react'
import { api } from '../api'
import { useToast } from '../context/ToastContext'

const EMPTY = { name: '', title: '', church: '', topic: '', bio: '', photoUrl: '', instagram: '', twitter: '', displayOrder: 0, role: 'minister' }

const ROLES = [
  { value: 'minister', label: 'Featured Speaker / Minister' },
  { value: 'convening_team', label: 'Convening Team' },
  { value: 'sub_team_head', label: 'Sub Team Head' },
  { value: 'volunteer', label: 'Volunteer' },
]

export default function AdminSpeakers() {
  const toast = useToast()
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const d = await api.get('/speakers')
    setSpeakers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setModal('new') }
  function openEdit(s) { setForm({ ...s }); setModal(s.id) }
  function closeModal() { setModal(null) }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    if (modal === 'new') {
      await api.post('/speakers', form)
      toast.success('Speaker Added', `${form.name} has been added to the speakers list.`)
    } else {
      await api.put(`/speakers/${modal}`, form)
      toast.success('Speaker Updated', 'Speaker details have been saved successfully.')
    }
    setSaving(false)
    setModal(null)
    load()
  }

  async function del(id) {
    if (!confirm('Delete this speaker?')) return
    await api.del(`/speakers/${id}`)
    toast.warning('Speaker Removed', 'The speaker has been removed from the website.')
    load()
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Speakers</h2>
        <button className="btn btn-orange" onClick={openNew}>+ Add Speaker</button>
      </div>

      {loading ? <div className="loading-state">Loading…</div> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Photo</th><th>Name</th><th>Title / Church</th><th>Role</th><th>Topic</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {speakers.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{s.displayOrder}</td>
                  <td>
                    {s.photoUrl
                      ? <img src={s.photoUrl} alt={s.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1rem' }}>{s.name?.[0]}</div>
                    }
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.title}<br />{s.church}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--orange)' }}>{ROLES.find(r => r.value === (s.role || 'minister'))?.label || s.role}</td>
                  <td style={{ fontSize: '0.85rem' }}>{s.topic}</td>
                  <td>
                    <button className="admin-btn-edit" onClick={() => openEdit(s)}>Edit</button>
                    <button className="admin-btn-del" onClick={() => del(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal-title">{modal === 'new' ? 'Add Speaker' : 'Edit Speaker'}</h3>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['name','Name *'],['title','Title'],['church','Church/Ministry'],['topic','Session Topic']].map(([k,lbl]) => (
                  <div className="form-group" key={k} style={{ margin: 0 }}>
                    <label className="form-label">{lbl}</label>
                    <input className="form-input" value={form[k]||''} onChange={e=>f(k,e.target.value)} required={k==='name'} />
                  </div>
                ))}
                <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                  <label className="form-label">Photo URL</label>
                  <input className="form-input" value={form.photoUrl||''} onChange={e=>f('photoUrl',e.target.value)} placeholder="https://…" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Instagram</label>
                  <input className="form-input" value={form.instagram||''} onChange={e=>f('instagram',e.target.value)} placeholder="@handle" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Twitter</label>
                  <input className="form-input" value={form.twitter||''} onChange={e=>f('twitter',e.target.value)} placeholder="@handle" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" value={form.displayOrder||0} onChange={e=>f('displayOrder',Number(e.target.value))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Role / Category</label>
                  <select className="form-select" value={form.role||'minister'} onChange={e=>f('role',e.target.value)}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio||''} onChange={e=>f('bio',e.target.value)} rows={3} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-orange" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
