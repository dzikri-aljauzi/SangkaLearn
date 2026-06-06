# Storage Files Not Showing in Production/VPS - Complete Fix

## Problem Description

**Issue**: Files uploaded (images, thumbnails, documents, videos, PDFs) tidak tampil di VPS/production server, tapi bisa tampil di local development.

**User Report**:
> "ini kenapa ya ketika aku upload file entah itu image, thumbnail di pelatihan, dokumen dll ini kenapa untuk yang di vps atau public ketika upload image atau video apapun untuk thumbnail maupun pelajaran dan lainnya yang berupa file tidak dapat tampil tapi di local itu bisa"

---

## Root Causes Analysis

### 1. Missing Symbolic Link ❌
**Problem**: `public/storage` symlink tidak ada atau rusak di production

**How it should work**:
```
public/storage -> storage/app/public (symbolic link)
```

**Local vs Production**:
- Local: Symlink mungkin sudah dibuat otomatis saat development
- Production: Symlink tidak otomatis terbuat setelah deployment

### 2. Directory Permissions ❌
**Problem**: Web server (nginx/apache) tidak punya permission untuk read/write storage directories

**What happens**:
- File upload gagal (permission denied)
- File sudah ada tapi tidak bisa di-serve (403 Forbidden)

**Required Permissions**:
```
storage/          → 775 (rwxrwxr-x)
storage/app/      → 775 (rwxrwxr-x)
storage/app/public → 775 (rwxrwxr-x)
public/storage/   → 775 (rwxrwxr-x)
```

**Owner should be**: Web server user (www-data, nginx, apache, etc.)

### 3. Wrong File Paths in Code ❌
**Problem**: Hard-coded paths atau missing `/storage/` prefix

**Correct format**:
```jsx
// ✅ CORRECT
<img src={`/storage/${course.thumbnail}`} />

// ❌ WRONG
<img src={course.thumbnail} />
<img src={`storage/${course.thumbnail}`} /> // Missing leading slash
```

### 4. Web Server Configuration ❌
**Problem**: Nginx/Apache tidak configured untuk serve static files dari storage

---

## Complete Solution

### Solution 1: Automated Fix (Recommended) ✅

**We created an Artisan command to check and fix everything automatically!**

#### Run the Command:

**A. Check Only (No Changes)**:
```bash
php artisan storage:fix-permissions --check
```

This will:
- ✓ Check if symbolic link exists and correct
- ✓ Check storage directory permissions
- ✓ Check if all required subdirectories exist
- ✓ Check .htaccess configuration
- ✗ NO changes made (safe to run)

**B. Fix Everything**:
```bash
php artisan storage:fix-permissions
```

This will:
- ✓ Create/fix symbolic link
- ✓ Set correct permissions (775)
- ✓ Create missing directories
- ✓ Verify .htaccess

**Output Example**:
```
=================================================
Storage Permission & Symlink Checker/Fixer
=================================================

1. Checking symbolic link...
   ✓ Symbolic link exists: public/storage -> /path/to/storage/app/public
   ✓ Symbolic link is correct

2. Checking storage directory permissions...
   ✓ storage/ is writable
   ✓ storage/app is writable
   ✓ storage/app/public is writable
   ✓ storage/framework is writable
   ✓ storage/logs is writable

3. Checking public storage directories...
   ✓ courses/thumbnails exists and is writable
   ✓ lessons/images exists and is writable
   ✓ lessons/documents exists and is writable
   ✓ lessons/videos exists and is writable
   ✓ lessons/content-blocks exists and is writable
   ✓ lessons/attachments exists and is writable
   ✓ assignments exists and is writable
   ✓ avatars exists and is writable
   ✓ certificates exists and is writable
   ✓ meeting-screenshots exists and is writable

4. Checking .htaccess in public directory...
   ✓ .htaccess exists
   ✓ RewriteEngine is enabled

=================================================
✓ All storage permissions and symlinks have been fixed!

⚠ For VPS/Production Server:
  1. Run: sudo chown -R www-data:www-data storage/
  2. Run: sudo chown -R www-data:www-data public/storage/
  3. Run: sudo chmod -R 775 storage/
  4. Run: sudo chmod -R 775 public/storage/

  Replace "www-data" with your web server user (could be "nginx", "apache", etc.)
=================================================
```

---

### Solution 2: Manual Fix (If Command Fails)

#### Step 1: Create Symbolic Link

**On Production Server (SSH)**:
```bash
cd /path/to/your/laravel/project

# Remove old symlink if exists and broken
rm -rf public/storage

# Create new symbolic link
php artisan storage:link

# Verify it was created
ls -la public/storage
# Should show: public/storage -> /path/to/storage/app/public
```

**Verify symlink**:
```bash
# This should list files in storage/app/public
ls -la public/storage/
```

#### Step 2: Fix Directory Permissions

**Find your web server user**:
```bash
# For Apache
ps aux | grep apache
# Usually: www-data

# For Nginx
ps aux | grep nginx
# Usually: nginx or www-data
```

**Set correct ownership**:
```bash
# Replace "www-data" with your web server user
sudo chown -R www-data:www-data storage/
sudo chown -R www-data:www-data public/storage/
sudo chown -R www-data:www-data bootstrap/cache/
```

**Set correct permissions**:
```bash
sudo chmod -R 775 storage/
sudo chmod -R 775 public/storage/
sudo chmod -R 775 bootstrap/cache/
```

**Verify permissions**:
```bash
ls -la storage/
ls -la storage/app/
ls -la storage/app/public/
ls -la public/storage/
```

Should show:
```
drwxrwxr-x  (775) www-data www-data
```

#### Step 3: Create Required Subdirectories

**Run this to ensure all directories exist**:
```bash
cd storage/app/public

# Create directories if they don't exist
mkdir -p courses/thumbnails
mkdir -p lessons/images
mkdir -p lessons/documents
mkdir -p lessons/videos
mkdir -p lessons/content-blocks
mkdir -p lessons/attachments
mkdir -p assignments
mkdir -p avatars
mkdir -p certificates
mkdir -p meeting-screenshots

# Set permissions
sudo chmod -R 775 .
sudo chown -R www-data:www-data .
```

---

### Solution 3: Web Server Configuration

#### For Nginx:

**Check your Nginx config** (`/etc/nginx/sites-available/your-site`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/laravel/project/public;

    index index.php index.html;

    # Important: Serve static files directly
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp|pdf|mp4|mov|avi)$ {
        expires 365d;
        access_log off;
        add_header Cache-Control "public";
    }

    # Laravel routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock; # Adjust PHP version
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

**Reload Nginx**:
```bash
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

#### For Apache:

**Ensure mod_rewrite is enabled**:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

**Check .htaccess in public/** (should already exist):
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

**Ensure DocumentRoot points to public/**:
```apache
# /etc/apache2/sites-available/your-site.conf
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/your/laravel/project/public

    <Directory /path/to/your/laravel/project/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

**Reload Apache**:
```bash
sudo apachectl configtest  # Test config
sudo systemctl reload apache2
```

---

## Deployment Checklist for VPS/Production

### Every Deployment:

**1. Run Artisan Command**:
```bash
php artisan storage:fix-permissions
```

**2. Set Ownership** (if needed):
```bash
sudo chown -R www-data:www-data storage/
sudo chown -R www-data:www-data public/storage/
```

**3. Clear Caches**:
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

**4. Optimize**:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**5. Test File Upload**:
- Login to admin
- Upload a course thumbnail
- Check if it displays in course list
- Upload a lesson document
- Check if it displays in student view

---

## Testing Guide

### Test 1: Symbolic Link

**Command**:
```bash
ls -la public/storage
```

**Expected Output**:
```
lrwxrwxrwx 1 www-data www-data 37 Dec 05 10:00 public/storage -> /path/to/storage/app/public
```

**✓ Pass if**: Shows `->` (symbolic link) pointing to storage/app/public
**✗ Fail if**: Shows `drwxr-xr-x` (regular directory) or "No such file or directory"

### Test 2: Permissions

**Command**:
```bash
ls -la storage/app/public/
```

**Expected Output**:
```
drwxrwxr-x 10 www-data www-data 4096 Dec 05 10:00 .
drwxrwxr-x  5 www-data www-data 4096 Dec 05 10:00 ..
drwxrwxr-x  2 www-data www-data 4096 Dec 05 10:00 courses
drwxrwxr-x  2 www-data www-data 4096 Dec 05 10:00 lessons
...
```

**✓ Pass if**:
- Owner is www-data (or your web server user)
- Permissions are `rwxrwxr-x` (775)

**✗ Fail if**:
- Owner is root or other user
- Permissions are `rwxr-xr-x` (755) or stricter

### Test 3: File Access

**Test Image URL**:
```bash
# Replace with actual uploaded file
curl -I https://your-domain.com/storage/courses/thumbnails/test.jpg
```

**Expected Output**:
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 12345
...
```

**✓ Pass if**: Status 200 OK
**✗ Fail if**:
- 404 Not Found → Symlink missing or file doesn't exist
- 403 Forbidden → Permission issue
- 500 Internal Server Error → Server config issue

### Test 4: Upload and Display

**Manual Test**:
1. Login as admin
2. Go to Courses → Create Course
3. Upload thumbnail image
4. Save course
5. Go to Courses → Course List
6. Verify thumbnail displays
7. Check browser console (F12) for errors
8. Check Network tab for failed requests

**✓ Pass if**: Image displays correctly
**✗ Fail if**:
- Broken image icon
- 404 error in console
- 403 error in console

---

## Troubleshooting Common Issues

### Issue 1: 404 Not Found for /storage/ files

**Symptoms**:
```
GET /storage/courses/thumbnails/abc123.jpg 404 (Not Found)
```

**Cause**: Symbolic link missing or broken

**Fix**:
```bash
rm -rf public/storage
php artisan storage:link
ls -la public/storage  # Verify
```

---

### Issue 2: 403 Forbidden

**Symptoms**:
```
GET /storage/courses/thumbnails/abc123.jpg 403 (Forbidden)
```

**Cause**: Permission denied

**Fix**:
```bash
sudo chown -R www-data:www-data storage/
sudo chown -R www-data:www-data public/storage/
sudo chmod -R 775 storage/
sudo chmod -R 775 public/storage/
```

---

### Issue 3: File Uploads Fail

**Symptoms**:
- Upload button doesn't work
- Error: "Failed to store file"
- Laravel log: "Permission denied"

**Cause**: Storage directory not writable

**Fix**:
```bash
sudo chown -R www-data:www-data storage/
sudo chmod -R 775 storage/
```

**Check Laravel logs**:
```bash
tail -f storage/logs/laravel.log
```

---

### Issue 4: Files Upload but Don't Display

**Symptoms**:
- Upload succeeds (no errors)
- File exists in storage/app/public/
- But doesn't show in frontend (404)

**Cause**: Symlink broken or wrong path in database

**Fix**:
```bash
# Recreate symlink
rm -rf public/storage
php artisan storage:link

# Check database
php artisan tinker
>>> $course = \App\Models\Course::first();
>>> $course->thumbnail;
// Should return: "courses/thumbnails/abc123.jpg" (NOT "/storage/...")

# If path includes "/storage/", it's wrong - need to fix in controller
```

---

### Issue 5: Works Locally but Not in Production

**Symptoms**:
- Everything works on localhost
- Same code fails on production/VPS
- No errors in console

**Common Causes & Fixes**:

**A. APP_URL mismatch**:
```bash
# In .env file
APP_URL=https://your-actual-domain.com  # NOT http://localhost
```

**B. Different web server user**:
```bash
# Find actual user
ps aux | grep nginx
# Then use correct user
sudo chown -R actual-user:actual-user storage/
```

**C. SELinux blocking** (CentOS/RHEL):
```bash
# Check if SELinux is enforcing
getenforce

# If "Enforcing", allow httpd to access storage
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/path/to/storage(/.*)?"
sudo restorecon -Rv /path/to/storage/
```

---

## Files Changed in This Fix

### New Files Created:

**1. app/Console/Commands/FixStoragePermissions.php**
- Custom Artisan command to check and fix storage issues
- Usage: `php artisan storage:fix-permissions`
- Features:
  - Check symbolic link
  - Verify permissions
  - Create missing directories
  - Verify web server configuration
  - Safe check mode (`--check` flag)

**2. STORAGE_FILES_NOT_SHOWING_FIX.md** (This file)
- Complete troubleshooting guide
- Deployment checklist
- Testing procedures
- Common issues and solutions

### Existing Files (No Changes Needed):

All file storage and retrieval code is **already correct**:

**✓ Controllers** (Already using correct storage disk):
- `app/Http/Controllers/Admin/CourseController.php`
- `app/Http/Controllers/Admin/CourseContentController.php`
- `app/Http/Controllers/Admin/CertificateController.php`
- `app/Http/Controllers/Admin/MeetingController.php`
- `app/Http/Controllers/ProfileController.php`
- All use: `->store('path', 'public')` ✅

**✓ Frontend** (Already using correct paths):
- All JSX files in `resources/js/Pages/`
- All use: `/storage/${file.path}` ✅

**✓ Configuration** (Already correct):
- `config/filesystems.php` - Public disk configured correctly
- Symlink mapping: `public/storage -> storage/app/public` ✅

---

## Production Deployment Commands (Complete)

**Copy this to run on your VPS after deployment**:

```bash
#!/bin/bash
# Storage Fix for Production

# Navigate to project directory
cd /path/to/your/laravel/project

# Run automated fix
php artisan storage:fix-permissions

# Set ownership to web server user (replace www-data if different)
sudo chown -R www-data:www-data storage/
sudo chown -R www-data:www-data public/storage/
sudo chown -R www-data:www-data bootstrap/cache/

# Set permissions
sudo chmod -R 775 storage/
sudo chmod -R 775 public/storage/
sudo chmod -R 775 bootstrap/cache/

# Clear and cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart web server (choose your server)
# For Nginx:
sudo systemctl reload nginx

# For Apache:
# sudo systemctl reload apache2

# For PHP-FPM (if used):
sudo systemctl restart php8.2-fpm  # Adjust version

echo "✓ Storage fix completed!"
echo "Test by uploading a file through admin panel"
```

**Make it executable**:
```bash
chmod +x storage-fix.sh
./storage-fix.sh
```

---

## Quick Reference

### Commands Summary:

| Command | Purpose |
|---------|---------|
| `php artisan storage:fix-permissions` | Auto-fix all storage issues |
| `php artisan storage:fix-permissions --check` | Check only, no changes |
| `php artisan storage:link` | Create symbolic link only |
| `sudo chown -R www-data:www-data storage/` | Fix ownership |
| `sudo chmod -R 775 storage/` | Fix permissions |
| `ls -la public/storage` | Verify symlink |
| `ls -la storage/app/public/` | Check storage contents |

### File Paths Reference:

| Type | Storage Path | Public URL |
|------|-------------|------------|
| Course Thumbnail | `courses/thumbnails/abc.jpg` | `/storage/courses/thumbnails/abc.jpg` |
| Lesson Image | `lessons/images/xyz.png` | `/storage/lessons/images/xyz.png` |
| Lesson Document | `lessons/documents/doc.pdf` | `/storage/lessons/documents/doc.pdf` |
| Lesson Video | `lessons/videos/vid.mp4` | `/storage/lessons/videos/vid.mp4` |
| Assignment | `assignments/file.pdf` | `/storage/assignments/file.pdf` |
| Avatar | `avatars/user123.jpg` | `/storage/avatars/user123.jpg` |
| Certificate | `certificates/cert.pdf` | `/storage/certificates/cert.pdf` |

---

## Summary

### Problem:
Files uploaded di VPS tidak tampil, tapi di local bisa.

### Root Causes:
1. ❌ Symbolic link `public/storage` tidak ada
2. ❌ Permission storage directories salah
3. ❌ Ownership bukan web server user
4. ❌ Web server tidak configured dengan benar

### Solution:
1. ✅ Run `php artisan storage:fix-permissions`
2. ✅ Set ownership: `sudo chown -R www-data:www-data storage/`
3. ✅ Set permissions: `sudo chmod -R 775 storage/`
4. ✅ Verify web server configuration

### Files Changed:
- **New**: `app/Console/Commands/FixStoragePermissions.php`
- **New**: `STORAGE_FILES_NOT_SHOWING_FIX.md`
- **No changes needed**: Existing controllers and frontend code already correct

---

**Status**: ✅ Solution Complete
**Date**: 2025-12-05
**Issue**: Storage files not showing in production
**Fix**: Automated Artisan command + Manual deployment guide
**Testing**: Ready for deployment

---

## Next Steps

1. **Deploy command to production**:
   ```bash
   git add app/Console/Commands/FixStoragePermissions.php
   git commit -m "Add storage fix command for production"
   git push
   ```

2. **On production server**:
   ```bash
   git pull
   composer install --no-dev
   php artisan storage:fix-permissions
   ```

3. **Test file upload**:
   - Upload course thumbnail
   - Upload lesson document
   - Verify files display correctly

4. **Monitor logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

**If issues persist**: Check logs, permissions, and web server configuration using this guide.
