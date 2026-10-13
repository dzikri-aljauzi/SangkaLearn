#!/bin/sh
set -e
cd /var/www/html
export PORT="${PORT:-8080}"
# Container filesystem is ephemeral: log to stderr so errors show up in Railway logs.
export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"

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

# Artisan above ran as root and may have created root-owned files (logs, compiled views,
# caches). php-fpm/queue run as www-data and would get 'Permission denied' -> HTTP 500.
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

su -s /bin/sh www-data -c 'php artisan queue:work --sleep=3 --tries=3 --max-time=3600' &
php-fpm -D
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec nginx -g 'daemon off;'
