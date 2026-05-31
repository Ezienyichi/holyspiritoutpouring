import { getToken } from '../api'

const BASE_URL = import.meta.env.VITE_API_URL || ''

export async function toggleVisibility(table, id, currentlyVisible) {
  const res = await fetch(`${BASE_URL}/api/visibility/${table}/${id}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ visible: currentlyVisible ? 0 : 1 }),
  })
  if (!res.ok) throw new Error('Toggle failed')
  return res.json()
}
