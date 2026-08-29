@echo off
echo ==========================================
echo    INICIADOR DE MEDIBOT WHATSAPP
echo ==========================================

echo [1/4] Limpiando procesos de Node anteriores...
taskkill /F /IM node.exe /T 2>nul

echo [2/4] Eliminando archivos temporales y bloqueos...
if exist sessions (
    echo Borrando carpeta sessions...
    rmdir /s /q sessions
)
if exist .wwebjs_auth (
    echo Borrando carpeta .wwebjs_auth...
    rmdir /s /q .wwebjs_auth
)
if exist .wwebjs_cache (
    echo Borrando carpeta .wwebjs_cache...
    rmdir /s /q .wwebjs_cache
)

echo [3/4] Verificando Node.js...
node -v
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH.
    pause
    exit
)

echo [4/4] Iniciando MediBot...
echo Por favor, espera a que aparezca el codigo QR.
node index.js

if %errorlevel% neq 0 (
    echo.
    echo EL BOT SE DETUVO CON UN ERROR.
    echo Revisa el mensaje de arriba para mas detalles.
)

pause
