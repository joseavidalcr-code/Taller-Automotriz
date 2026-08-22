import pg from 'pg';

const { Pool } = pg;

if (!process.env.LOCAL_DATABASE_URL) {
  throw new Error('LOCAL_DATABASE_URL no está configurada. Define la conexión en .env.local.');
}

export const pool = new Pool({ connectionString: process.env.LOCAL_DATABASE_URL });

export async function query(text, params) {
  return pool.query(text, params);
}
