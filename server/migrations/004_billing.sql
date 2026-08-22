begin;

create table if not exists presupuestos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id),
  vehiculo_id uuid references vehiculos(id),
  orden_trabajo_id uuid references ordenes_trabajo(id),
  numero text unique,
  estado text not null default 'borrador' check (estado in ('borrador','enviado','aceptado','rechazado','caducado')),
  subtotal numeric(12,2) not null default 0,
  impuestos numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists presupuesto_lineas (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references presupuestos(id) on delete cascade,
  concepto text not null,
  cantidad numeric(12,2) not null default 1,
  precio_unitario numeric(12,2) not null default 0,
  impuesto numeric(12,2) not null default 0
);

create table if not exists facturas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id),
  orden_trabajo_id uuid references ordenes_trabajo(id),
  numero text unique,
  estado text not null default 'pendiente' check (estado in ('borrador','emitida','pagada','anulada')),
  subtotal numeric(12,2) not null default 0,
  impuestos numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  fecha_emision timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists factura_lineas (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references facturas(id) on delete cascade,
  concepto text not null,
  cantidad numeric(12,2) not null default 1,
  precio_unitario numeric(12,2) not null default 0,
  impuesto numeric(12,2) not null default 0
);

create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references facturas(id) on delete cascade,
  importe numeric(12,2) not null check (importe > 0),
  metodo text not null check (metodo in ('efectivo','tarjeta','transferencia','otro')),
  fecha timestamptz not null default now(),
  referencia text
);

create index if not exists idx_presupuestos_cliente on presupuestos(cliente_id);
create index if not exists idx_facturas_cliente on facturas(cliente_id);
create index if not exists idx_pagos_factura on pagos(factura_id);

commit;
