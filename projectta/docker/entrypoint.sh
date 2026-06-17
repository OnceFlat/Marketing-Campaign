#!/bin/sh
set -e

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force
fi

php artisan storage:link >/dev/null 2>&1 || true
php artisan config:cache
php artisan view:cache

exec "$@"
