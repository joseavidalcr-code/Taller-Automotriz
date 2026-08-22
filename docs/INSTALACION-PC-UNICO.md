# Instalación inicial — un solo ordenador

## Requisitos

- Windows 10/11 o Linux.
- Docker Desktop (o Docker Engine + Compose).
- Node.js 20+.

## 1. Preparar configuración

Copia `.env.local.example` a `.env.local` y cambia `POSTGRES_PASSWORD` por una contraseña local fuerte. No la subas a GitHub.

## 2. Arrancar PostgreSQL

`docker compose -f docker-compose.local.yml up -d`

El volumen `taller_pgdata` conserva los datos aunque se reinicie el contenedor.

## 3. Instalar dependencias

`npm install`

`cd server && npm install && cd ..`

## 4. Arrancar API local

`npm run server`

Comprobar: `http://localhost:8787/health`

Debe devolver `ok: true` y `mode: local-first`.

## 5. Arrancar interfaz

En otra terminal: `npm run dev`

Durante esta fase de desarrollo, Vite mostrará la URL local.

## Copias de seguridad

Antes de usar datos reales hay que configurar una rutina de backup del volumen PostgreSQL. No considerar esta primera versión lista para producción hasta verificar restauración de una copia.

## Siguiente fase

Una vez validado este PC sin Internet, el servidor local será el punto central de la LAN. Los demás ordenadores accederán a la aplicación por la red local. La sincronización con Supabase se implementará después de validar la operación local.
