import { useEffect, useMemo, useState } from 'react';
import { Clock3, Play, Pause, Square, RefreshCw, AlertTriangle } from 'lucide-react';
import { localApi } from '../lib/api';

const STORAGE_KEY = 'taller_time_control_v1';
const PAUSE_REASONS = ['descanso', 'esperando_pieza', 'esperando_autorizacion', 'esperando_informacion', 'diagnosis', 'otro'];
const empty = () => ({ records: [], active: null });
function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || empty(); } catch { return empty(); } }
function saveState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function fmt(ms) { const total = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); const s = total % 60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
function labelReason(reason) { return reason.replaceAll('_',' '); }

export default function ControlTiemposLocal({ session }) {
  const [state, setState] = useState(loadState);
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState(session?.user?.id || '');
  const [selectedOt, setSelectedOt] = useState('');
  const [task, setTask] = useState('');
  const [pauseReason, setPauseReason] = useState(PAUSE_REASONS[1]);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(Date.now());

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { Promise.all([localApi.usuarios(), localApi.ordenes()]).then(([u,o]) => { setUsuarios(u); setOrdenes(o); }).catch(e => setError(e.message)); }, []);
  useEffect(() => { if (!state.active) return undefined; const id = setInterval(() => setTick(Date.now()), 1000); return () => clearInterval(id); }, [state.active]);

  const active = state.active;
  const activeElapsed = active ? (tick - active.startedAt - (active.pausedMs || 0)) : 0;
  const activeOt = ordenes.find(x => x.id === active?.otId);
  const activeUser = usuarios.find(x => x.id === active?.mechanicId);
  const today = new Date().toISOString().slice(0,10);
  const daily = useMemo(() => { const by = new Map(); state.records.filter(r => r.startedAt.slice(0,10) === today).forEach(r => { const key = r.mechanicId; const current = by.get(key) || { effective: 0, total: 0, count: 0 }; current.effective += r.effectiveMs || 0; current.total += r.totalMs || 0; current.count += 1; by.set(key, current); }); return by; }, [state.records, today]);

  function start() { setError(''); if (!selectedMechanic || !selectedOt || !task.trim()) return setError('Selecciona mecánico, OT y tarea.'); if (active) return setError('Ya existe un trabajo activo. Pausa o finaliza el actual antes de iniciar otro.'); setState(s => ({ ...s, active: { mechanicId: selectedMechanic, otId: selectedOt, task: task.trim(), startedAt: Date.now(), pausedAt: null, pausedMs: 0, pauses: [] } })); }
  function pause() { if (!active || active.pausedAt) return; setState(s => ({ ...s, active: { ...s.active, pausedAt: Date.now(), pauseReason } })); }
  function resume() { if (!active?.pausedAt) return; const extra = Date.now() - active.pausedAt; setState(s => ({ ...s, active: { ...s.active, pausedAt: null, pausedMs: (s.active.pausedMs || 0) + extra, pauses: [...(s.active.pauses || []), { reason: s.active.pauseReason, inicio: s.active.pausedAt, fin: Date.now(), ms: extra }] } })); }
  async function finish() {
    if (!active) return;
    const now = Date.now();
    const pausedMs = active.pausedAt ? (active.pausedMs || 0) + (now - active.pausedAt) : (active.pausedMs || 0);
    const totalMs = now - active.startedAt;
    const effectiveMs = Math.max(0, totalMs - pausedMs);
    const record = { id: crypto.randomUUID(), mechanicId: active.mechanicId, otId: active.otId, task: active.task, startedAt: new Date(active.startedAt).toISOString(), finishedAt: new Date(now).toISOString(), totalMs, pausedMs, effectiveMs, pauses: active.pauses || [] };
    setError('');
    try {
      await localApi.addManoObra(active.otId, { descripcion: active.task, mecanico_id: active.mechanicId, horas: Number((effectiveMs / 3600000).toFixed(4)), precio_hora: 0, descuento: 0, observaciones: `Control de tiempos · efectivo ${fmt(effectiveMs)} · pausas ${fmt(pausedMs)}` });
      setState(s => ({ records: [record, ...s.records], active: null }));
      setOrdenes(await localApi.ordenes());
      setTask('');
    } catch (e) { setError(`No se pudo guardar el tiempo en la OT: ${e.message}`); }
  }

  return <div className="panel">
    <div className="module-head"><div><h2><Clock3 size={20}/> Control de tiempos</h2><p className="muted">Control de jornada, trabajos, pausas y tiempo efectivo de los mecánicos.</p></div><button className="compact" onClick={() => Promise.all([localApi.usuarios(), localApi.ordenes()]).then(([u,o])=>{setUsuarios(u);setOrdenes(o)}).catch(e=>setError(e.message))}><RefreshCw size={15}/> Actualizar</button></div>
    {error && <div className="error"><AlertTriangle size={16}/>{error}</div>}
    <div className="stats"><div className="stat"><span>Estado</span><strong>{active ? 'Trabajando' : 'Disponible'}</strong><small>{active ? active.task : 'Sin reloj activo'}</small></div><div className="stat"><span>Tiempo efectivo</span><strong>{fmt(activeElapsed)}</strong><small>Trabajo actual</small></div><div className="stat"><span>Trabajos hoy</span><strong>{state.records.filter(r=>r.startedAt.slice(0,10)===today).length}</strong><small>Registros finalizados</small></div></div>
    {!active ? <div className="panel"><h3>Iniciar trabajo</h3><div className="form-grid"><label>Mecánico<select value={selectedMechanic} onChange={e=>setSelectedMechanic(e.target.value)}><option value="">Seleccionar…</option>{usuarios.map(u=><option key={u.id} value={u.id}>{[u.nombre,u.apellido].filter(Boolean).join(' ')}</option>)}</select></label><label>Orden de trabajo<select value={selectedOt} onChange={e=>setSelectedOt(e.target.value)}><option value="">Seleccionar…</option>{ordenes.filter(o=>!['entregada','cancelada'].includes(o.estado)).map(o=><option key={o.id} value={o.id}>{o.numero_ot || o.id.slice(0,8)} · {o.descripcion}</option>)}</select></label><label className="wide">Tarea<input value={task} onChange={e=>setTask(e.target.value)} placeholder="Ej. Frenos delanteros"/></label></div><button className="primary" onClick={start}><Play size={17}/> Iniciar trabajo</button></div> : <div className="panel"><div className="module-head"><div><h3>{activeOt?.numero_ot || active.otId.slice(0,8)} · {activeOt?.descripcion || 'OT'}</h3><p className="muted">{[activeUser?.nombre, activeUser?.apellido].filter(Boolean).join(' ') || active.mechanicId} · {active.task}</p></div><strong className="timer">{fmt(activeElapsed)}</strong></div>{!active.pausedAt ? <div className="form-grid"><label>Motivo de pausa<select value={pauseReason} onChange={e=>setPauseReason(e.target.value)}>{PAUSE_REASONS.map(x=><option key={x} value={x}>{labelReason(x)}</option>)}</select></label></div> : <div className="error">Trabajo pausado · {labelReason(active.pauseReason || pauseReason)}</div>}<div className="actions">{!active.pausedAt ? <button className="compact" onClick={pause}><Pause size={16}/> Pausar</button> : <button className="primary compact" onClick={resume}><Play size={16}/> Continuar</button>}<button className="danger compact" onClick={finish}><Square size={16}/> Finalizar trabajo</button></div></div>}
    <div className="panel"><div className="module-head"><h3>Resumen de hoy</h3></div><div className="table-wrap"><table><thead><tr><th>Mecánico</th><th>Trabajos</th><th>Tiempo efectivo</th><th>Tiempo total</th><th>Esperas/pausas</th></tr></thead><tbody>{usuarios.map(u=>{const d=daily.get(u.id)||{effective:0,total:0,count:0};return <tr key={u.id}><td>{[u.nombre,u.apellido].filter(Boolean).join(' ')}</td><td>{d.count}</td><td>{fmt(d.effective)}</td><td>{fmt(d.total)}</td><td>{fmt(Math.max(0,d.total-d.effective))}</td></tr>})}</tbody></table></div></div>
    <div className="panel"><h3>Últimos registros</h3><div className="table-wrap"><table><thead><tr><th>Inicio</th><th>Mecánico</th><th>OT</th><th>Tarea</th><th>Total</th><th>Efectivo</th><th>Pausas</th></tr></thead><tbody>{state.records.slice(0,30).map(r=>{const u=usuarios.find(x=>x.id===r.mechanicId),o=ordenes.find(x=>x.id===r.otId);return <tr key={r.id}><td>{new Date(r.startedAt).toLocaleString('es-ES')}</td><td>{[u?.nombre,u?.apellido].filter(Boolean).join(' ')||'—'}</td><td>{o?.numero_ot||r.otId.slice(0,8)}</td><td>{r.task}</td><td>{fmt(r.totalMs)}</td><td>{fmt(r.effectiveMs)}</td><td>{r.pauses?.length||0}</td></tr>})}{!state.records.length&&<tr><td colSpan="7" className="muted">Todavía no hay registros finalizados.</td></tr>}</tbody></table></div></div>
  </div>;
}
