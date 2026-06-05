#!/bin/bash

# =====================================================
# VPS Setup Script for Laravel LMS on Hostinger
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root"
    exit 1
fi

log_info "Starting VPS setup for Laravel LMS..."

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install PHP 8.2
log_info "Installing PHP 8.2 and extensions..."
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-pgsql php8.2-sqlite3 \
php8.2-curl php8.2-json php8.2-mbstring php8.2-xml php8.2-zip php8.2-bcmath php8.2-soap \
php8.2-intl php8.2-readline php8.2-ldap php8.2-msgpack php8.2-igbinary php8.2-redis \
php8.2-memcached php8.2-pcov php8.2-gd php8.2-imagick

# Install Composer
log_info "Installing Composer..."
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Node.js 18.x
log_info "Installing Node.js and NPM..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Nginx
log_info "Installing Nginx..."
apt install -y nginx

# Install PostgreSQL
log_info "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Redis
log_info "Installing Redis..."
apt install -y redis-server

# Install Supervisor
log_info "Installing Supervisor..."
apt install -y supervisor

# Install Certbot for SSL
log_info "Installing Certbot for SSL certificates..."
apt install -y certbot python3-certbot-nginx

# Install security tools
log_info "Installing security tools..."
apt install -y fail2ban ufw

# Configure PHP-FPM
log_info "Configuring PHP-FPM..."
cat > /etc/php/8.2/fpm/conf.d/99-custom.ini << EOF
memory_limit = 512M
max_execution_time = 300
max_input_vars = 3000
upload_max_filesize = 100M
post_max_size = 100M
max_file_uploads = 100

; OpCache
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=64
opcache.max_accelerated_files=32531
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=0

; Security
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source
EOF

# Configure PostgreSQL
log_info "Setting up PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Create database user (you'll need to set the password)
log_warning "Creating database user - you'll be prompted for password..."
read -s -p "Enter password for database user 'leadnex_user': " DB_PASSWORD
echo
sudo -u postgres psql << EOF
CREATE DATABASE leadnex;
CREATE USER leadnex_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE leadnex TO leadnex_user;
ALTER USER leadnex_user CREATEDB;
EOF

# Configure Redis
log_info "Configuring Redis..."
systemctl enable redis-server
systemctl start redis-server

# Configure Nginx (basic)
log_info "Configuring Nginx basic settings..."
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rss+xml
        application/vnd.geo+json
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/bmp
        image/svg+xml
        image/x-icon
        text/cache-manifest
        text/css
        text/plain
        text/vcard
        text/vnd.rim.location.xloc
        text/vtt
        text/x-component
        text/x-cross-domain-policy;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Include server configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Configure firewall
log_info "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Configure fail2ban
log_info "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
EOF

# Start and enable services
log_info "Starting and enabling services..."
systemctl enable nginx
systemctl enable php8.2-fpm
systemctl enable postgresql
systemctl enable redis-server
systemctl enable supervisor
systemctl enable fail2ban

systemctl start nginx
systemctl start php8.2-fpm
systemctl start postgresql
systemctl start redis-server
systemctl start supervisor
systemctl start fail2ban

# Create project directory
log_info "Creating project directory..."
mkdir -p /var/www/leadnex.com
chown -R www-data:www-data /var/www/leadnex.com
chmod -R 755 /var/www/leadnex.com

# Create backup directory
mkdir -p /var/backups/leadnex
chown -R www-data:www-data /var/backups/leadnex

log_success "VPS setup completed successfully!"
log_info "Next steps:"
log_info "1. Upload your Laravel project to /var/www/leadnex.com"
log_info "2. Configure your domain's Nginx virtual host"
log_info "3. Set up SSL certificate with: certbot --nginx -d yourdomain.com"
log_info "4. Copy .env.production to .env and configure it"
log_info "5. Run: composer install --no-dev && npm install && npm run build"
log_info "6. Run: php artisan migrate --force"
log_warning "Database password for 'leadnex_user' was set. Please note it down!"