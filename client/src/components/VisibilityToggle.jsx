export default function VisibilityToggle({ isVisible, onToggle, loading = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        type="button"
        onClick={onToggle}
        disabled={loading}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none',
          background: isVisible ? '#1D9E75' : 'rgba(255,255,255,0.15)',
          position: 'relative', cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.25s ease', flexShrink: 0,
          opacity: loading ? 0.5 : 1,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3, left: isVisible ? 22 : 4,
          transition: 'left 0.25s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: isVisible ? '#1D9E75' : 'rgba(255,255,255,0.4)' }}>
          {isVisible ? 'Visible on Site' : 'Hidden from Site'}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
          {isVisible ? 'Showing on website' : 'Not showing on website'}
        </div>
      </div>
    </div>
  )
}
