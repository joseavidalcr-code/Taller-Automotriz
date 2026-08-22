import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL || 'postgresql://taller:change-me-local-only@localhost:5433/taller_automotriz'
});

export async function query(text, params) {
  return pool.query(text, params);
}
