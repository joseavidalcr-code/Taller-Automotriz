import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Clientes(){
 const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 async function load(){setLoading(true);setError('');const {data,error}=await supabase.from('clientes').select('*').order('created_at',{ascending:false});if(error)setError(error.message);setRows(data||[]);setLoading(false)}
 useEffect(()=>{load()},[]);
 return <div className="panel"><div className="module-head"><div><h2>Clientes</h2><p className="muted">Clientes visibles según las políticas RLS.</p></div><button className="primary compact" onClick={load}>Actualizar</button></div>{error&&<div className="error">{error}</div>}{loading?<p className="muted">Cargando…</p>:rows.length===0?<p className="muted">No hay clientes todavía.</p>:<div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{[r.nombre,r.apellidos].filter(Boolean).join(' ')||'—'}</td><td>{r.telefono||'—'}</td><td>{r.email||'—'}</td></tr>)}</tbody></table></div>}</div>
}
