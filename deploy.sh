#!/bin/bash

# =====================================================
# Laravel LMS Deployment Script for Hostinger VPS
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/leadnex.com"
DOMAIN="yourdomain.com"
BACKUP_DIR="/var/backups/leadnex"

# Functions
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

# Create backup
create_backup() {
    log_info "Creating backup..."

    mkdir -p $BACKUP_DIR
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)

    # Backup database
    sudo -u postgres pg_dump leadnex > "$BACKUP_DIR/database_$TIMESTAMP.sql"

    # Backup files (exclude node_modules and vendor)
    tar --exclude='node_modules' --exclude='vendor' --exclude='storage/logs' \
        -czf "$BACKUP_DIR/files_$TIMESTAMP.tar.gz" -C /var/www leadnex.com

    log_success "Backup created: $TIMESTAMP"
}

# Update application
update_application() {
    log_info "Updating application..."

    cd $PROJECT_DIR

    # Put application in maintenance mode
    php artisan down

    # Pull latest changes (if using git)
    if [ -d ".git" ]; then
        git pull origin main
    fi

    # Update dependencies
    composer install --optimize-autoloader --no-dev

    # Update Node dependencies and build assets
    npm install --production
    npm run build

    # Run database migrations
    php artisan migrate --force

    # Clear and cache configurations
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache

    # Set proper permissions
    sudo chown -R www-data:www-data $PROJECT_DIR
    sudo chmod -R 755 $PROJECT_DIR
    sudo chmod -R 775 $PROJECT_DIR/storage $PROJECT_DIR/bootstrap/cache

    # Restart services
    sudo systemctl reload php8.2-fpm
    sudo systemctl reload nginx

    # Restart queue workers
    sudo supervisorctl restart leadnex-worker:*

    # Bring application back online
    php artisan up

    log_success "Application updated successfully!"
}

# Health check
health_check() {
    log_info "Performing health check..."

    # Check if site responds
    if curl -f -s "https://$DOMAIN" > /dev/null; then
        log_success "Site is responding correctly"
    else
        log_error "Site is not responding!"
        return 1
    fi

    # Check database connection
    if php artisan tinker --execute="DB::connection()->getPdo(); echo 'Database OK';" | grep -q "Database OK"; then
        log_success "Database connection OK"
    else
        log_error "Database connection failed!"
        return 1
    fi

    # Check queue workers
    if sudo supervisorctl status leadnex-worker:* | grep -q "RUNNING"; then
        log_success "Queue workers are running"
    else
        log_warning "Queue workers may not be running properly"
    fi
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."

    # Get latest backup
    LATEST_DB=$(ls -t $BACKUP_DIR/database_*.sql | head -n1)
    LATEST_FILES=$(ls -t $BACKUP_DIR/files_*.tar.gz | head -n1)

    if [[ -f "$LATEST_DB" && -f "$LATEST_FILES" ]]; then
        # Put in maintenance mode
        cd $PROJECT_DIR
        php artisan down

        # Restore database
        sudo -u postgres psql leadnex < "$LATEST_DB"

        # Restore files
        cd /var/www
        tar -xzf "$LATEST_FILES"

        # Set permissions
        sudo chown -R www-data:www-data $PROJECT_DIR
        sudo chmod -R 755 $PROJECT_DIR
        sudo chmod -R 775 $PROJECT_DIR/storage $PROJECT_DIR/bootstrap/cache

        # Restart services
        sudo systemctl reload php8.2-fpm
        sudo systemctl reload nginx
        sudo supervisorctl restart leadnex-worker:*

        # Bring back online
        cd $PROJECT_DIR
        php artisan up

        log_success "Rollback completed!"
    else
        log_error "No backup files found for rollback!"
        return 1
    fi
}

# Main deployment process
main() {
    log_info "Starting deployment process..."

    case "${1:-deploy}" in
        "deploy")
            create_backup
            update_application
            health_check || {
                log_error "Health check failed. Consider rolling back."
                exit 1
            }
            log_success "Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            health_check || {
                log_error "Rollback health check failed!"
                exit 1
            }
            ;;
        "backup")
            create_backup
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|backup|health}"
            echo "  deploy   - Full deployment with backup and health check"
            echo "  rollback - Rollback to previous version"
            echo "  backup   - Create backup only"
            echo "  health   - Perform health check only"
            exit 1
            ;;
    esac
}

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root or with sudo"
    exit 1
fi

# Run main function
main "$@"