# Taller Automotriz — arquitectura local-first

## Objetivo

La aplicación debe seguir operativa dentro de la LAN del taller aunque se pierda Internet. Supabase se conserva como nube/sincronización, no como dependencia obligatoria del trabajo diario.

## Componentes

- **Frontend React/Vite**: interfaz común para recepción, oficina y mecánicos.
- **Servidor local Node/Express**: API accesible por todos los equipos de la LAN.
- **PostgreSQL local**: fuente de verdad operativa durante una desconexión.
- **Outbox de sincronización**: registra operaciones pendientes para enviarlas a la nube cuando vuelva Internet.
- **Supabase**: respaldo, sincronización y acceso remoto cuando exista conectividad.

## Arranque del servidor local

1. Instalar Docker Desktop en el PC/mini-PC que actuará como servidor.
2. Ejecutar `docker compose -f docker-compose.local.yml up -d`.
3. Instalar dependencias con `npm install`.
4. Ejecutar `npm run server`.
5. Los demás PCs de la LAN accederán al servidor mediante `http://IP_DEL_SERVIDOR:8787`.

## Seguridad

El valor `change-me-local-only` del compose es deliberadamente un marcador para instalación local y **no debe reutilizarse en producción**. Antes de la instalación real se debe generar una credencial local fuerte y mantenerla fuera de Git.

Nunca almacenar aquí `service_role`, contraseñas de Supabase ni tokens de usuarios.

## Sincronización

La primera fase crea la infraestructura local y una cola `sync_outbox`. La sincronización bidireccional con Supabase se implementará después de definir reglas de resolución de conflictos y el mapeo completo de las 25 tablas del sistema existente.

## Principio operativo

La aplicación no debe bloquear una operación de taller por falta de Internet. Una operación local confirmada se guarda primero en PostgreSQL local y queda pendiente de sincronización.
