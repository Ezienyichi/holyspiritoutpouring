const BASE_URL = import.meta.env.VITE_API_URL || ''

const getToken = () => localStorage.getItem('op25_token')

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
})

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${BASE_URL}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Image upload failed')
  }
  const data = await res.json()
  return data.url
}

export const saveRecord = async (endpoint, data, id = null) => {
  const url = id
    ? `${BASE_URL}${endpoint}/${id}`
    : `${BASE_URL}${endpoint}`
  const res = await fetch(url, {
    method: id ? 'PUT' : 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Save failed')
  }
  return res.json()
}

export const deleteRecord = async (endpoint, id) => {
  const res = await fetch(`${BASE_URL}${endpoint}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  if (!res.ok) throw new Error('Delete failed')
  return res.json()
}

export const fetchRecords = async (endpoint) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers: authHeaders() })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}
