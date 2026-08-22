begin;
alter table usuarios add column if not exists local_password_hash text;
create index if not exists idx_usuarios_email_active on usuarios(lower(email)) where activo=true;
commit;
