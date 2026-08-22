@echo off
setlocal
cd /d "%~dp0.."
if not exist .env.local (
  copy .env.local.example .env.local >nul
  echo.
  echo Se ha creado .env.local.
  echo IMPORTANTE: abre .env.local y cambia POSTGRES_PASSWORD antes de continuar.
  pause
  exit /b 1
)
where docker >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop no esta instalado o no esta disponible.
  echo Instala Docker Desktop y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)
echo Iniciando Taller Automotriz...
docker compose --env-file .env.local -f docker-compose.local.yml up -d
if errorlevel 1 (
  echo No se pudo iniciar el servidor local.
  pause
  exit /b 1
)
echo.
echo Taller Automotriz esta arrancando en http://localhost:8787
start "" "http://localhost:8787"
pause
