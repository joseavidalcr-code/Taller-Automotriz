import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import initSqlJs from 'sql.js';
import { SQLITE_SCHEMA } from './sqlite-schema.js';

const require = createRequire(import.meta.url);
const dataDir = process.env.TALLER_DATA_DIR || path.join(process.cwd(), 'data');
const dbFile = path.join(dataDir, 'taller-automotriz.sqlite');
let dbPromise;
let db;

function persist() {
  fs.mkdirSync(dataDir, { recursive: true });
  const tmpFile = `${dbFile}.tmp`;
  fs.writeFileSync(tmpFile, Buffer.from(db.export()));
  fs.renameSync(tmpFile, dbFile);
}

async function getDb() {
  if (db) return db;
  dbPromise ||= (async () => {
    fs.mkdirSync(dataDir, { recursive: true });
    const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
    const SQL = await initSqlJs({ locateFile: () => wasmPath });
    db = fs.existsSync(dbFile)
      ? new SQL.Database(new Uint8Array(fs.readFileSync(dbFile)))
      : new SQL.Database();
    db.run(SQLITE_SCHEMA);
    persist();
    return db;
  })();
  return dbPromise;
}

function normalize(sql) {
  let normalized = sql
    .replace(/\bnow\(\)/gi, "datetime('now')")
    .replace(/::jsonb/gi, '')
    .replace(/::text/gi, '')
    .replace(/\bILIKE\b/gi, 'LIKE');

  const values = [];
  normalized = normalized.replace(/\$(\d+)/g, (_match, number) => {
    values.push(Number(number));
    return '?';
  });

  return { sql: normalized, positions: values };
}

function rowsFromStatement(statement) {
  const columns = statement.getColumnNames();
  const rows = [];
  while (statement.step()) {
    const values = statement.get();
    rows.push(Object.fromEntries(columns.map((c, i) => [c, values[i]])));
  }
  statement.free();
  return rows;
}

export async function query(text, params = []) {
  const database = await getDb();
  const normalized = normalize(text);
  const orderedParams = normalized.positions.length
    ? normalized.positions.map(position => params[position - 1])
    : params;
  const stmt = database.prepare(normalized.sql);
  stmt.bind(orderedParams);
  const rows = rowsFromStatement(stmt);
  const rowCount = database.getRowsModified();
  persist();
  return { rows, rowCount };
}

export async function withTransaction(fn) {
  const database = await getDb();
  database.run('BEGIN');
  const client = {
    query: async (text, params = []) => query(text, params)
  };
  try {
    const result = await fn(client);
    database.run('COMMIT');
    persist();
    return result;
  } catch (error) {
    try { database.run('ROLLBACK'); } catch {}
    throw error;
  }
}

export function newId() {
  return crypto.randomUUID();
}
