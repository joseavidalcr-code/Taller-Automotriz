begin;

create index if not exists idx_clientes_email on clientes(lower(email)) where email is not null;
create index if not exists idx_vehiculos_matricula on vehiculos(lower(matricula));
create index if not exists idx_ot_estado_fecha on ordenes_trabajo(estado, created_at desc);
create index if not exists idx_trabajo_mecanicos_trabajo on trabajo_mecanicos(trabajo_id);
create index if not exists idx_repuestos_stock_min on repuestos(stock, stock_minimo) where activo = true;
create index if not exists idx_facturas_estado_fecha on facturas(estado, created_at desc);

alter table if exists vehiculos add constraint vehiculos_km_nonnegative check (kilometraje is null or kilometraje >= 0);
alter table if exists repuestos add constraint repuestos_stock_nonnegative check (stock >= 0);

commit;
