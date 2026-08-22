begin;

create table if not exists trabajos (
  id uuid primary key default gen_random_uuid(),
  orden_trabajo_id uuid not null references ordenes_trabajo(id) on delete cascade,
  titulo text not null,
  descripcion text,
  estado text not null default 'pendiente' check (estado in ('pendiente','en_curso','pausado','finalizado','cancelado')),
  prioridad text not null default 'normal' check (prioridad in ('baja','normal','alta','urgente')),
  tiempo_estimado_min integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trabajo_mecanicos (
  trabajo_id uuid not null references trabajos(id) on delete cascade,
  mecanico_id uuid not null references usuarios(id),
  asignado_at timestamptz not null default now(),
  primary key (trabajo_id, mecanico_id)
);

create table if not exists fichajes (
  id uuid primary key default gen_random_uuid(),
  mecanico_id uuid not null references usuarios(id),
  trabajo_id uuid references trabajos(id),
  inicio timestamptz not null,
  fin timestamptz,
  estado text not null default 'activo' check (estado in ('activo','finalizado','cancelado')),
  created_at timestamptz not null default now()
);

create table if not exists pausas (
  id uuid primary key default gen_random_uuid(),
  fichaje_id uuid not null references fichajes(id) on delete cascade,
  inicio timestamptz not null,
  fin timestamptz,
  motivo text,
  created_at timestamptz not null default now()
);

create index if not exists idx_trabajos_ot on trabajos(orden_trabajo_id);
create index if not exists idx_trabajos_estado on trabajos(estado);
create index if not exists idx_asignaciones_mecanico on trabajo_mecanicos(mecanico_id);
create index if not exists idx_fichajes_mecanico_inicio on fichajes(mecanico_id, inicio desc);
create index if not exists idx_pausas_fichaje on pausas(fichaje_id);

commit;
