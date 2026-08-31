import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { ensureDefaultMechanics } from './seed-mechanics.js';

const app=express();
const port=Number(process.env.MECHANIC_PIN_PORT||8788);
app.use(cors());
app.use(express.json({limit:'100kb'}));

app.get('/health',async(_req,res)=>{try{await query('select 1');res.json({ok:true})}catch(e){res.status(503).json({ok:false,error:e.message})}});
app.get('/api/mecanico/pin/users',async(_req,res)=>{try{await ensureDefaultMechanics();const{rows}=await query("select id,nombre,apellido,pin_enabled from usuarios where rol='mecanico' and activo=true order by nombre,apellido");res.json(rows)}catch(e){res.status(500).json({error:e.message})}});
app.post('/api/mecanico/pin/login',async(req,res)=>{const{id,pin}=req.body||{};if(!id||!/^\\d{4,6}$/.test(String(pin||'')))return res.status(400).json({error:'Introduce un PIN válido de 4 a 6 dígitos.'});try{await ensureDefaultMechanics();const{rows}=await query("select id,nombre,apellido,rol,activo,pin_hash,pin_enabled from usuarios where id=$1 and rol='mecanico' limit 1",[id]);const u=rows[0];if(!u||!u.activo||Number(u.pin_enabled)!==1||!u.pin_hash||!(await bcrypt.compare(String(pin),u.pin_hash)))return res.status(401).json({error:'PIN incorrecto o acceso no habilitado.'});res.json({user:{id:u.id,nombre:u.nombre,apellido:u.apellido,rol:u.rol}})}catch(e){res.status(500).json({error:e.message})}});

app.listen(port,'127.0.0.1',()=>console.log(`Panel PIN de mecánicos disponible en http://127.0.0.1:${port}`));
