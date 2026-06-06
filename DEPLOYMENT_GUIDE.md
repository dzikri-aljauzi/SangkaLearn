# 📋 Panduan Deploy Laravel LMS ke VPS Hostinger

## 🎯 Persiapan Sebelum Deploy

### 1. VPS Requirements
- **RAM**: Minimal 2GB (Recommended 4GB)
- **Storage**: Minimal 20GB SSD
- **OS**: Ubuntu 20.04/22.04 LTS
- **PHP**: 8.1 atau 8.2
- **Database**: PostgreSQL 13+ atau MySQL 8.0+
- **Web Server**: Nginx + PHP-FPM

### 2. Domain & DNS Setup
- Domain sudah pointing ke IP VPS
- SSL Certificate (akan disetup dengan Let's Encrypt)

---

## 🚀 Step-by-Step Deployment

### **STEP 1: Setup VPS & Dependencies**

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install PHP 8.2 & Extensions
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-pgsql php8.2-sqlite3 \
php8.2-curl php8.2-json php8.2-mbstring php8.2-xml php8.2-zip php8.2-bcmath php8.2-soap \
php8.2-intl php8.2-readline php8.2-ldap php8.2-msgpack php8.2-igbinary php8.2-redis \
php8.2-memcached php8.2-pcov php8.2-xdebug php8.2-gd php8.2-imagick

# Install Composer
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Node.js & NPM (untuk build frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis (opsional, untuk caching)
sudo apt install -y redis-server
```

### **STEP 2: Setup Database PostgreSQL**

```bash
# Switch ke user postgres
sudo -u postgres psql

# Di dalam PostgreSQL console:
CREATE DATABASE leadnex;
CREATE USER leadnex_user WITH ENCRYPTED PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE leadnex TO leadnex_user;
ALTER USER leadnex_user CREATEDB;
\q

# Test koneksi
psql -h localhost -U leadnex_user -d leadnex
```

### **STEP 3: Upload & Setup Project**

```bash
# Buat direktori untuk project
sudo mkdir -p /var/www/leadnex.com
sudo chown -R $USER:$USER /var/www/leadnex.com
cd /var/www/leadnex.com

# Upload file project (via FTP/SCP atau Git Clone)
# Opsi 1: Git Clone (jika ada repo)
git clone https://github.com/your-username/your-repo.git .

# Opsi 2: Upload langsung dari local ke VPS
# scp -r /path/to/local/project/* user@your-vps-ip:/var/www/leadnex.com/

# Set permissions
sudo chown -R www-data:www-data /var/www/leadnex.com
sudo chmod -R 755 /var/www/leadnex.com
sudo chmod -R 775 /var/www/leadnex.com/storage
sudo chmod -R 775 /var/www/leadnex.com/bootstrap/cache
```

### **STEP 4: Install Dependencies & Build Assets**

```bash
cd /var/www/leadnex.com

# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install Node dependencies & build assets
npm install
npm run build

# Set Laravel permissions
php artisan storage:link
```

### **STEP 5: Environment Configuration**

Buat file `.env` production:

```bash
cd /var/www/leadnex.com
cp .env.example .env
nano .env
```

**Konfigurasi .env untuk production:**

```env
APP_NAME="LeadNEX"
VITE_APP_NAME="LeadNEX"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://yourdomain.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

BCRYPT_ROUNDS=12
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error

# Database PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=leadnex
DB_USERNAME=leadnex_user
DB_PASSWORD=your_strong_password_here

# Session & Cache
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=file
QUEUE_CONNECTION=database

# Mail Configuration (Hostinger SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=lmsbisnisdigital@zero13indonesia.com
MAIL_PASSWORD=@LMSbisnisdigital123
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=lmsbisnisdigital@zero13indonesia.com
MAIL_FROM_NAME="LeadNEX Learning Platform"

# Midtrans Configuration - PRODUCTION
MIDTRANS_SERVER_KEY=Mid-server-v2ZO4-ALzGqGDqNtCVN-f-l7
MIDTRANS_CLIENT_KEY=Mid-client-8AK-pqEGOMo1wcEM
MIDTRANS_MERCHANT_ID=G841928519
MIDTRANS_ENVIRONMENT=production
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true

# Security
MIDTRANS_SSL_VERIFY_PEER=true
MIDTRANS_SSL_VERIFY_HOST=2
```

```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (jika ada)
php artisan db:seed --force

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **STEP 6: Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/leadnex.com
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/leadnex.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    # Handle Laravel routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Handle PHP files
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Security headers
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Asset caching
    location ~* \.(css|js|gif|jpe?g|png|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    client_max_body_size 100M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/leadnex.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **STEP 7: Setup SSL Certificate**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### **STEP 8: Configure PHP-FPM**

```bash
sudo nano /etc/php/8.2/fpm/conf.d/99-custom.ini
```

```ini
# Custom PHP Configuration
memory_limit = 512M
max_execution_time = 300
max_input_vars = 3000
upload_max_filesize = 100M
post_max_size = 100M
max_file_uploads = 100

# OpCache
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=64
opcache.max_accelerated_files=32531
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=0
```

```bash
sudo systemctl restart php8.2-fpm
```

### **STEP 9: Setup Cron Jobs**

```bash
sudo crontab -e
```

```bash
# Laravel Scheduler
* * * * * cd /var/www/leadnex.com && php artisan schedule:run >> /dev/null 2>&1

# Queue Worker (jika menggunakan queues)
* * * * * cd /var/www/leadnex.com && php artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

### **STEP 10: Setup Supervisor (Queue Worker)**

```bash
sudo apt install -y supervisor

sudo nano /etc/supervisor/conf.d/leadnex-worker.conf
```

```ini
[program:leadnex-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/leadnex.com/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/leadnex.com/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start leadnex-worker:*
```

---

## 🛡️ Security & Monitoring

### **STEP 11: Basic Security Setup**

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Disable unused PHP functions
sudo nano /etc/php/8.2/fpm/php.ini
```

```ini
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source
```

### **STEP 12: Monitoring & Logs**

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/leadnex
```

```
/var/www/leadnex.com/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

---

## 🎯 Final Checklist

- [ ] ✅ VPS setup dengan PHP 8.2, Nginx, PostgreSQL
- [ ] ✅ Database configured dan migration berhasil
- [ ] ✅ SSL certificate active (HTTPS)
- [ ] ✅ Environment production configured
- [ ] ✅ Assets built dan cache configured
- [ ] ✅ Cron jobs dan queue workers running
- [ ] ✅ Security headers dan firewall configured
- [ ] ✅ Monitoring dan logging setup

---

## 🚨 Troubleshooting Commands

```bash
# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/www/leadnex.com/storage/logs/laravel.log

# Restart services
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart postgresql

# Clear Laravel cache
cd /var/www/leadnex.com
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Check permissions
sudo chown -R www-data:www-data /var/www/leadnex.com
sudo chmod -R 755 /var/www/leadnex.com
sudo chmod -R 775 /var/www/leadnex.com/storage /var/www/leadnex.com/bootstrap/cache
```

---

## 📞 Support

Jika mengalami masalah:
1. Check error logs
2. Verify file permissions
3. Test database connection
4. Verify SSL certificate

**Domain akan accessible di:** https://yourdomain.com

🎉 **Deployment Complete!**