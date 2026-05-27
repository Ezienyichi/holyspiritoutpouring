const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('op25_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      console.error(`API ${res.status}: ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`API error: ${endpoint}`, err);
    return null;
  }
};

export const apiGet = async (endpoint) => {
  const data = await apiFetch(endpoint);
  if (Array.isArray(data)) return data;
  if (data === null) return [];
  if (typeof data === 'object') return data;
  return [];
};
