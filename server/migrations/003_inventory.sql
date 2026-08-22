begin;

create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  notas text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists repuestos (
  id uuid primary key default gen_random_uuid(),
  referencia text unique,
  nombre text not null,
  descripcion text,
  unidad text not null default 'unidad',
  stock numeric(12,2) not null default 0,
  stock_minimo numeric(12,2) not null default 0,
  precio_coste numeric(12,2) not null default 0,
  precio_venta numeric(12,2) not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists movimientos_stock (
  id uuid primary key default gen_random_uuid(),
  repuesto_id uuid not null references repuestos(id),
  tipo text not null check (tipo in ('entrada','salida','ajuste','reserva','liberacion')),
  cantidad numeric(12,2) not null check (cantidad > 0),
  referencia text,
  orden_trabajo_id uuid references ordenes_trabajo(id),
  proveedor_id uuid references proveedores(id),
  created_at timestamptz not null default now()
);

create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid references proveedores(id),
  numero text,
  estado text not null default 'borrador' check (estado in ('borrador','pedido','recibida','cancelada')),
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists compra_lineas (
  id uuid primary key default gen_random_uuid(),
  compra_id uuid not null references compras(id) on delete cascade,
  repuesto_id uuid not null references repuestos(id),
  cantidad numeric(12,2) not null check (cantidad > 0),
  precio_unitario numeric(12,2) not null default 0
);

create index if not exists idx_stock_repuesto_fecha on movimientos_stock(repuesto_id, created_at desc);
create index if not exists idx_compras_proveedor on compras(proveedor_id);
create index if not exists idx_compra_lineas_compra on compra_lineas(compra_id);

commit;
