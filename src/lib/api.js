const base = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8787';

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
  return body;
}

export const localApi = {
  health: () => request('/health'),
  usuarios: () => request('/api/usuarios'),
  clientes: () => request('/api/clientes'),
  vehiculos: () => request('/api/vehiculos'),
  ordenes: () => request('/api/ordenes-trabajo'),
  queueSync: (payload) => request('/api/sync/outbox', { method: 'POST', body: JSON.stringify(payload) }),
};
