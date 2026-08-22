# Taller Automotriz — Local-first

## Fase 1: un ordenador

El sistema debe funcionar primero en un único PC sin depender de Internet.

Arquitectura objetivo:

- Frontend React/Vite.
- Servidor local Node/Express.
- PostgreSQL local en Docker.
- API local como única puerta de acceso a la base local.
- Cola `sync_outbox` preparada para sincronización futura.
- Supabase se conserva como backend cloud y respaldo, pero no es requisito para trabajar localmente.

## Fase 2: varios ordenadores

Cuando el primer PC esté validado, el servidor local se mantiene como punto central de la LAN. Los demás equipos acceden por HTTP al servidor local. No se crean bases independientes por PC.

## Fase 3: sincronización cloud

Añadir sincronización bidireccional entre PostgreSQL local y Supabase. Cada operación deberá tener UUID, dispositivo, versión/timestamp y estado de sincronización. Los conflictos se resolverán con reglas de negocio explícitas, no por sobrescritura ciega.

## Reglas de seguridad

- No guardar contraseñas reales, JWT ni service_role en Git.
- Las credenciales locales se proporcionan mediante `.env`/secrets del equipo.
- La aplicación no debe exponer PostgreSQL directamente a la LAN.
- El API local valida sesión/rol.
- Mantener auditoría y copias de seguridad.
- Supabase existente no se modifica durante la migración local hasta validar la fase 1.

## Orden de implementación

1. Arranque reproducible de PostgreSQL local.
2. Esquema local completo y migraciones.
3. API local completa para clientes, vehículos y OT.
4. Frontend con adaptador local/cloud.
5. Pruebas offline completas en un PC.
6. Instalador/arranque del servidor local.
7. Acceso LAN desde segundo PC.
8. Sincronización con Supabase.
9. Copias cloud y recuperación.
