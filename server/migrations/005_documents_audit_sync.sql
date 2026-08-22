begin;

create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  orden_trabajo_id uuid references ordenes_trabajo(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete cascade,
  nombre_archivo text not null,
  ruta_local text not null,
  mime_type text,
  tamano_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists auditoria (
  id bigserial primary key,
  usuario_id uuid references usuarios(id),
  entidad text not null,
  entidad_id uuid,
  accion text not null,
  datos jsonb,
  dispositivo_id text,
  created_at timestamptz not null default now()
);

create table if not exists sync_state (
  id integer primary key default 1 check (id = 1),
  last_cloud_sync timestamptz,
  status text not null default 'offline' check (status in ('offline','syncing','ok','error')),
  last_error text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_documentos_ot on documentos(orden_trabajo_id);
create index if not exists idx_auditoria_entidad on auditoria(entidad, entidad_id, created_at desc);

insert into sync_state(id) values (1) on conflict (id) do nothing;

commit;
