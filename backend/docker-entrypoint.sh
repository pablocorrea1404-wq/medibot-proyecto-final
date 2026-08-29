#!/bin/bash
set -e

DB_FILE="/var/www/html/var/data.db"

echo ">>> Actualizando esquema de base de datos SQLite..."
php bin/console doctrine:database:create --if-not-exists --no-interaction 2>&1 || true
php bin/console doctrine:schema:update --force --no-interaction 2>&1

echo ">>> Cargando datos de prueba si la base está vacía..."
php bin/console app:load-fixtures --no-interaction 2>&1 || true

echo ">>> Arreglando permisos de escritura para www-data..."
chown -R www-data:www-data /var/www/html/var
chmod -R 775 /var/www/html/var

echo ">>> Iniciando Apache..."
exec apache2-foreground
