@echo off
setlocal
cd /d "%~dp0.."
echo ============================================
echo   DIAGNOSTICO - TALLER AUTOMOTRIZ
 echo ============================================
echo.
where docker >nul 2>&1
if errorlevel 1 (echo [ROJO] Docker no esta instalado/disponible.&goto end)
echo [VERDE] Docker disponible.
docker compose --env-file .env.local -f docker-compose.local.yml ps
echo.
echo Comprobando API local...
curl -fsS http://localhost:8787/health >nul 2>&1
if errorlevel 1 (echo [ROJO] API local no responde.) else (echo [VERDE] API local responde.)
echo.
echo Comprobando PostgreSQL...
docker compose --env-file .env.local -f docker-compose.local.yml exec -T postgres pg_isready >nul 2>&1
if errorlevel 1 (echo [ROJO] PostgreSQL no esta listo.) else (echo [VERDE] PostgreSQL esta listo.)
:end
echo.
echo Diagnostico terminado.
pause
