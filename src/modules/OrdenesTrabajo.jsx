import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function OrdenesTrabajo(){
  const [clientes,setClientes]=useState([]),[vehiculos,setVehiculos]=useState([]),[mecanicos,setMecanicos]=useState([]),[ordenes,setOrdenes]=useState([]);
  const [clienteId,setClienteId]=useState(''),[vehiculoId,setVehiculoId]=useState(''),[mecanicoId,setMecanicoId]=useState(''),[descripcion,setDescripcion]=useState(''),[minutos,setMinutos]=useState('60'),[observaciones,setObservaciones]=useState('');
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
  async function load(){
    setLoading(true);setError('');
    const [c,v,m,o]=await Promise.all([
      supabase.from('clientes').select('id,nombre,apellidos').order('nombre'),
      supabase.from('vehiculos').select('id,matricula,marca,modelo,cliente_id').order('matricula'),
      supabase.from('usuarios').select('id,nombre,apellido').eq('rol','mecanico').eq('activo',true).order('nombre'),
      supabase.from('ordenes_trabajo').select('id,numero_ot,estado,fecha_entrada,cliente_id,vehiculo_id,observaciones').order('created_at',{ascending:false}).limit(100)
    ]);
    const first=[c,v,m,o].find(x=>x.error)?.error;if(first)setError(first.message);
    setClientes(c.data||[]);setVehiculos(v.data||[]);setMecanicos(m.data||[]);setOrdenes(o.data||[]);setLoading(false);
  }
  useEffect(()=>{load()},[]);
  const availableVehicles=clienteId?vehiculos.filter(v=>v.cliente_id===clienteId):[];
  async function createOrder(e){
    e.preventDefault();setSaving(true);setError('');setSuccess('');
    if(!clienteId||!vehiculoId||!mecanicoId||!descripcion.trim()){setError('Cliente, vehículo, mecánico y descripción son obligatorios.');setSaving(false);return;}
    const {data,error}=await supabase.rpc('crear_orden_trabajo',{p_cliente_id:clienteId,p_vehiculo_id:vehiculoId,p_observaciones:observaciones.trim()||null,p_trabajos:[{usuario_id:mecanicoId,descripcion:descripcion.trim(),tiempo_estimado_min:Number(minutos),precio_hora:0,prioridad:2,observaciones:null}]});
    if(error)setError(error.message);else{setSuccess(`OT #${data?.numero_ot??'creada'} creada correctamente.`);setClienteId('');setVehiculoId('');setMecanicoId('');setDescripcion('');setObservaciones('');setMinutos('60');await load()}
    setSaving(false);
  }
  return <div className="panel"><div className="module-head"><div><h2>Órdenes de trabajo</h2><p className="muted">Alta de OT mediante la RPC segura del backend.</p></div><button className="primary compact" onClick={load}>Actualizar</button></div>
    {error&&<div className="error">{error}</div>}{success&&<div className="success">{success}</div>}
    <form className="ot-form" onSubmit={createOrder}>
      <label>Cliente<select value={clienteId} onChange={e=>{setClienteId(e.target.value);setVehiculoId('')}} required><option value="">Selecciona un cliente</option>{clientes.map(c=><option key={c.id} value={c.id}>{[c.nombre,c.apellidos].filter(Boolean).join(' ')}</option>)}</select></label>
      <label>Vehículo<select value={vehiculoId} onChange={e=>setVehiculoId(e.target.value)} required disabled={!clienteId}><option value="">Selecciona un vehículo</option>{availableVehicles.map(v=><option key={v.id} value={v.id}>{v.matricula} · {v.marca} {v.modelo}</option>)}</select></label>
      <label>Mecánico<select value={mecanicoId} onChange={e=>setMecanicoId(e.target.value)} required><option value="">Selecciona un mecánico</option>{mecanicos.map(m=><option key={m.id} value={m.id}>{m.nombre} {m.apellido||''}</option>)}</select></label>
      <label>Descripción del trabajo<input value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Ej. Revisión y cambio de aceite" required/></label>
      <label>Tiempo estimado (min)<input type="number" min="1" value={minutos} onChange={e=>setMinutos(e.target.value)} required/></label>
      <label>Observaciones<textarea value={observaciones} onChange={e=>setObservaciones(e.target.value)} rows="3"/></label>
      <button className="primary" disabled={saving||loading}>{saving?'Creando…':'Crear orden de trabajo'}</button>
    </form>
    <h3>Últimas órdenes</h3>
    {loading?<p className="muted">Cargando…</p>:ordenes.length===0?<p className="muted">No hay órdenes todavía.</p>:<div className="table-wrap"><table><thead><tr><th>OT</th><th>Estado</th><th>Entrada</th></tr></thead><tbody>{ordenes.map(o=><tr key={o.id}><td>#{o.numero_ot}</td><td>{o.estado}</td><td>{o.fecha_entrada?new Date(o.fecha_entrada).toLocaleString('es-ES'): '—'}</td></tr>)}</tbody></table></div>}
  </div>;
}
