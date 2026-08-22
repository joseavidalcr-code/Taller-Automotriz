# Taller Automotriz — instalación en el primer ordenador

## Requisitos

- Windows 10/11 de 64 bits.
- Docker Desktop instalado y arrancado.
- El repositorio descargado en el ordenador.

## Instalación

1. Abre una consola en la carpeta del proyecto.
2. Ejecuta `scripts\instalar-taller-windows.bat`.
3. En la primera ejecución se crea `.env.local`.
4. Edita `.env.local` y establece una contraseña propia para PostgreSQL. No la publiques ni la guardes en Git.
5. Vuelve a ejecutar el instalador.
6. El instalador levanta PostgreSQL y la API local y abre la aplicación.

## Diagnóstico

Si la aplicación no arranca, ejecuta:

`scripts\diagnostico-taller-windows.bat`

## Modo offline

Una vez validado el arranque, la aplicación local puede funcionar sin acceso a Internet. No se debe eliminar ni modificar el volumen `taller_pgdata` durante el uso normal.

## Seguridad

- No introducir contraseñas reales en archivos versionados.
- No desactivar RLS de Supabase.
- No borrar el volumen de PostgreSQL para solucionar problemas sin realizar antes una copia de seguridad.

## Primera prueba

Crear un cliente, vehículo y orden de trabajo; cerrar la aplicación; desconectar Internet; volver a abrirla y verificar que los datos siguen disponibles.
