import { useState, useEffect } from 'react'

export default function SaveButton({
  onClick,
  label = 'Save',
  savingLabel = 'Saving...',
  disabled = false
}) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!saving) return
    const t = setTimeout(() => setStatus('Still saving… please wait'), 5000)
    return () => clearTimeout(t)
  }, [saving])

  const handleClick = async () => {
    setSaving(true)
    setStatus(savingLabel)
    setError('')
    setSuccess('')
    try {
      await onClick(setStatus)
      setSuccess('Saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
      setStatus('')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving || disabled}
        style={{
          background: saving ? 'rgba(201,5,5,0.6)' : '#c90505',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 24px',
          fontSize: '13px',
          fontWeight: '700',
          cursor: saving ? 'not-allowed' : 'pointer',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          minWidth: '120px',
          transition: 'all 0.2s'
        }}
      >
        {saving ? (status || savingLabel) : label}
      </button>

      {error && (
        <p style={{
          color: '#ff6b6b', fontSize: '12px', marginTop: '6px',
          padding: '6px 10px', background: 'rgba(255,0,0,0.1)', borderRadius: '6px'
        }}>
          Error: {error}
        </p>
      )}

      {success && (
        <p style={{
          color: '#5DCAA5', fontSize: '12px', marginTop: '6px',
          padding: '6px 10px', background: 'rgba(29,158,117,0.1)', borderRadius: '6px'
        }}>
          {success}
        </p>
      )}
    </div>
  )
}
