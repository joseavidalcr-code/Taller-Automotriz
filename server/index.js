import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { query } from './db.js';

const app = express();
const port = Number(process.env.LOCAL_SERVER_PORT || 8787);
const deviceId = process.env.DEVICE_ID || crypto.randomUUID();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', async (_req, res) => {
  try {
    await query('select 1');
    res.json({ ok: true, mode: 'local-first', deviceId });
  } catch (error) {
    res.status(503).json({ ok: false, error: error.message });
  }
});

app.get('/api/usuarios', async (_req, res) => {
  try {
    const { rows } = await query('select id,nombre,apellido,email,rol,activo from usuarios where activo = true order by nombre,apellido');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/clientes', async (_req, res) => {
  try {
    const { rows } = await query('select * from clientes order by created_at desc limit 500');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/vehiculos', async (_req, res) => {
  try {
    const { rows } = await query('select * from vehiculos order by created_at desc limit 500');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/ordenes-trabajo', async (_req, res) => {
  try {
    const { rows } = await query('select * from ordenes_trabajo order by created_at desc limit 500');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/sync/outbox', async (req, res) => {
  const { entity, entityId, operation, payload } = req.body || {};
  if (!entity || !entityId || !operation || !payload) return res.status(400).json({ error: 'Datos de sincronización incompletos.' });
  try {
    const { rows } = await query(
      'insert into sync_outbox(entity,entity_id,operation,payload,device_id) values($1,$2,$3,$4,$5) returning id,created_at',
      [entity, entityId, operation, payload, deviceId]
    );
    res.status(202).json({ queued: true, ...rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Taller Automotriz local-first: http://0.0.0.0:${port}`);
});
