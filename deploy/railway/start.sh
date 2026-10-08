#!/bin/sh
set -e
cd /var/www/html
export PORT="${PORT:-8080}"

php artisan storage:link 2>/dev/null || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# Optional one-time demo data: set SEED_ON_BOOT=true, deploy once, then remove it.
if [ "$SEED_ON_BOOT" = "true" ]; then
    php artisan db:seed --force || true
    php artisan postgres:fix-sequences || true
fi

php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &
php-fpm -D
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec nginx -g 'daemon off;'
