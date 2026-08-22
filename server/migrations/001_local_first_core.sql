begin;

create extension if not exists pgcrypto;

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text,
  email text unique,
  rol text not null default 'mecanico' check (rol in ('administrador','encargado','mecanico','finanzas')),
  activo boolean not null default true,
  codigo_acceso text unique,
  pin_hash text,
  pin_enabled boolean not null default false,
  auth_user_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellidos text,
  telefono text,
  email text,
  direccion text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vehiculos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id),
  matricula text not null unique,
  marca text,
  modelo text,
  anio integer,
  vin text,
  kilometraje integer,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ordenes_trabajo (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id),
  vehiculo_id uuid not null references vehiculos(id),
  numero_ot text unique,
  estado text not null default 'abierta',
  descripcion text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sync_outbox (
  id bigserial primary key,
  entity text not null,
  entity_id uuid not null,
  operation text not null check (operation in ('insert','update','delete')),
  payload jsonb not null,
  device_id text not null,
  created_at timestamptz not null default now(),
  synced_at timestamptz
);

create index if not exists idx_vehiculos_cliente on vehiculos(cliente_id);
create index if not exists idx_ot_cliente on ordenes_trabajo(cliente_id);
create index if not exists idx_ot_vehiculo on ordenes_trabajo(vehiculo_id);
create index if not exists idx_sync_pending on sync_outbox(created_at) where synced_at is null;

commit;
