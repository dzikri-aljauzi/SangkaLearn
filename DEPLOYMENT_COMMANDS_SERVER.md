# 🚀 DEPLOYMENT COMMANDS - MEETING SYSTEM v1.1

## 📋 COMMANDS UNTUK SERVER PRODUCTION

**IMPORTANT:** Jalankan semua command ini di server production setelah upload project

---

## 1️⃣ PERSIAPAN AWAL

### **A. Update Composer Dependencies**
```bash
composer install --optimize-autoloader --no-dev
```

### **B. Clear All Cache**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## 2️⃣ KONFIGURASI .ENV

### **A. Copy .env.example ke .env** (jika belum ada)
```bash
cp .env.example .env
```

### **B. Generate Application Key** (jika belum ada)
```bash
php artisan key:generate
```

### **C. Update .env dengan konfigurasi production:**

```env
# APP CONFIGURATION
APP_NAME="LeadNEX"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-production-domain.com

# DATABASE
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# MAIL CONFIGURATION
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=lmsbisnisdigital@zero13indonesia.com
MAIL_PASSWORD=@LMSbisnisdigital123
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=lmsbisnisdigital@zero13indonesia.com
MAIL_FROM_NAME="LeadNEX Learning Platform"

# QUEUE CONFIGURATION
QUEUE_CONNECTION=database

# SESSION & CACHE
SESSION_DRIVER=database
CACHE_DRIVER=file
```

---

## 3️⃣ DATABASE SETUP

### **A. Run All Migrations**
```bash
php artisan migrate --force
```

**Expected Output:**
```
✓ 2025_11_09_131615_create_meetings_table
✓ 2025_11_09_131654_create_meeting_attendances_table
✓ 2025_11_09_131712_create_certificate_queue_table
✓ 2025_11_09_152151_add_email_tracking_to_meetings_table
```

### **B. Seed Database** (jika diperlukan)
```bash
# Seed course types (jika belum ada)
php artisan db:seed --class=CourseTypeSeeder

# OPTIONAL: Seed semua data
# php artisan db:seed
```

### **C. Create Jobs Table** (untuk queue)
```bash
php artisan queue:table
php artisan migrate --force
```

**Expected Output:**
```
✓ 2025_XX_XX_XXXXXX_create_jobs_table
```

---

## 4️⃣ STORAGE & PERMISSIONS

### **A. Create Storage Link**
```bash
php artisan storage:link
```

### **B. Set Permissions**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

**Atau jika menggunakan user lain:**
```bash
chown -R your-user:www-data storage
chown -R your-user:www-data bootstrap/cache
```

---

## 5️⃣ OPTIMIZE FOR PRODUCTION

### **A. Cache Configuration**
```bash
php artisan config:cache
```

### **B. Cache Routes**
```bash
php artisan route:cache
```

### **C. Cache Views**
```bash
php artisan view:cache
```

### **D. Optimize Autoloader**
```bash
composer dump-autoload --optimize
```

---

## 6️⃣ QUEUE WORKER SETUP

### **OPTION A: Supervisor (Recommended for Production)**

**1. Install Supervisor:**
```bash
sudo apt-get install supervisor
```

**2. Create Supervisor Config:**
```bash
sudo nano /etc/supervisor/conf.d/leadnex-worker.conf
```

**3. Paste Configuration:**
```ini
[program:leadnex-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log
stopwaitsecs=3600
```

**4. Update Supervisor:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start leadnex-worker:*
```

**5. Check Status:**
```bash
sudo supervisorctl status
```

**6. Restart Worker (when deploying updates):**
```bash
sudo supervisorctl restart leadnex-worker:*
```

### **OPTION B: Cron Job (Alternative)**

**1. Open Crontab:**
```bash
crontab -e
```

**2. Add This Line:**
```cron
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

**3. Add Queue Worker to Laravel Scheduler** (dalam `app/Console/Kernel.php`):
```php
protected function schedule(Schedule $schedule)
{
    // Existing schedules...

    // Process queue every minute
    $schedule->command('queue:work database --stop-when-empty --max-time=60')
             ->everyMinute()
             ->withoutOverlapping();
}
```

---

## 7️⃣ BUILD FRONTEND ASSETS

### **A. Install Node Dependencies**
```bash
npm install
```

### **B. Build for Production**
```bash
npm run build
```

**Expected Output:**
```
✓ built in XXXms
✓ vite v5.x.x building for production...
✓ XXX modules transformed.
✓ built in X.XXs
```

---

## 8️⃣ VERIFY INSTALLATION

### **A. Check Routes:**
```bash
php artisan route:list | grep meetings
php artisan route:list | grep certificate-queue
```

**Expected Output (Meeting Routes):**
```
POST    admin/courses/{course}/meetings/{meeting}/send-alert
GET     admin/courses/{course}/meetings/{meeting}/enrolled-students
GET     admin/courses/{course}/meetings
POST    admin/courses/{course}/meetings
... (total 9 routes)
```

### **B. Check Database:**
```bash
php artisan tinker
```

```php
// Test models
App\Models\Meeting::count();
App\Models\MeetingAttendance::count();
App\Models\CertificateQueue::count();

// Check tables exist
Schema::hasTable('meetings'); // should return true
Schema::hasTable('meeting_attendances'); // should return true
Schema::hasTable('certificate_queue'); // should return true

// Exit tinker
exit
```

### **C. Test Email Configuration:**
```bash
php artisan tinker
```

```php
// Send test email
use Illuminate\Support\Facades\Mail;

Mail::raw('Test email from LeadNEX LMS', function($message) {
    $message->to('your-test-email@example.com')
            ->subject('Test Email Configuration');
});

// Check if queued
DB::table('jobs')->count(); // should return 1 if email queued

exit
```

### **D. Process Queue Manually (for testing):**
```bash
php artisan queue:work database --once
```

---

## 9️⃣ FIRST TIME SETUP (ONE TIME ONLY)

### **A. Create Admin User** (jika belum ada)
```bash
php artisan tinker
```

```php
$admin = new App\Models\User();
$admin->name = 'Admin';
$admin->email = 'admin@leadnex.com';
$admin->password = Hash::make('password123');
$admin->email_verified_at = now();
$admin->save();

// Assign admin role (adjust based on your role system)
// $admin->assignRole('admin');

exit
```

---

## 🔟 RESTART SERVICES

### **A. Restart PHP-FPM:**
```bash
sudo systemctl restart php8.2-fpm
```

### **B. Restart Nginx:**
```bash
sudo systemctl restart nginx
```

### **C. Restart Supervisor (if using):**
```bash
sudo supervisorctl restart all
```

---

## 📊 VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Website accessible via browser
- [ ] Login works
- [ ] Admin can access `/admin/courses/{course}/meetings`
- [ ] Create meeting works
- [ ] Send alert button visible
- [ ] Email sent successfully
- [ ] Queue worker running (check `sudo supervisorctl status`)
- [ ] No errors in `storage/logs/laravel.log`

---

## 🐛 TROUBLESHOOTING

### **Issue: Migrations Already Run**

```bash
# Check migration status
php artisan migrate:status

# If need to rollback specific migration
php artisan migrate:rollback --step=1

# If need fresh install (⚠️ DELETES ALL DATA!)
# php artisan migrate:fresh
```

### **Issue: Queue Not Processing**

```bash
# Check queue worker status
sudo supervisorctl status

# Restart queue worker
sudo supervisorctl restart leadnex-worker:*

# Check logs
tail -f storage/logs/worker.log
tail -f storage/logs/laravel.log
```

### **Issue: Email Not Sending**

```bash
# Test email config
php artisan tinker
>>> config('mail.mailers.smtp')

# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

### **Issue: Permission Denied**

```bash
# Fix permissions
sudo chown -R www-data:www-data storage
sudo chown -R www-data:www-data bootstrap/cache
sudo chmod -R 775 storage
sudo chmod -R 775 bootstrap/cache
```

### **Issue: 500 Error**

```bash
# Check logs
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Regenerate cached files
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 🔄 UPDATING / REDEPLOYING

When you update code and redeploy:

```bash
# 1. Pull latest code
git pull origin main

# 2. Update dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# 3. Run migrations (if any new)
php artisan migrate --force

# 4. Clear and recache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

# 6. Restart queue worker
sudo supervisorctl restart leadnex-worker:*
```

---

## 📝 NOTES

### **Email Queue Processing:**
- Emails are queued in `jobs` table
- Queue worker processes them automatically
- If queue worker not running, emails won't be sent
- Check worker status: `sudo supervisorctl status`

### **Meeting Alert Flow:**
1. Admin creates meeting
2. Admin clicks "Send Alert"
3. Email added to queue
4. Worker processes queue
5. Email sent to all enrolled students
6. Database updated with tracking info

### **Storage Structure:**
```
storage/app/public/
├── meeting-attendance-proofs/  (screenshots)
├── certificates/               (certificate files)
└── ...
```

### **Important Files:**
- `.env` - Configuration
- `config/mail.php` - Email config
- `config/queue.php` - Queue config
- `storage/logs/laravel.log` - Application logs
- `storage/logs/worker.log` - Queue worker logs

---

## ✅ QUICK COMMANDS REFERENCE

```bash
# Cache clear & rebuild
php artisan optimize:clear
php artisan optimize

# Check queue
php artisan queue:work database --once  # Process one job
php artisan queue:listen               # Listen continuously
php artisan queue:failed               # Show failed jobs
php artisan queue:retry all            # Retry failed jobs

# Check logs
tail -f storage/logs/laravel.log
tail -f storage/logs/worker.log

# Supervisor
sudo supervisorctl status
sudo supervisorctl restart all
sudo supervisorctl stop all
sudo supervisorctl start all
```

---

**Last Updated:** 2025-11-09
**Version:** 1.1.0
**For:** LeadNEX LMS - Meeting System with Email Alert

---

## 🎯 SUMMARY

**Total Steps:** 10 major steps
**Estimated Time:** 30-45 minutes
**Required Access:** SSH, sudo privileges
**Required Tools:** Composer, NPM, Supervisor

**Critical Steps:**
1. ✅ Update .env with correct credentials
2. ✅ Run migrations
3. ✅ Setup queue worker (Supervisor)
4. ✅ Build frontend assets
5. ✅ Test email sending

**Setelah semua selesai, sistem Meeting + Email Alert akan berfungsi 100%!** 🚀
