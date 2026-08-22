import pg from 'pg';
const { Pool } = pg;
if (!process.env.LOCAL_DATABASE_URL) throw new Error('LOCAL_DATABASE_URL no está configurada. Define la conexión en .env.local.');
export const pool = new Pool({ connectionString: process.env.LOCAL_DATABASE_URL, max: Number(process.env.DB_POOL_MAX || 10), idleTimeoutMillis: 30000 });
export async function query(text, params){ return pool.query(text, params); }
export async function withTransaction(fn){ const client=await pool.connect(); try{await client.query('begin');const result=await fn(client);await client.query('commit');return result}catch(e){await client.query('rollback');throw e}finally{client.release()} }
