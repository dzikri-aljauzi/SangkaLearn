# Deployment Guide

This guide covers deploying LeadNEX to a Ubuntu 22.04 VPS. For a fully automated setup, see `scripts/vps-setup.sh`.

---

## Server Requirements

| Component | Version |
|---|---|
| Ubuntu | 22.04 LTS |
| PHP | 8.2 + extensions: `fpm cli mbstring xml curl zip gd bcmath pgsql pdo-pgsql` |
| Composer | 2+ |
| Node.js | 18+ |
| PostgreSQL | 14+ (or MySQL 8) |
| Nginx | Latest stable |
| Supervisor | For queue workers |
| wkhtmltopdf | 0.12.6 (required for certificate PDF generation) |

### Install wkhtmltopdf

```bash
wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox_0.12.6.1-3.jammy_amd64.deb
sudo dpkg -i wkhtmltox_0.12.6.1-3.jammy_amd64.deb
sudo apt-get install -f
```

---

## Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2
sudo apt install -y php8.2-fpm php8.2-cli php8.2-mbstring php8.2-xml \
  php8.2-curl php8.2-zip php8.2-gd php8.2-bcmath php8.2-pgsql php8.2-pdo

# Install Nginx, Composer, Node, Supervisor
sudo apt install -y nginx supervisor
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## Nginx Configuration

Create `/etc/nginx/sites-available/leadnex`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/leadnex/public;
    index index.php;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires max;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site and reload:
```bash
sudo ln -s /etc/nginx/sites-available/leadnex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Application Deployment

### First-time setup

```bash
cd /var/www
git clone <repo-url> leadnex
cd leadnex

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install and build JS
npm ci
npm run build

# Set up environment
cp .env.example .env
php artisan key:generate
# Edit .env — set DB credentials, APP_URL, Midtrans keys, etc.

# Database
php artisan migrate --force
php artisan db:seed --force

# Storage
php artisan storage:link
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Subsequent deployments

```bash
cd /var/www/leadnex
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo supervisorctl restart leadnex-worker:*
```

Or use the deploy script: `bash scripts/deploy.sh`

---

## Queue Workers (Supervisor)

Create `/etc/supervisor/conf.d/leadnex-worker.conf`:

```ini
[program:leadnex-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/leadnex/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/leadnex/storage/logs/worker.log
stopwaitsecs=3600
```

Reload Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start leadnex-worker:*
```

---

## Cron Jobs

Add to the `www-data` crontab (`sudo crontab -u www-data -e`):

```cron
* * * * * php artisan schedule:run >> /dev/null 2>&1
```

This runs all scheduled tasks defined in `routes/console.php`.

---

## File Permissions

```bash
sudo chown -R www-data:www-data /var/www/leadnex
sudo find /var/www/leadnex -type f -exec chmod 644 {} \;
sudo find /var/www/leadnex -type d -exec chmod 755 {} \;
sudo chmod -R 775 /var/www/leadnex/storage
sudo chmod -R 775 /var/www/leadnex/bootstrap/cache
```

---

## Midtrans Webhook

After deploying, configure Midtrans to call your server when payments complete:

1. Log in to [dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Go to Settings → Configuration
3. Set **Payment Notification URL** to: `https://yourdomain.com/payment/notification`
4. Set **Finish / Unfinish / Error Redirect URL** to: `https://yourdomain.com/payment/finish`

The notification endpoint has no auth middleware — Midtrans calls it directly.

---

## Health Check

```bash
# PHP-FPM running
sudo systemctl status php8.2-fpm

# Nginx running
sudo systemctl status nginx

# Queue workers running
sudo supervisorctl status leadnex-worker:*

# Site responds
curl -I https://yourdomain.com

# Check Laravel logs
tail -f /var/www/leadnex/storage/logs/laravel.log
```
