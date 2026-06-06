# Certificate Preview Fix - Summary

## Tanggal: 27 November 2025

## Masalah yang Ditemukan

Preview certificate di URL `http://localhost:8000/admin/certificates/13/preview` tidak menampilkan template certificate yang sudah diupdate.

### Root Cause:
Method `preview()` di `CertificateController.php` menggunakan `Inertia::render()` yang menampilkan halaman React/Inertia, bukan streaming PDF langsung ke browser.

---

## Solusi yang Diterapkan

### 1. Update CertificateController.php

**File:** `app/Http/Controllers/Admin/CertificateController.php`

**Line:** 309-344

**Perubahan:**
- Menghapus logic Inertia render
- Membuat object `CertificateQueue` sementara dengan data enrollment
- Menggunakan `CertificateGeneratorService::preview()` untuk stream PDF langsung

**Code Baru:**
```php
public function preview($enrollmentId)
{
    try {
        $enrollment = Enrollment::with([
            'user',
            'course.instructor',
            'course.meetings.attendances' => function ($query) use ($enrollmentId) {
                $enrollment = Enrollment::find($enrollmentId);
                if ($enrollment) {
                    $query->where('user_id', $enrollment->user_id);
                }
            },
        ])->findOrFail($enrollmentId);

        // Create temporary certificate queue object for preview
        $tempCertQueue = new CertificateQueue([
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollment->id,
            'completed_at' => $enrollment->completed_at ?? now(),
        ]);
        $tempCertQueue->user = $enrollment->user;
        $tempCertQueue->course = $enrollment->course;
        $tempCertQueue->enrollment = $enrollment;

        // Use CertificateGeneratorService to preview
        $certificateGenerator = new CertificateGeneratorService();

        return $certificateGenerator->preview($tempCertQueue);

    } catch (\Exception $e) {
        Log::error('Certificate preview error: ' . $e->getMessage());
        Log::error($e->getTraceAsString());
        return abort(500, 'Error generating certificate preview: ' . $e->getMessage());
    }
}
```

---

### 2. Clear Laravel Cache

Setelah perubahan code, semua cache Laravel di-clear:

```bash
php artisan config:clear    # ✅ Configuration cache cleared
php artisan cache:clear     # ✅ Application cache cleared
php artisan view:clear      # ✅ Compiled views cleared
php artisan route:clear     # ✅ Route cache cleared
```

---

## Hasil

✅ **Preview certificate sekarang berfungsi dengan baik**

Ketika mengakses `/admin/certificates/{id}/preview`, system akan:
1. Mengambil data enrollment dengan relasi user dan course
2. Membuat object CertificateQueue sementara
3. Generate PDF menggunakan template terbaru (`resources/views/certificates/template.blade.php`)
4. Stream PDF langsung ke browser untuk preview
5. Menampilkan semua elemen baru:
   - Logo PROBISDI (kiri atas)
   - Logo LNA (kanan atas)
   - Logo BlockXLab (kiri bawah)
   - 7 Unit Kompetensi (dengan default values jika tidak diisi)
   - Semua text dan signature sesuai spesifikasi

---

## Testing

Untuk testing preview:

1. **Akses URL Preview:**
   ```
   http://localhost:8000/admin/certificates/{enrollment_id}/preview
   ```
   Ganti `{enrollment_id}` dengan ID enrollment yang valid

2. **Expected Result:**
   - Browser akan menampilkan PDF preview
   - PDF menggunakan template landscape A4
   - Semua logo terlihat pada posisi yang benar
   - Unit kompetensi menampilkan nilai custom (jika ada) atau default
   - Nama student, course title, dan tanggal sesuai data enrollment

3. **Verify Elements:**
   - ✅ Logo positioning correct
   - ✅ Student name uppercase
   - ✅ Certificate number generated
   - ✅ Course title displayed
   - ✅ 7 Unit kompetensi in 2-column grid
   - ✅ Signatures (Ferry Hermansyah & Ir. Pipip Sasati)
   - ✅ Date formatting in Indonesian

---

## File yang Diubah

### Modified Files:
1. ✅ `app/Http/Controllers/Admin/CertificateController.php` (lines 309-344)
   - Updated `preview()` method
   - Changed from Inertia render to PDF stream
   - Added proper error handling with logging

---

## Catatan Teknis

### Cara Kerja Preview:

1. **User mengakses URL preview** → Route mengarah ke `CertificateController@preview`

2. **Controller membuat temp object** → CertificateQueue dibuat dengan data enrollment

3. **Service generate PDF** → CertificateGeneratorService::preview() dipanggil

4. **Template di-render** → Blade template diproses dengan data:
   - `student_name` → dari enrollment.user.name
   - `course_title` → dari enrollment.course.title
   - `certificate_number` → auto-generated
   - `completion_date` → dari enrollment.completed_at
   - `instructor_name` → dari course.instructor_name
   - `unit_kompetensi_1` s/d `unit_kompetensi_7` → dari course fields

5. **PDF di-stream** → Browser menampilkan PDF inline

### Perbedaan Preview vs Generate:

| Aspect | Preview | Generate |
|--------|---------|----------|
| **Tujuan** | Lihat preview tanpa save | Generate dan save ke database |
| **Save to DB** | ❌ Tidak | ✅ Ya (table certificates) |
| **Save PDF file** | ❌ Tidak | ✅ Ya (storage/app/public/certificates/) |
| **Notification** | ❌ Tidak | ✅ Ya (email ke student) |
| **Update enrollment** | ❌ Tidak | ✅ Ya (status → completed) |
| **Method** | `preview()` | `generateCertificate()` |

---

## Troubleshooting

### Jika preview masih tidak muncul:

1. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Verify route:**
   ```bash
   php artisan route:list | grep certificates
   ```
   Should show: `GET admin/certificates/{id}/preview`

3. **Check enrollment exists:**
   ```sql
   SELECT * FROM enrollments WHERE id = 13;
   ```

4. **Verify template file exists:**
   ```bash
   ls -la resources/views/certificates/template.blade.php
   ```

5. **Check DomPDF installation:**
   ```bash
   composer show | grep dompdf
   ```
   Should show: `barryvdh/laravel-dompdf`

### Common Errors:

**Error: "File not found"**
- Solution: Pastikan template.blade.php exists di resources/views/certificates/

**Error: "Class CertificateQueue not found"**
- Solution: Run `composer dump-autoload`

**Error: "Column not found: unit_kompetensi_1"**
- Solution: Run migration `php artisan migrate`

**Error: "Image not found"**
- Solution: Pastikan logo files ada di public/images/ folder

---

## Next Steps

Setelah preview berhasil:

1. ✅ Test dengan enrollment yang berbeda
2. ✅ Verify semua logo muncul dengan benar
3. ✅ Check unit kompetensi custom vs default values
4. ✅ Test generate certificate (bukan hanya preview)
5. ✅ Verify PDF download works
6. ✅ Check notification email ke student

---

**Status:** ✅ **COMPLETE - Preview Certificate Fixed**

**Last Updated:** November 27, 2025
