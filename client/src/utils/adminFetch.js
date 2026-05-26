const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function adminFetch(endpoint, options = {}, fallback = null) {
  try {
    const token = localStorage.getItem('op25_token');
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      console.error(`API error ${res.status}: ${endpoint}`);
      return fallback;
    }
    const data = await res.json();
    return data ?? fallback;
  } catch (err) {
    console.error(`Fetch failed: ${endpoint}`, err);
    return fallback;
  }
}

export async function adminFetchArray(endpoint) {
  const data = await adminFetch(endpoint, {}, []);
  return Array.isArray(data) ? data : [];
}

export async function adminFetchObject(endpoint) {
  const data = await adminFetch(endpoint, {}, {});
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}
