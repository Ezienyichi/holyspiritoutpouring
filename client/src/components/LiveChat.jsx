import { useState, useEffect, useRef } from 'react'

const AVATAR_COLORS = ['#E8622A','#7C3AED','#0891B2','#059669','#DC2626','#D97706','#BE185D','#0F766E']
function colorFor(name) { let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] }
function initials(name) { return name.split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase() }

export default function LiveChat() {
  const [messages, setMessages] = useState([])
  const [lastId, setLastId] = useState(0)
  const [username, setUsername] = useState(() => localStorage.getItem('op25_chat_user') || '')
  const [input, setInput] = useState('')
  const [askName, setAskName] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetch('/api/chat').then(r => r.json()).then(msgs => {
      setMessages(msgs)
      if (msgs.length) setLastId(msgs[msgs.length - 1].id)
    })
  }, [])

  useEffect(() => {
    const poll = setInterval(() => {
      fetch(`/api/chat?since=${lastId}`).then(r => r.json()).then(newMsgs => {
        if (newMsgs.length) {
          setMessages(prev => [...prev, ...newMsgs])
          setLastId(newMsgs[newMsgs.length - 1].id)
        }
      })
    }, 3000)
    return () => clearInterval(poll)
  }, [lastId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(msg) {
    if (!msg.trim() || !username.trim()) return
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message: msg }),
      })
      const newMsg = await res.json()
      setMessages(prev => [...prev, newMsg])
      setLastId(newMsg.id)
    } catch {}
  }

  function handleSend() {
    if (!username.trim()) { setAskName(true); return }
    sendMessage(input)
    setInput('')
  }

  function handleReaction(emoji) {
    if (!username.trim()) { setAskName(true); return }
    sendMessage(emoji)
  }

  function saveName(e) {
    e.preventDefault()
    const name = e.target.name.value.trim()
    if (!name) return
    setUsername(name)
    localStorage.setItem('op25_chat_user', name)
    setAskName(false)
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span style={{ fontSize: '0.9rem' }}>💬</span>
        <span className="chat-header-title">Live Chat</span>
        {username && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-dim)' }}>@{username}</span>}
      </div>
      <div className="chat-messages">
        {messages.map(m => (
          <div key={m.id} className="chat-msg">
            <div className="chat-avatar" style={{ background: colorFor(m.username) }}>{initials(m.username)}</div>
            <div className="chat-msg-body">
              <div className="chat-username">{m.username}</div>
              <div className="chat-text">{m.message}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {askName && (
        <form onSubmit={saveName} style={{ padding: '0.75rem', borderTop: '1px solid var(--navy-border)', display: 'flex', gap: '0.5rem' }}>
          <input name="name" className="chat-input" placeholder="Your display name…" autoFocus style={{ flex: 1 }} />
          <button type="submit" className="chat-send-btn">✓</button>
        </form>
      )}
      <div className="chat-reactions">
        {['🔥','🙏','❤️','🙌','⚡','✨'].map(e => (
          <button key={e} className="reaction-btn" onClick={() => handleReaction(e)}>{e}</button>
        ))}
      </div>
      <div className="chat-input-wrap">
        <input className="chat-input" placeholder="Say something…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <button className="chat-send-btn" onClick={handleSend}>➤</button>
      </div>
    </div>
  )
}
