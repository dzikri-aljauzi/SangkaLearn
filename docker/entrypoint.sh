#!/bin/sh
set -e

cd /var/www/html

# Fix storage permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Cache config, routes, views for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run any pending migrations
php artisan migrate --force

exec php-fpm
