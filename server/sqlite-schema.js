export const SQLITE_SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS usuarios (
 id TEXT PRIMARY KEY,
 nombre TEXT NOT NULL,
 apellido TEXT,
 email TEXT UNIQUE,
 rol TEXT NOT NULL DEFAULT 'mecanico' CHECK (rol IN ('administrador','encargado','mecanico','finanzas')),
 activo INTEGER NOT NULL DEFAULT 1,
 codigo_acceso TEXT UNIQUE,
 pin_hash TEXT,
 pin_enabled INTEGER NOT NULL DEFAULT 0,
 auth_user_id TEXT UNIQUE,
 local_password_hash TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS clientes (
 id TEXT PRIMARY KEY,
 nombre TEXT NOT NULL,
 apellidos TEXT,
 telefono TEXT,
 email TEXT,
 direccion TEXT,
 notas TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS vehiculos (
 id TEXT PRIMARY KEY,
 cliente_id TEXT NOT NULL REFERENCES clientes(id),
 matricula TEXT NOT NULL UNIQUE,
 marca TEXT,
 modelo TEXT,
 anio INTEGER,
 vin TEXT,
 kilometraje INTEGER,
 notas TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
 id TEXT PRIMARY KEY,
 cliente_id TEXT NOT NULL REFERENCES clientes(id),
 vehiculo_id TEXT NOT NULL REFERENCES vehiculos(id),
 numero_ot TEXT UNIQUE,
 estado TEXT NOT NULL DEFAULT 'abierta',
 descripcion TEXT,
 observaciones TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sync_outbox (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 entity TEXT NOT NULL,
 entity_id TEXT NOT NULL,
 operation TEXT NOT NULL CHECK (operation IN ('insert','update','delete')),
 payload TEXT NOT NULL,
 device_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 synced_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_vehiculos_cliente ON vehiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ot_cliente ON ordenes_trabajo(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ot_vehiculo ON ordenes_trabajo(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_sync_pending ON sync_outbox(created_at) WHERE synced_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_email_lower ON usuarios(lower(email));
`;
