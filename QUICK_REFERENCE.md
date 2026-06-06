# 🚀 Quick Reference - Laravel LMS Production

## 📥 Upload Files ke VPS

### Via SCP (dari Windows)
```bash
# Upload seluruh project (dari local Windows)
scp -r "C:\LNA PROJECT\lms\*" root@your-vps-ip:/var/www/leadnex.com/

# Upload file tertentu
scp "C:\LNA PROJECT\lms\.env.production" root@your-vps-ip:/var/www/leadnex.com/.env
```

### Via FileZilla/WinSCP
- Host: `your-vps-ip`
- Username: `root` (atau user yang dibuat)
- Port: `22`
- Upload ke: `/var/www/leadnex.com/`

---

## ⚡ Quick Commands

### 🚀 First Time Setup
```bash
# 1. Run VPS setup script
chmod +x vps-setup.sh
sudo ./vps-setup.sh

# 2. Upload project files to /var/www/leadnex.com/

# 3. Install dependencies
cd /var/www/leadnex.com
composer install --optimize-autoloader --no-dev
npm install --production
npm run build

# 4. Configure environment
cp .env.production .env
nano .env  # Edit database password and domain

# 5. Setup Laravel
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Set permissions
sudo chown -R www-data:www-data /var/www/leadnex.com
sudo chmod -R 755 /var/www/leadnex.com
sudo chmod -R 775 storage bootstrap/cache

# 7. Setup domain (replace with your domain)
sudo nano /etc/nginx/sites-available/yourdomain.com
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 8. Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 🔄 Regular Deployment
```bash
# Use deployment script
chmod +x deploy.sh
sudo ./deploy.sh deploy

# Or manual steps:
cd /var/www/leadnex.com
php artisan down
git pull origin main  # if using git
composer install --optimize-autoloader --no-dev
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl reload php8.2-fpm nginx
sudo supervisorctl restart leadnex-worker:*
php artisan up
```

---

## 🔧 Maintenance Commands

### Laravel Cache Management
```bash
cd /var/www/leadnex.com

# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild cache (production)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### Service Management
```bash
# Restart services
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart postgresql
sudo supervisorctl restart leadnex-worker:*

# Check service status
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo supervisorctl status
```

### Database Management
```bash
# Backup database
sudo -u postgres pg_dump leadnex > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
sudo -u postgres psql leadnex < backup_file.sql

# Connect to database
sudo -u postgres psql leadnex
```

---

## 📊 Monitoring & Logs

### Check Logs
```bash
# Laravel logs
tail -f /var/www/leadnex.com/storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# PHP-FPM logs
tail -f /var/log/php8.2-fpm.log

# System logs
journalctl -f -u nginx
journalctl -f -u php8.2-fpm
```

### Performance Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
htop

# Check running processes
ps aux | grep php
ps aux | grep nginx
```

---

## 🛡️ Security & SSL

### SSL Certificate Management
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

### Firewall Management
```bash
# Check firewall status
sudo ufw status

# Allow specific port
sudo ufw allow 443

# Block specific IP
sudo ufw deny from 192.168.1.100
```

### File Permissions (if issues)
```bash
# Fix Laravel permissions
cd /var/www/leadnex.com
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod -R 775 storage bootstrap/cache public/storage

# If using specific user
sudo chown -R www-data:www-data /var/www/leadnex.com
sudo find /var/www/leadnex.com -type f -exec chmod 644 {} \;
sudo find /var/www/leadnex.com -type d -exec chmod 755 {} \;
sudo chmod -R 775 /var/www/leadnex.com/storage
sudo chmod -R 775 /var/www/leadnex.com/bootstrap/cache
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. "500 Internal Server Error"
```bash
# Check Laravel logs
tail -50 /var/www/leadnex.com/storage/logs/laravel.log

# Check PHP-FPM logs
tail -50 /var/log/php8.2-fpm.log

# Check Nginx logs
tail -50 /var/log/nginx/error.log

# Common fixes:
sudo chmod -R 775 /var/www/leadnex.com/storage
php artisan config:clear
```

#### 2. Database Connection Issues
```bash
# Test database connection
cd /var/www/leadnex.com
php artisan tinker
DB::connection()->getPdo();

# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"
```

#### 3. Queue Jobs Not Processing
```bash
# Check supervisor
sudo supervisorctl status

# Restart queue workers
sudo supervisorctl restart leadnex-worker:*

# Check queue table
php artisan queue:work --once
```

#### 4. SSL Certificate Issues
```bash
# Check certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Renew certificate
sudo certbot renew --force-renewal
```

---

## 📱 Domain Configuration Example

Replace in Nginx config (`/etc/nginx/sites-available/yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/leadnex.com/public;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Include SSL config
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 100M;
}
```

---

## 📞 Emergency Commands

### If Site is Down
```bash
# 1. Check if services are running
sudo systemctl status nginx php8.2-fpm postgresql

# 2. Restart all services
sudo systemctl restart nginx php8.2-fpm postgresql

# 3. Check Laravel
cd /var/www/leadnex.com
php artisan up  # if in maintenance mode
php artisan config:clear

# 4. Check permissions
sudo chown -R www-data:www-data /var/www/leadnex.com
sudo chmod -R 775 storage bootstrap/cache
```

### Quick Rollback
```bash
sudo ./deploy.sh rollback
```

---

🎯 **Production URL**: `https://yourdomain.com`

📊 **Admin Panel**: `https://yourdomain.com/admin`

🔐 **Database**: PostgreSQL on localhost:5432

💬 **Support**: Check logs first, then review configurations above!