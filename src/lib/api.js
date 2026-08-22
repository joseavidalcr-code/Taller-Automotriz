const base = import.meta.env.VITE_LOCAL_API_URL || 'http://127.0.0.1:8787';
async function request(path, options = {}) { const res = await fetch(`${base}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options }); const body = await res.json().catch(() => ({})); if (!res.ok) throw new Error(body.error || `Error ${res.status}`); return body; }
export const localApi = {
 health:()=>request('/health'), usuarios:()=>request('/api/usuarios'),
 clientes:()=>request('/api/clientes'), createCliente:(payload)=>request('/api/clientes',{method:'POST',body:JSON.stringify(payload)}), updateCliente:(id,payload)=>request(`/api/clientes/${id}`,{method:'PUT',body:JSON.stringify(payload)}),
 vehiculos:()=>request('/api/vehiculos'), createVehiculo:(payload)=>request('/api/vehiculos',{method:'POST',body:JSON.stringify(payload)}), updateVehiculo:(id,payload)=>request(`/api/vehiculos/${id}`,{method:'PUT',body:JSON.stringify(payload)}),
 ordenes:()=>request('/api/ordenes-trabajo'), createOrden:(payload)=>request('/api/ordenes-trabajo',{method:'POST',body:JSON.stringify(payload)}),
 queueSync:(payload)=>request('/api/sync/outbox',{method:'POST',body:JSON.stringify(payload)})
};
