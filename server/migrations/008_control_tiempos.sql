begin;

create table if not exists control_tiempos (
  id uuid primary key,
  mecanico_id uuid not null references usuarios(id),
  orden_id uuid not null references ordenes_trabajo(id),
  tarea text not null,
  inicio timestamptz not null,
  fin timestamptz,
  estado text not null default 'activo' check (estado in ('activo','pausado','finalizado')),
  pausa_actual_inicio timestamptz,
  pausa_actual_motivo text,
  tiempo_pausado_segundos integer not null default 0,
  tiempo_efectivo_segundos integer not null default 0,
  tiempo_total_segundos integer not null default 0,
  pausas jsonb not null default '[]'::jsonb,
  motivo_correccion text,
  corregido_por uuid references usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_control_tiempos_mecanico_activo
  on control_tiempos(mecanico_id)
  where estado in ('activo','pausado');

create index if not exists idx_control_tiempos_orden on control_tiempos(orden_id);
create index if not exists idx_control_tiempos_mecanico_inicio on control_tiempos(mecanico_id,inicio desc);

commit;
