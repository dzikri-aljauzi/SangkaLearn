# Implementasi Chunked Upload dengan Resume & Progress Bar

## Ringkasan
Sistem chunked upload telah berhasil diimplementasikan untuk upload video di modul admin course. Sistem ini memungkinkan upload file video berukuran besar dengan fitur:
- **Resume Upload**: Upload dapat dilanjutkan jika koneksi terputus
- **Progress Bar**: Tampilan real-time progress upload
- **Upload Speed**: Menampilkan kecepatan upload
- **Estimated Time**: Estimasi waktu selesai upload
- **Pause/Resume**: Kemampuan untuk pause dan resume upload
- **Retry Logic**: Otomatis retry jika chunk gagal diupload

## File yang Ditambahkan

### 1. Backend Controller
**File**: `app/Http/Controllers/Admin/ChunkedUploadController.php`

**Deskripsi**: Controller untuk menangani chunked upload dengan metode:
- `start()`: Memulai sesi upload dan generate upload ID
- `uploadChunk()`: Upload chunk individual (5MB per chunk)
- `status()`: Cek status upload dan chunks yang missing
- `complete()`: Merge semua chunks menjadi file lengkap
- `cancel()`: Batalkan upload dan hapus chunks

**Fitur Utama**:
- Menyimpan metadata upload di `storage/app/uploads/chunks/{upload_id}/metadata.json`
- Menyimpan chunks sementara di `storage/app/uploads/chunks/{upload_id}/chunks/`
- Otomatis merge chunks setelah semua terupload
- Cleanup otomatis setelah merge selesai
- Support resume dengan tracking chunks yang sudah diupload

### 2. Frontend Component
**File**: `resources/js/Components/ChunkedUploader.jsx`

**Deskripsi**: React component untuk UI upload dengan fitur lengkap

**Props**:
- `accept`: File types yang diterima (default: "video/*")
- `maxSize`: Ukuran maksimal file (default: 5GB)
- `chunkSize`: Ukuran per chunk (default: 5MB)
- `storagePath`: Path penyimpanan di storage (default: "lessons/videos")
- `existingFile`: Data file yang sudah ada (untuk edit)
- `onUploadComplete`: Callback saat upload selesai
- `onUploadError`: Callback saat terjadi error
- `onRemove`: Callback untuk hapus file existing

**Fitur UI**:
- Drag & drop file upload
- Progress bar dengan animasi
- Real-time upload speed (KB/s, MB/s)
- Estimated time remaining
- Tombol Start, Pause, Resume, Cancel
- Status indikator (idle, uploading, paused, completed, error)
- Display file size dan uploaded size
- Retry otomatis hingga 3x jika chunk gagal

## File yang Dimodifikasi

### 1. Routes
**File**: `routes/web.php`

**Perubahan**: Menambahkan routes untuk chunked upload:
```php
// Chunked Upload Routes
Route::post('/chunked-upload/start', [ChunkedUploadController::class, 'start'])->name('chunked-upload.start');
Route::post('/chunked-upload/chunk', [ChunkedUploadController::class, 'uploadChunk'])->name('chunked-upload.chunk');
Route::get('/chunked-upload/status', [ChunkedUploadController::class, 'status'])->name('chunked-upload.status');
Route::post('/chunked-upload/complete', [ChunkedUploadController::class, 'complete'])->name('chunked-upload.complete');
Route::post('/chunked-upload/cancel', [ChunkedUploadController::class, 'cancel'])->name('chunked-upload.cancel');
```

**Lokasi**: Setelah `Route::get('/courses/{course}/content')`

### 2. Course Content Page
**File**: `resources/js/Pages/Admin/Courses/Content/Index.jsx`

**Perubahan**:
1. **Import ChunkedUploader Component** (Line 7):
   ```javascript
   import ChunkedUploader from '../../../../Components/ChunkedUploader';
   ```

2. **Replace Video Upload Input - Add Lesson Form** (Line 1075-1097):
   - Mengganti input file sederhana dengan `<ChunkedUploader />` component
   - Menambahkan callback untuk simpan path video setelah upload selesai

3. **Replace Video Upload Input - Edit Lesson Form** (Line 1961-2001):
   - Mengganti input file sederhana dengan `<ChunkedUploader />` component
   - Menambahkan support untuk existing file
   - Menambahkan callback untuk remove file

4. **Update Form Submission - Add Lesson** (Line 155-175):
   - Menambahkan handling untuk `video_file_path` dari chunked upload
   - Backward compatible dengan direct upload

5. **Update Form Submission - Edit Lesson** (Line 1783-1808):
   - Menambahkan handling untuk `video_file_path` dari chunked upload
   - Backward compatible dengan direct upload

### 3. Course Content Controller
**File**: `app/Http/Controllers/Admin/CourseContentController.php`

**Perubahan**:

1. **Method `storeLesson()` - Line 165-201**:
   ```php
   // Handle video file upload (both chunked and direct)
   if ($validated['type'] === 'video') {
       // Check if video was uploaded via chunked upload
       if ($request->has('video_file_path')) {
           $validated['video_file'] = $request->input('video_file_path');
           $validated['video_size'] = $request->input('video_size');
           $validated['video_mime_type'] = $request->input('video_mime_type');
           // ... get video duration
       }
       // Handle direct file upload (fallback)
       else if ($request->hasFile('video_file')) {
           // ... existing direct upload logic
       }
   }
   ```

2. **Method `updateLesson()` - Line 331-377**:
   - Update yang sama seperti `storeLesson()`
   - Menambahkan delete old video file sebelum save yang baru

**Backward Compatibility**: Kedua metode tetap support direct upload (video_file) untuk backward compatibility.

## Cara Kerja Sistem

### Flow Upload:

1. **User Pilih File**:
   - User memilih file video melalui ChunkedUploader component
   - Validasi ukuran file (max 5GB)

2. **Start Upload Session**:
   - POST ke `/admin/chunked-upload/start`
   - Backend generate upload_id dan buat metadata
   - Return upload_id ke frontend

3. **Upload Chunks**:
   - File dibagi menjadi chunks 5MB
   - Setiap chunk diupload ke `/admin/chunked-upload/chunk`
   - Backend simpan chunk dan update metadata
   - Frontend update progress bar real-time
   - Jika gagal, retry otomatis hingga 3x

4. **Complete Upload**:
   - Setelah semua chunks terupload
   - POST ke `/admin/chunked-upload/complete`
   - Backend merge semua chunks menjadi satu file
   - Save file ke storage/public/lessons/videos
   - Cleanup chunks temporary
   - Return file path, size, dan mime type

5. **Save to Database**:
   - Frontend menerima file data dari callback
   - Update form data dengan video_file_path
   - Submit form ke `/admin/courses/{course}/sections/{section}/lessons`
   - Backend save lesson dengan video file path

### Flow Resume (Jika Koneksi Terputus):

1. Upload terputus di tengah jalan
2. User klik tombol "Resume"
3. GET `/admin/chunked-upload/status?upload_id={id}`
4. Backend return list chunks yang sudah dan belum terupload
5. Frontend lanjutkan upload dari chunk yang missing
6. Progress bar update sesuai chunks yang sudah ada

## Keamanan

1. **Upload Validation**:
   - Max file size: 5GB
   - Allowed types: video/* (.mp4, .avi, .mov, .wmv, .flv, .webm, .mkv)
   - Max chunk size: 5MB per request

2. **Storage**:
   - Chunks temporary disimpan di `storage/app/uploads/chunks` (private)
   - File final disimpan di `storage/app/public/lessons/videos` (public)
   - Automatic cleanup setelah merge

3. **Authentication**:
   - Semua routes protected dengan middleware auth dan admin
   - Upload ID unik per session (UUID)

## Testing

### Test Upload Normal:
1. Login sebagai admin
2. Buka Course Management > pilih course > Content
3. Klik "Add Lesson" dan pilih type "Video"
4. Pilih "Upload Video File" sebagai provider
5. Pilih file video (coba ukuran besar > 100MB)
6. Klik "Start Upload"
7. Observe:
   - Progress bar bergerak
   - Upload speed ditampilkan
   - Estimated time ditampilkan
   - Upload selesai dengan success message

### Test Resume:
1. Mulai upload file besar (> 500MB)
2. Saat progress 30-50%, pause upload atau close browser
3. Buka kembali halaman yang sama
4. Component akan detect upload session yang ada
5. Klik "Resume"
6. Upload akan lanjut dari chunk terakhir yang berhasil

### Test Koneksi Terputus:
1. Mulai upload file besar
2. Disconnect network saat upload berjalan (atau throttle ke offline)
3. Observe: Component akan show error setelah retry gagal
4. Reconnect network
5. Klik "Resume"
6. Upload akan lanjut dari chunk terakhir

## Performa

### Upload Speed:
- Bergantung pada:
  - Kecepatan internet
  - Ukuran chunk (default 5MB optimal untuk most connections)
  - Server processing speed

### Penggunaan Memory:
- Server: ~10-20MB per concurrent upload (hanya process 1 chunk at a time)
- Browser: ~10-50MB (buffering chunks before send)

### Storage:
- Temporary storage: Max 2x file size (chunks + merged file)
- Automatic cleanup setelah success atau cancel

## Troubleshooting

### Upload Stuck at 0%:
1. Check browser console untuk errors
2. Check server logs: `storage/logs/laravel.log`
3. Verify routes accessible: Test `/admin/chunked-upload/start`

### Upload Speed Very Slow:
1. Check server bandwidth
2. Try reduce chunk size (edit ChunkedUploader.jsx `chunkSize` prop)
3. Check server resources (CPU, RAM)

### Chunks Not Merging:
1. Check storage permissions: `storage/app/uploads/chunks`
2. Check disk space available
3. Check server logs for merge errors

### Resume Not Working:
1. Check if upload_id still exists in storage
2. Check metadata.json in `storage/app/uploads/chunks/{upload_id}/`
3. May need to restart upload if too much time passed

## Improvements Future

Potential improvements untuk future development:

1. **Multiple File Upload**: Support upload multiple videos sekaligus
2. **Upload Queue**: Queue system untuk batch uploads
3. **Background Upload**: Upload tetap jalan walaupun user navigate ke page lain
4. **S3 Support**: Direct upload ke AWS S3 atau cloud storage
5. **Compression**: Auto-compress video before upload
6. **Thumbnail Generation**: Auto-generate thumbnail dari video
7. **Streaming**: Support streaming untuk preview video saat upload
8. **Analytics**: Track upload statistics dan bandwidth usage

## Maintenance

### Cleanup Old Chunks:
Jika ada chunks yang tertinggal (failed uploads tidak di-cancel):

```bash
# Manual cleanup via command
php artisan tinker
Storage::disk('local')->deleteDirectory('uploads/chunks');
```

Atau buat scheduled job:
```php
// app/Console/Kernel.php
$schedule->command('chunked-upload:cleanup')->daily();
```

### Monitor Storage:
Check storage usage regular untuk pastikan tidak ada chunks yang menumpuk.

## Support

Untuk pertanyaan atau issues terkait chunked upload:
1. Check logs: `storage/logs/laravel.log`
2. Enable debug mode untuk detailed errors
3. Test dengan file kecil dulu sebelum test dengan file besar
4. Verify server requirements: PHP 8.x, sufficient disk space, proper permissions

---

**Implementasi Date**: 2025-10-24
**Developer**: Claude Code
**Version**: 1.0.0
