import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import initSqlJs from 'sql.js';
import { SQLITE_SCHEMA } from './sqlite-schema.js';

const dataDir = process.env.TALLER_DATA_DIR || path.join(process.cwd(), 'data');
const dbFile = path.join(dataDir, 'taller-automotriz.sqlite');
let dbPromise;
let db;

function persist() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbFile, Buffer.from(db.export()));
}

async function getDb() {
  if (db) return db;
  dbPromise ||= (async () => {
    const SQL = await initSqlJs({ locateFile: file => path.join(path.dirname(requireResolveSqlJs()), file) });
    db = fs.existsSync(dbFile) ? new SQL.Database(fs.readFileSync(dbFile)) : new SQL.Database();
    db.run(SQLITE_SCHEMA);
    persist();
    return db;
  })();
  return dbPromise;
}

function requireResolveSqlJs() {
  const resolved = import.meta.resolve('sql.js');
  return new URL(resolved).pathname.replace(/^\//, '');
}

function normalize(sql) {
  return sql
    .replace(/\bnow\(\)/gi, "datetime('now')")
    .replace(/::jsonb/gi, '')
    .replace(/::text/gi, '')
    .replace(/\bILIKE\b/gi, 'LIKE');
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
  const sql = normalize(text);
  const stmt = database.prepare(sql);
  stmt.bind(params);
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
    database.run('ROLLBACK');
    throw error;
  }
}

export function newId() {
  return crypto.randomUUID();
}
