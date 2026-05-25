import { useState, useEffect } from 'react'
import { api } from '../api'
import { useToast } from '../context/ToastContext'

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'content_manager', label: 'Content Manager' },
]

const EMPTY_FORM = { username: '', password: '', name: '', role: 'content_manager' }

export default function AdminUsers() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | { ...user }
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadUsers() {
    try {
      const d = await api.get('/users')
      setUsers(Array.isArray(d) ? d : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  function openAdd() {
    setForm(EMPTY_FORM)
    setError('')
    setModal('add')
  }

  function openEdit(user) {
    setForm({ username: user.username, password: '', name: user.name, role: user.role })
    setError('')
    setModal(user)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (modal === 'add') {
        await api.post('/users', form)
        toast.success('User Created', 'New admin user has been created successfully.')
      } else {
        const payload = { name: form.name, role: form.role }
        if (form.password) payload.password = form.password
        await api.put(`/users/${modal.id}`, payload)
        toast.success('User Updated', 'User details have been updated.')
      }
      setModal(null)
      loadUsers()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function del(user) {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    try {
      await api.del(`/users/${user.id}`)
      toast.warning('User Removed', 'Admin access has been revoked for this user.')
      loadUsers()
    } catch (e) {
      toast.error('Delete Failed', e.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>User Management</h2>
        <button className="btn btn-orange" onClick={openAdd}>+ Add User</button>
      </div>

      {loading ? <div className="loading-state">Loading users…</div> : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar">
                        {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{u.username}</td>
                  <td>
                    <span className={`role-badge ${u.role === 'super_admin' ? 'super-admin' : 'content-manager'}`}>
                      {u.role === 'super_admin' ? 'Super Admin' : 'Content Manager'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-navy"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                      {u.username !== 'admin' && (
                        <button
                          className="admin-btn-del"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => del(u)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <h3 className="modal-title">
              {modal === 'add' ? 'Add New User' : `Edit User — ${modal.username}`}
            </h3>
            {error && <div className="alert alert-err" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={save}>
              {modal === 'add' && (
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    className="form-input"
                    placeholder="username"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Password
                  {modal === 'add'
                    ? ' *'
                    : <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (leave blank to keep current)</span>
                  }
                </label>
                <input
                  className="form-input"
                  type="password"
                  placeholder={modal === 'add' ? 'Password' : 'New password (optional)'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required={modal === 'add'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-navy" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-orange" disabled={saving}>
                  {saving ? 'Saving…' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
