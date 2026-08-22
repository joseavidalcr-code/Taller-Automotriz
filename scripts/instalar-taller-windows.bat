@echo off
setlocal EnableExtensions
cd /d "%~dp0.."
title Instalador - Taller Automotriz

echo ============================================
echo       INSTALADOR TALLER AUTOMOTRIZ
 echo ============================================
echo.

where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker Desktop no esta instalado o no esta en PATH.
  echo Instala Docker Desktop para Windows y vuelve a ejecutar este instalador.
  pause
  exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker Desktop esta instalado pero no esta iniciado.
  echo Inicia Docker Desktop y vuelve a ejecutar este instalador.
  pause
  exit /b 1
)

if not exist .env.local (
  if not exist .env.local.example (
    echo [ERROR] Falta .env.local.example.
    pause
    exit /b 1
  )
  copy /Y .env.local.example .env.local >nul
  echo Se ha creado .env.local.
  echo.
  echo Debes editar .env.local y cambiar POSTGRES_PASSWORD por un valor propio.
  echo No introduzcas esa contrasena en Git ni la compartas.
  echo.
  pause
)

echo [1/3] Descargando imagenes y preparando servicios...
docker compose --env-file .env.local -f docker-compose.local.yml pull
if errorlevel 1 goto fail

echo [2/3] Iniciando Taller Automotriz...
docker compose --env-file .env.local -f docker-compose.local.yml up -d
if errorlevel 1 goto fail

echo [3/3] Esperando a la API local...
set /a tries=0
:wait
set /a tries+=1
curl -fsS http://localhost:8787/health >nul 2>&1
if not errorlevel 1 goto ready
if %tries% GEQ 30 goto fail
ping 127.0.0.1 -n 2 >nul
goto wait

:ready
echo.
echo ============================================
echo   INSTALACION COMPLETADA
 echo ============================================
echo.
echo Taller Automotriz esta disponible en:
echo http://localhost:8787
start "" "http://localhost:8787"
echo.
echo Para diagnosticar el equipo usa:
echo scripts\diagnostico-taller-windows.bat
echo.
pause
exit /b 0

:fail
echo.
echo [ERROR] No se pudo completar la instalacion.
echo Ejecuta scripts\diagnostico-taller-windows.bat para obtener el estado.
pause
exit /b 1
