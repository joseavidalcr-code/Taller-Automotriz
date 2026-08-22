import { useEffect, useState } from 'react';
import { localApi } from '../lib/api';

export default function ClientesLocal(){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{setRows(await localApi.clientes())}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 return <div className="panel"><div className="module-head"><div><h2>Clientes</h2><p className="muted">Datos de la base local del taller.</p></div><button className="primary compact" onClick={load}>Actualizar</button></div>{error&&<div className="error">{error}</div>}{loading?<p className="muted">Cargando…</p>:rows.length===0?<p className="muted">No hay clientes todavía.</p>:<div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{[r.nombre,r.apellidos].filter(Boolean).join(' ')||'—'}</td><td>{r.telefono||'—'}</td><td>{r.email||'—'}</td></tr>)}</tbody></table></div>}</div>
}
