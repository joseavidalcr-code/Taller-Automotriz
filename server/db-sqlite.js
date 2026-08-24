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
let transactionDepth = 0;

function persist() {
  fs.mkdirSync(dataDir, { recursive: true });
  const tmpFile = `${dbFile}.tmp`;
  fs.writeFileSync(tmpFile, Buffer.from(db.export()));
  fs.renameSync(tmpFile, dbFile);
}

function columnsOf(database, table) {
  const stmt = database.prepare(`PRAGMA table_info(${table})`);
  try {
    const cols = [];
    while (stmt.step()) cols.push(stmt.getAsObject().name);
    return cols;
  } finally { stmt.free(); }
}

function migrateLocalSchema(database) {
  const cols = columnsOf(database, 'ordenes_trabajo');
  if (!cols.length) return;

  const wanted = [
    ['fecha_entrada', "TEXT"],
    ['fecha_prevista_entrega', "TEXT"],
    ['fecha_entrega', "TEXT"],
    ['prioridad', "TEXT NOT NULL DEFAULT 'normal'"],
    ['asesor_id', "TEXT"],
    ['mecanico_id', "TEXT"],
    ['kilometraje_entrada', "INTEGER"],
    ['nivel_combustible', "TEXT"],
    ['llaves_entregadas', "INTEGER NOT NULL DEFAULT 0"],
    ['motivo_entrada', "TEXT"],
    ['averia_comunicada', "TEXT"],
    ['diagnostico', "TEXT"],
    ['trabajo_solicitado', "TEXT"],
    ['danos_observaciones', "TEXT"],
    ['accesorios', "TEXT"]
  ];
  for (const [name, type] of wanted) {
    if (!cols.includes(name)) database.run(`ALTER TABLE ordenes_trabajo ADD COLUMN ${name} ${type}`);
  }

  // The original local schema restricted estado to a smaller set. Rebuild only
  // when that legacy CHECK is present, preserving every existing OT.
  const tableSql = database.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='ordenes_trabajo'")[0]?.values?.[0]?.[0] || '';
  if (tableSql.includes("CHECK (estado IN ('abierta','en_proceso','esperando_piezas','terminada','cerrada','cancelada'))")) {
    database.run('PRAGMA foreign_keys = OFF');
    database.run(`CREATE TABLE ordenes_trabajo_new (
      id TEXT PRIMARY KEY,
      cliente_id TEXT NOT NULL REFERENCES clientes(id),
      vehiculo_id TEXT NOT NULL REFERENCES vehiculos(id),
      numero_ot TEXT UNIQUE,
      fecha_entrada TEXT NOT NULL DEFAULT (datetime('now')),
      fecha_prevista_entrega TEXT,
      fecha_entrega TEXT,
      estado TEXT NOT NULL DEFAULT 'presupuesto',
      prioridad TEXT NOT NULL DEFAULT 'normal',
      asesor_id TEXT,
      mecanico_id TEXT,
      kilometraje_entrada INTEGER,
      nivel_combustible TEXT,
      llaves_entregadas INTEGER NOT NULL DEFAULT 0,
      motivo_entrada TEXT,
      averia_comunicada TEXT,
      diagnostico TEXT,
      trabajo_solicitado TEXT,
      danos_observaciones TEXT,
      accesorios TEXT,
      descripcion TEXT,
      observaciones TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK (estado IN ('presupuesto','pendiente_autorizacion','autorizada','en_espera','en_reparacion','terminada','entregada','cancelada')),
      CHECK (prioridad IN ('normal','alta','urgente'))
    )`);
    database.run(`INSERT INTO ordenes_trabajo_new
      (id,cliente_id,vehiculo_id,numero_ot,fecha_entrada,fecha_prevista_entrega,fecha_entrega,estado,prioridad,asesor_id,mecanico_id,kilometraje_entrada,nivel_combustible,llaves_entregadas,motivo_entrada,averia_comunicada,diagnostico,trabajo_solicitado,danos_observaciones,accesorios,descripcion,observaciones,created_at,updated_at)
      SELECT id,cliente_id,vehiculo_id,numero_ot,COALESCE(fecha_entrada,created_at),fecha_prevista_entrega,fecha_entrega,
        CASE estado WHEN 'abierta' THEN 'presupuesto' WHEN 'en_proceso' THEN 'en_reparacion' WHEN 'esperando_piezas' THEN 'en_espera' WHEN 'terminada' THEN 'terminada' WHEN 'cerrada' THEN 'entregada' ELSE 'cancelada' END,
        COALESCE(prioridad,'normal'),asesor_id,mecanico_id,kilometraje_entrada,nivel_combustible,COALESCE(llaves_entregadas,0),motivo_entrada,averia_comunicada,diagnostico,trabajo_solicitado,danos_observaciones,accesorios,descripcion,observaciones,created_at,updated_at
      FROM ordenes_trabajo`);
    database.run('DROP TABLE ordenes_trabajo');
    database.run('ALTER TABLE ordenes_trabajo_new RENAME TO ordenes_trabajo');
    database.run('CREATE INDEX IF NOT EXISTS idx_ot_cliente ON ordenes_trabajo(cliente_id)');
    database.run('CREATE INDEX IF NOT EXISTS idx_ot_vehiculo ON ordenes_trabajo(vehiculo_id)');
    database.run('PRAGMA foreign_keys = ON');
  }
}

async function getDb() {
  if (db) return db;
  dbPromise ||= (async () => {
    fs.mkdirSync(dataDir, { recursive: true });
    const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
    const SQL = await initSqlJs({ locateFile: () => wasmPath });
    db = fs.existsSync(dbFile) ? new SQL.Database(new Uint8Array(fs.readFileSync(dbFile))) : new SQL.Database();
    db.run(SQLITE_SCHEMA);
    migrateLocalSchema(db);
    persist();
    return db;
  })();
  return dbPromise;
}

function normalize(sql) {
  let normalized = sql.replace(/\bnow\(\)/gi, "datetime('now')").replace(/::jsonb/gi, '').replace(/::text/gi, '').replace(/\bILIKE\b/gi, 'LIKE');
  const positions = [];
  normalized = normalized.replace(/\$(\d+)/g, (_match, number) => { positions.push(Number(number)); return '?'; });
  return { sql: normalized, positions };
}

function execute(database, text, params = []) {
  const normalized = normalize(text);
  const orderedParams = normalized.positions.length ? normalized.positions.map(position => params[position - 1]) : params;
  const stmt = database.prepare(normalized.sql);
  try {
    stmt.bind(orderedParams);
    const columns = stmt.getColumnNames();
    const rows = [];
    while (stmt.step()) { const values = stmt.get(); rows.push(Object.fromEntries(columns.map((c, i) => [c, values[i]]))); }
    return { rows, rowCount: database.getRowsModified() };
  } finally { stmt.free(); }
}

export async function query(text, params = []) {
  const database = await getDb();
  const result = execute(database, text, params);
  if (transactionDepth === 0) persist();
  return result;
}

export async function withTransaction(fn) {
  const database = await getDb();
  const outermost = transactionDepth === 0;
  if (outermost) database.run('BEGIN TRANSACTION');
  transactionDepth += 1;
  const client = { query: async (text, params = []) => execute(database, text, params) };
  try {
    const result = await fn(client);
    transactionDepth -= 1;
    if (outermost) { database.run('COMMIT'); persist(); }
    return result;
  } catch (error) {
    transactionDepth = Math.max(0, transactionDepth - 1);
    if (outermost) { try { database.run('ROLLBACK'); } catch {} }
    throw error;
  }
}

export function newId() { return crypto.randomUUID(); }
