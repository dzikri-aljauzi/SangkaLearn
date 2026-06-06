# Fix Meeting Screenshot Upload Error

## Masalah yang Terjadi

### Error 1: Type Error
Error terjadi saat upload bukti screenshot di halaman Kelola Absen (Kelola Meetings Admin):
```
App\Http\Controllers\Admin\MeetingScreenshotController::upload(): Argument #2 ($meeting) must be of type App\Models\Meeting, string given
```

### Error 2: PostgreSQL Invalid Input (Setelah Fix 1)
```
SQLSTATE[22P02]: Invalid text representation: 7 ERROR: invalid input syntax for type bigint: "sertifikat-lsp-bnsp-manajemen-risiko-bsmr"
CONTEXT: unnamed portal parameter $1 = '...'
(Connection: pgsql, SQL: select * from "meetings" where "meetings"."id" = sertifikat-lsp-bnsp-manajemen-risiko-bsmr and "meetings"."deleted_at" is null limit 1)
```

## Penyebab Root Cause
1. **Error 1**: Laravel tidak dapat melakukan automatic route model binding karena parameter bertipe `Meeting` model di controller
2. **Error 2**: Controller **tidak menerima parameter `$course`** padahal route structure adalah `courses/{course:slug}/meetings/{meeting}/screenshots/upload`
   - Parameter pertama yang diterima controller adalah **course slug** ("sertifikat-lsp-bnsp-manajemen-risiko-bsmr")
   - Parameter tersebut salah digunakan sebagai **meeting ID** sehingga PostgreSQL error karena mencoba convert string slug ke bigint
   - Controller **harus menerima 2 parameter**: `$course` dan `$meeting`

## Solusi
1. Menambahkan parameter `$course` di controller untuk mencocokkan route structure
2. Mengubah tipe parameter dari `Meeting $meeting` menjadi `$meeting`
3. Melakukan manual model resolution menggunakan `Meeting::findOrFail($meeting)`

## File yang Diubah

### 1. `app/Http/Controllers/Admin/MeetingScreenshotController.php`

#### Method `upload()` - Line 17-71
**Perubahan:**
- Mengubah signature dari `public function upload(Request $request, Meeting $meeting)` menjadi `public function upload(Request $request, $course, $meeting)`
- Menambahkan parameter `$course` untuk menerima course slug dari route
- Menambahkan manual model resolution: `$meeting = Meeting::findOrFail($meeting);`
- Menambahkan comment untuk clarity

**Sebelum:**
```php
public function upload(Request $request, Meeting $meeting)
{
    $request->validate([
        'screenshots' => 'required|array|min:1|max:10',
        // ...
    ]);
```

**Sesudah:**
```php
public function upload(Request $request, $course, $meeting)
{
    // $course is the course slug from route, $meeting is the meeting ID
    // Find the meeting manually
    $meeting = Meeting::findOrFail($meeting);

    $request->validate([
        'screenshots' => 'required|array|min:1|max:10',
        // ...
    ]);
```

#### Method `reorder()` - Line 97-121
**Perubahan:**
- Mengubah signature dari `public function reorder(Request $request, Meeting $meeting)` menjadi `public function reorder(Request $request, $course, $meeting)`
- Menambahkan parameter `$course` untuk menerima course slug dari route
- Menambahkan manual model resolution: `$meeting = Meeting::findOrFail($meeting);`
- Menambahkan comment untuk clarity

**Sebelum:**
```php
public function reorder(Request $request, Meeting $meeting)
{
    $request->validate([
        'screenshots' => 'required|array',
        // ...
    ]);
```

**Sesudah:**
```php
public function reorder(Request $request, $course, $meeting)
{
    // $course is the course slug from route, $meeting is the meeting ID
    // Find the meeting manually
    $meeting = Meeting::findOrFail($meeting);

    $request->validate([
        'screenshots' => 'required|array',
        // ...
    ]);
```

## Penjelasan Teknis

### Route Structure
Route yang digunakan berada dalam nested group:
```php
Route::prefix('courses/{course:slug}/meetings')->name('meetings.')->group(function () {
    // ...
    Route::post('/{meeting}/screenshots/upload', [MeetingScreenshotController::class, 'upload'])
        ->name('screenshots.upload');
    Route::post('/{meeting}/screenshots/reorder', [MeetingScreenshotController::class, 'reorder'])
        ->name('screenshots.reorder');
});
```

Full route path: `admin/courses/{course:slug}/meetings/{meeting}/screenshots/upload`

### Mengapa Perlu 2 Parameter?
Karena route memiliki **2 dynamic segments**:
1. `{course:slug}` - Course slug (contoh: "sertifikat-lsp-bnsp-manajemen-risiko-bsmr")
2. `{meeting}` - Meeting ID (contoh: 123)

Laravel mengirimkan **semua parameter dari route** ke controller method **sesuai urutan**. Jika controller hanya menerima 1 parameter, maka parameter pertama (`$course` slug) akan diterima, bukan `$meeting` ID.

### Mengapa Manual Resolution Diperlukan?
Dalam konteks route group nested dengan multiple parameters, Laravel kadang tidak dapat melakukan automatic model binding dengan benar. Manual resolution memastikan:

1. Parameter `$course` diterima sebagai string (course slug) - **tidak digunakan tapi harus ada**
2. Parameter `$meeting` diterima sebagai string (meeting ID)
3. Kita melakukan query manual untuk mendapatkan model Meeting: `Meeting::findOrFail($meeting)`
4. `findOrFail()` akan melempar 404 error jika meeting tidak ditemukan
5. Setelah itu, variabel `$meeting` menjadi instance dari model Meeting yang dapat digunakan seperti biasa

### Keuntungan Solusi Ini
- ✅ Mengatasi type error yang terjadi
- ✅ Mengatasi PostgreSQL invalid input error
- ✅ Parameter sequence sesuai dengan route structure
- ✅ Tetap memberikan error 404 jika meeting tidak ditemukan
- ✅ Tidak mengubah logika bisnis yang sudah ada
- ✅ Tidak perlu mengubah route definition
- ✅ Kompatibel dengan controller lain yang sudah menggunakan manual resolution

## Testing
Setelah perbaikan, silakan test:
1. Buka halaman Kelola Meetings Admin
2. Pilih salah satu meeting
3. Klik button untuk upload screenshot/bukti kehadiran
4. Upload file screenshot (JPG/PNG, max 5MB)
5. Verifikasi screenshot berhasil diupload tanpa error

## Ringkasan Perubahan
| File | Method | Perubahan | Alasan |
|------|--------|-----------|---------|
| `MeetingScreenshotController.php` | `upload()` | Tambah parameter `$course` + manual resolution | Mencocokkan 2 parameters dari route |
| `MeetingScreenshotController.php` | `reorder()` | Tambah parameter `$course` + manual resolution | Mencocokkan 2 parameters dari route |

## Catatan
- Method `delete()` dan `updateNotes()` tidak perlu diubah karena:
  - `delete()` menggunakan route `/screenshots/{screenshot}` (hanya 1 parameter tambahan)
  - `updateNotes()` menggunakan route `/screenshots/{screenshot}/notes` (hanya 1 parameter tambahan)
  - Keduanya menggunakan automatic model binding `MeetingScreenshot $screenshot` yang berfungsi dengan baik
- Total **2 method** yang diubah dalam **1 file** controller
- Perubahan ini juga applicable untuk controller lain yang menggunakan nested route dengan multiple parameters

## Date
26 November 2025
