import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = __dirname;
const connectionString = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL/LOCAL_DATABASE_URL no está configurada.');
const pool = new pg.Pool({ connectionString });

await pool.query(`create table if not exists schema_migrations (version text primary key, applied_at timestamptz not null default now())`);
const files = fs.readdirSync(dir).filter(f => /^\d+_.+\.sql$/.test(f)).sort();
for (const file of files) {
  const { rows } = await pool.query('select 1 from schema_migrations where version=$1', [file]);
  if (rows.length) continue;
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  // Migration files historically contain their own BEGIN/COMMIT. Remove those wrappers
  // so the runner can provide one atomic transaction and record the migration together.
  const sql = raw.replace(/^\s*begin\s*;?/i, '').replace(/commit\s*;?\s*$/i, '');
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('insert into schema_migrations(version) values($1)', [file]);
    await client.query('commit');
    console.log(`applied ${file}`);
  } catch (e) {
    await client.query('rollback');
    console.error(`failed ${file}:`, e.message);
    process.exitCode = 1;
    break;
  } finally { client.release(); }
}
await pool.end();
