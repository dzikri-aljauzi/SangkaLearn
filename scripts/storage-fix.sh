#!/bin/bash
# Storage Fix Script for Production/VPS
# Run this after deployment to ensure storage works correctly

echo "================================================="
echo "Storage Fix Script for Laravel LMS"
echo "================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect web server user
echo "Detecting web server user..."
if id "www-data" &>/dev/null; then
    WEB_USER="www-data"
    echo -e "${GREEN}✓ Found web server user: www-data${NC}"
elif id "nginx" &>/dev/null; then
    WEB_USER="nginx"
    echo -e "${GREEN}✓ Found web server user: nginx${NC}"
elif id "apache" &>/dev/null; then
    WEB_USER="apache"
    echo -e "${GREEN}✓ Found web server user: apache${NC}"
else
    echo -e "${RED}✗ Could not detect web server user${NC}"
    echo -e "${YELLOW}Please specify manually:${NC}"
    read -p "Enter web server user (default: www-data): " WEB_USER
    WEB_USER=${WEB_USER:-www-data}
fi

echo ""
echo "Using web server user: $WEB_USER"
echo ""

# Step 1: Run Laravel storage fix command
echo "Step 1: Running Laravel storage fix command..."
php artisan storage:fix-permissions

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Laravel storage fix command completed${NC}"
else
    echo -e "${RED}✗ Laravel storage fix command failed${NC}"
    exit 1
fi

echo ""

# Step 2: Set ownership
echo "Step 2: Setting ownership to $WEB_USER..."
sudo chown -R $WEB_USER:$WEB_USER storage/
sudo chown -R $WEB_USER:$WEB_USER public/storage/
sudo chown -R $WEB_USER:$WEB_USER bootstrap/cache/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Ownership set successfully${NC}"
else
    echo -e "${YELLOW}⚠ Could not set ownership (may need sudo access)${NC}"
fi

echo ""

# Step 3: Set permissions
echo "Step 3: Setting permissions to 775..."
sudo chmod -R 775 storage/
sudo chmod -R 775 public/storage/
sudo chmod -R 775 bootstrap/cache/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Permissions set successfully${NC}"
else
    echo -e "${YELLOW}⚠ Could not set permissions (may need sudo access)${NC}"
fi

echo ""

# Step 4: Clear caches
echo "Step 4: Clearing Laravel caches..."
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

echo -e "${GREEN}✓ Caches cleared${NC}"
echo ""

# Step 5: Cache config and routes
echo "Step 5: Caching config and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo -e "${GREEN}✓ Config and routes cached${NC}"
echo ""

# Step 6: Restart web server
echo "Step 6: Restarting web server..."
echo "Which web server are you using?"
echo "1) Nginx"
echo "2) Apache"
echo "3) Skip (restart manually)"
read -p "Enter choice (1-3): " SERVER_CHOICE

case $SERVER_CHOICE in
    1)
        sudo systemctl reload nginx
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Nginx reloaded${NC}"
        else
            echo -e "${YELLOW}⚠ Could not reload Nginx${NC}"
        fi

        # Also restart PHP-FPM if exists
        if systemctl list-units --full -all | grep -Fq "php8.2-fpm.service"; then
            sudo systemctl restart php8.2-fpm
            echo -e "${GREEN}✓ PHP-FPM restarted${NC}"
        elif systemctl list-units --full -all | grep -Fq "php8.1-fpm.service"; then
            sudo systemctl restart php8.1-fpm
            echo -e "${GREEN}✓ PHP-FPM restarted${NC}"
        elif systemctl list-units --full -all | grep -Fq "php-fpm.service"; then
            sudo systemctl restart php-fpm
            echo -e "${GREEN}✓ PHP-FPM restarted${NC}"
        fi
        ;;
    2)
        sudo systemctl reload apache2
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Apache reloaded${NC}"
        else
            echo -e "${YELLOW}⚠ Could not reload Apache${NC}"
        fi
        ;;
    3)
        echo -e "${YELLOW}⚠ Skipped web server restart${NC}"
        echo "Please restart your web server manually"
        ;;
    *)
        echo -e "${YELLOW}⚠ Invalid choice, skipping web server restart${NC}"
        ;;
esac

echo ""

# Step 7: Verify symbolic link
echo "Step 7: Verifying symbolic link..."
if [ -L "public/storage" ]; then
    TARGET=$(readlink -f public/storage)
    echo -e "${GREEN}✓ Symbolic link exists: public/storage -> $TARGET${NC}"
else
    echo -e "${RED}✗ Symbolic link does not exist!${NC}"
    echo "Run: php artisan storage:link"
fi

echo ""

# Step 8: Verify permissions
echo "Step 8: Verifying permissions..."
STORAGE_PERM=$(stat -c "%a" storage/ 2>/dev/null || stat -f "%A" storage/ 2>/dev/null)
PUBLIC_STORAGE_PERM=$(stat -c "%a" public/storage/ 2>/dev/null || stat -f "%A" public/storage/ 2>/dev/null)

echo "storage/ permissions: $STORAGE_PERM"
echo "public/storage/ permissions: $PUBLIC_STORAGE_PERM"

if [ "$STORAGE_PERM" -ge "775" ] 2>/dev/null; then
    echo -e "${GREEN}✓ storage/ permissions are correct${NC}"
else
    echo -e "${YELLOW}⚠ storage/ permissions may be too restrictive${NC}"
fi

echo ""

# Summary
echo "================================================="
echo "Storage Fix Completed!"
echo "================================================="
echo ""
echo -e "${GREEN}✓ Next Steps:${NC}"
echo "1. Test file upload through admin panel"
echo "2. Upload a course thumbnail"
echo "3. Upload a lesson document"
echo "4. Verify files display in frontend"
echo ""
echo -e "${YELLOW}⚠ If issues persist:${NC}"
echo "1. Check Laravel logs: tail -f storage/logs/laravel.log"
echo "2. Check web server logs"
echo "3. Verify APP_URL in .env matches your domain"
echo "4. See STORAGE_FILES_NOT_SHOWING_FIX.md for detailed troubleshooting"
echo ""
echo "================================================="
