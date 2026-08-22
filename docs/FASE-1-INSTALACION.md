# Fase 1 — instalación en un ordenador

## Requisitos
- Windows 10/11 o Linux moderno.
- Docker Desktop (Windows) o Docker Engine (Linux).
- Node.js 20+ para desarrollo.

## 1. Preparar configuración
Copia `.env.local.example` a `.env.local` y define una contraseña local fuerte para PostgreSQL. No la publiques ni la envíes por chat.

## 2. Levantar PostgreSQL
`docker compose -f docker-compose.local.yml up -d`

## 3. Ejecutar migraciones
Define `DATABASE_URL` con la misma base local y ejecuta desde `server/migrations`:
`node run-migrations.js`

## 4. Arrancar API
Instala dependencias de `server` y ejecuta el servidor local.

## 5. Arrancar frontend
Instala dependencias del proyecto y ejecuta Vite.

## 6. Operación offline
Una vez iniciado el servidor local, el trabajo diario no requiere Internet. Supabase no debe ser requisito de la operación local.

## 7. Backup
Ejecuta `server/backup.sh` periódicamente y conserva las copias fuera del equipo principal.

## 8. Antes de producción
- Cambiar todas las credenciales de ejemplo.
- Probar restauración de backup.
- Configurar firewall para permitir solo la LAN al API.
- Activar HTTPS si se accede desde redes no confiables.
- Configurar UPS/SAI para el servidor.
