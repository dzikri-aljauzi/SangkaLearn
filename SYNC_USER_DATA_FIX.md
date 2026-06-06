# Fix Sinkronisasi Data Pengguna di Admin Panel

## Masalah
Data pengguna seperti `rudi.hermawan@student.com` ada di database dan bisa login serta akses course, tetapi tidak muncul di halaman admin panel (Students/Instructors page).

## Penyebab
PostgreSQL tidak mendukung `DISTINCT` pada query yang menyertakan kolom JSON (`accessible_courses`), menyebabkan error:
```
SQLSTATE[42883]: Undefined function: 7 ERROR: could not identify an equality operator for type json
```

## Solusi
Mengubah strategi query dari `SELECT DISTINCT users.*` menjadi dua tahap:
1. Ambil distinct user IDs terlebih dahulu
2. Query full user data dengan WHERE IN (ids)

## File yang Diedit/Ditambahkan

### 1. **app/Http/Controllers/Admin/UserManagementController.php**
   - **Method `students()` (Line 298-315)**
     - Changed: Query untuk students sekarang ambil IDs dulu, lalu ambil full data
     - Before: `select('users.*')->distinct()` (error di PostgreSQL dengan JSON)
     - After: `select('users.id')->distinct()` kemudian `whereIn('id', $userIds)`

   - **Method `instructors()` (Line 80-96)**
     - Changed: Query untuk instructors dengan strategi yang sama
     - Before: `select('users.*')->distinct()`
     - After: `select('users.id')->distinct()` kemudian `whereIn('id', $userIds)`

### 2. **app/Console/Commands/SyncUserRoles.php** (NEW FILE)
   - Purpose: Command untuk sinkronisasi dan validasi role assignments
   - Usage:
     ```bash
     php artisan users:sync-roles
     php artisan users:sync-roles --fix-missing
     ```
   - Features:
     - List users tanpa roles
     - Auto-assign roles berdasarkan email pattern
     - Statistics lengkap tentang user roles
     - Safe mode (default) hanya report, tidak ubah data

### 3. **app/Console/Commands/VerifyUserData.php** (NEW FILE)
   - Purpose: Command untuk verify data consistency dan debugging
   - Usage:
     ```bash
     php artisan users:verify
     php artisan users:verify --email=rudi.hermawan@student.com
     ```
   - Features:
     - Verify specific user atau all users
     - Check apakah user muncul di admin query
     - Display user details, roles, enrollments
     - Menggunakan query yang sama dengan admin panel

## Testing

### 1. Verify All Users
```bash
php artisan users:verify
```
Output akan menampilkan:
- Total users: 20
- Students: 11
- Instructors: 4
- Admins: 2
- List lengkap semua students

### 2. Verify Specific User
```bash
php artisan users:verify --email=rudi.hermawan@student.com
```
Output akan menampilkan:
- User information lengkap
- Role assignments
- Admin query check (✓ Found di student query)
- Enrollment count

### 3. Sync User Roles (jika diperlukan)
```bash
php artisan users:sync-roles --fix-missing
```

### 4. Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Hasil
- ✅ Semua 11 students sekarang muncul di admin panel
- ✅ Query kompatibel dengan PostgreSQL JSON columns
- ✅ No duplicate records
- ✅ Data rudi.hermawan@student.com sekarang visible
- ✅ Performance tetap optimal dengan bulk queries

## Command Reference

### Users Verification
```bash
# Check all users dan list students
php artisan users:verify

# Check specific user
php artisan users:verify --email=user@example.com
```

### Role Synchronization
```bash
# Check users without roles (dry run)
php artisan users:sync-roles

# Fix users without roles
php artisan users:sync-roles --fix-missing
```

### Cache Management
```bash
# Clear all caches
php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear
```

## Notes
- Query menggunakan dua tahap untuk menghindari PostgreSQL JSON DISTINCT error
- Semua data user tetap intact, tidak ada data yang hilang
- Command verification dapat digunakan kapan saja untuk debugging
- Performance tetap optimal karena tetap menggunakan bulk queries untuk stats
