# 🎓 Certificate System with Meeting Screenshots - IMPLEMENTATION PROGRESS

**Tanggal:** 2025-11-25
**Status:** 🔄 IN PROGRESS

---

## 📋 Ringkasan Sistem

### **Flow Lengkap:**
1. **User menyelesaikan course 100%** (lessons + quizzes + assignments)
2. **Otomatis masuk `certificate_queue`** dengan status `pending`
3. **Admin upload screenshots meeting** di "Kelola Meeting → Kelola Absen"
4. **Admin buka Certificate Queue** → Klik "Upload Sertifikat"
5. **Modal muncul dengan info lengkap:**
   - Detail course
   - Progress completion (100%)
   - Meeting attendance history + screenshots
6. **Admin pilih mode:**
   - **Auto-Generate PDF** → Preview → Approve/Edit
   - **Upload Manual** → Upload file PDF
7. **User dapat download sertifikat**

---

## ✅ PHASE 1: Database Structure (COMPLETED)

### **Files Modified/Created:**

#### 1. ✅ Migration: `2025_11_25_094037_create_meeting_screenshots_table.php`
**Path:** `database/migrations/`

**Structure:**
```php
- id
- meeting_id (FK to meetings, cascade delete)
- screenshot_path (string)
- uploaded_by (FK to users, cascade delete)
- notes (text, nullable)
- order (integer, default 0)
- timestamps
- indexes: meeting_id, uploaded_by
```

**Purpose:** Menyimpan multiple screenshots per meeting

#### 2. ✅ Migration: `2025_11_25_095154_add_certificate_generation_fields_to_certificate_queue_table.php`
**Path:** `database/migrations/`

**Columns Added:**
```php
- certificate_mode (enum: 'auto', 'manual', default 'auto')
- auto_generated_certificate_path (string, nullable)
- uploaded_certificate_path (string, nullable)
```

**Purpose:** Support dual mode (auto-generate vs manual upload)

#### 3. ✅ Model: `app/Models/MeetingScreenshot.php`
**Path:** `app/Models/`

**Fillable:**
- meeting_id
- screenshot_path
- uploaded_by
- notes
- order

**Relations:**
- `meeting()` → BelongsTo Meeting
- `uploader()` → BelongsTo User (uploaded_by)

**Accessor:**
- `getScreenshotUrlAttribute()` → Return full URL

#### 4. ✅ Model Updated: `app/Models/Meeting.php`
**Path:** `app/Models/`

**Added Relation:**
```php
public function screenshots(): HasMany
{
    return $this->hasMany(MeetingScreenshot::class)->orderBy('order');
}
```

### **Migration Status:**
✅ **Berhasil dijalankan** (2 migrations executed successfully)

---

## 🔄 PHASE 2: Screenshot Upload Feature (IN PROGRESS)

### **Yang Perlu Dikerjakan:**

#### 1. ⏳ Controller: `MeetingScreenshotController`
**Path:** `app/Http/Controllers/Admin/`

**Methods:**
- `upload(Request $request, Meeting $meeting)` - Upload multiple screenshots
- `delete(MeetingScreenshot $screenshot)` - Delete screenshot
- `reorder(Request $request, Meeting $meeting)` - Reorder screenshots

#### 2. ⏳ Routes
**Path:** `routes/web.php`

```php
// Meeting Screenshots
Route::post('/admin/meetings/{meeting}/screenshots', [MeetingScreenshotController::class, 'upload'])->name('admin.meetings.screenshots.upload');
Route::delete('/admin/meetings/screenshots/{screenshot}', [MeetingScreenshotController::class, 'delete'])->name('admin.meetings.screenshots.delete');
Route::post('/admin/meetings/{meeting}/screenshots/reorder', [MeetingScreenshotController::class, 'reorder'])->name('admin.meetings.screenshots.reorder');
```

#### 3. ⏳ Frontend: Upload UI di Meeting Detail
**Path:** `resources/js/Pages/Admin/Meetings/Show.jsx` (atau sejenisnya)

**Components Needed:**
- Dropzone untuk multiple upload
- Gallery thumbnails dengan preview
- Delete button per screenshot
- Reorder drag-and-drop (optional untuk v1)

---

## ⏳ PHASE 3: Auto Certificate Queue (PENDING)

### **Yang Perlu Dikerjakan:**

#### 1. Service: `ProgressTrackingService` (Update existing)
**Path:** `app/Services/ProgressTrackingService.php`

**Add Method:**
```php
public function checkAndAddToCertificateQueue(User $user, Course $course): void
{
    // Check if user reached 100%
    $progress = $this->getUserProgress($user, $course);

    if ($progress['overall_completion'] >= 100) {
        // Check if not already in queue
        if (!CertificateQueue::where('user_id', $user->id)
                             ->where('course_id', $course->id)
                             ->exists()) {

            // Get enrollment
            $enrollment = Enrollment::where('user_id', $user->id)
                                   ->where('course_id', $course->id)
                                   ->first();

            // Count meeting attendance
            $meetings = Meeting::where('course_id', $course->id)->get();
            $attendedCount = 0;

            foreach ($meetings as $meeting) {
                if ($meeting->isAttendedBy($user)) {
                    $attendedCount++;
                }
            }

            // Add to queue
            CertificateQueue::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'enrollment_id' => $enrollment->id,
                'status' => 'pending',
                'completed_at' => now(),
                'all_meetings_attended' => $attendedCount === $meetings->count(),
                'meetings_attended_count' => $attendedCount,
                'total_meetings_count' => $meetings->count(),
            ]);

            // Send notification to admin
            // ...
        }
    }
}
```

#### 2. Trigger Points
Call `checkAndAddToCertificateQueue()` at:
- After completing lesson
- After submitting quiz
- After submitting assignment

---

## ⏳ PHASE 4: Certificate Upload Modal (PENDING)

### **Yang Perlu Dikerjakan:**

#### 1. Controller: `CertificateQueueController` (Update existing)
**Path:** `app/Http/Controllers/Admin/CertificateQueueController.php`

**Methods:**
- `show(CertificateQueue $queue)` - Get detail for modal
- `generatePdf(CertificateQueue $queue)` - Auto-generate PDF
- `uploadManual(Request $request, CertificateQueue $queue)` - Upload manual PDF
- `approve(CertificateQueue $queue)` - Approve auto-generated

#### 2. Frontend: Modal Component
**Path:** `resources/js/Pages/Admin/CertificateQueue/UploadModal.jsx` (NEW)

**Sections:**
1. **Header** - User name & course title
2. **Course Detail** - Duration, certificate title, etc.
3. **Progress Completion** - 100% dengan breakdown
4. **Meeting Attendance** - List meetings dengan status & screenshots
5. **Certificate Upload**:
   - Toggle: Auto-Generate / Manual Upload
   - If Auto: Show preview & approve button
   - If Manual: File upload dropzone
6. **Action Buttons** - Cancel, Generate/Upload

---

## ⏳ PHASE 5: PDF Generation (PENDING)

### **Yang Perlu Dikerjakan:**

#### 1. Library Installation
```bash
composer require barryvdh/laravel-dompdf
```

#### 2. Service: `CertificateGeneratorService`
**Path:** `app/Services/CertificateGeneratorService.php` (NEW)

**Methods:**
- `generate(User $user, Course $course): string` - Generate PDF
- `getTemplate(): string` - Get HTML template
- `savePdf(string $html, string $filename): string` - Save to storage

#### 3. Certificate Template
**Path:** `resources/views/certificates/template.blade.php` (NEW)

Design template dengan:
- Logo LNA
- User name
- Course title
- Completion date
- Certificate title (from course)
- QR code (untuk verifikasi - optional)

---

## 📊 Current Status

### **Completed:**
- ✅ Phase 1: Database structure (100%)
  - ✅ Migrations created and executed
  - ✅ Models created with relations
  - ✅ Database ready

### **In Progress:**
- 🔄 Phase 2: Screenshot upload (0%)
  - ⏳ Controller not created yet
  - ⏳ Routes not added yet
  - ⏳ Frontend not implemented yet

### **Pending:**
- ⏳ Phase 3: Auto certificate queue (0%)
- ⏳ Phase 4: Upload modal (0%)
- ⏳ Phase 5: PDF generation (0%)
- ⏳ Phase 6: Testing (0%)

---

## 📝 Next Steps

### **Immediate (Phase 2):**
1. Create `MeetingScreenshotController`
2. Add routes for screenshot upload/delete
3. Find existing Meeting detail page
4. Add upload UI (dropzone + gallery)
5. Test upload & delete functionality

### **After Phase 2:**
1. Implement auto-add to certificate queue
2. Build upload modal with meeting info
3. Implement PDF generation
4. Add preview & approval flow
5. Test end-to-end

---

## ⚠️ Important Notes

### **Screenshot Storage:**
- Path: `storage/app/public/meeting-screenshots/`
- Format: `{meeting_id}_{timestamp}_{random}.{ext}`
- Allowed: jpg, jpeg, png
- Max size: 5MB per file

### **Certificate Storage:**
- Auto-generated: `storage/app/public/certificates/auto/`
- Manual uploaded: `storage/app/public/certificates/manual/`
- Format: `cert_{user_id}_{course_id}_{timestamp}.pdf`

### **Certificate Queue Status:**
- `pending` - Waiting for admin to upload certificate
- `approved` - Certificate uploaded and approved (auto-generated)
- `rejected` - Rejected by admin (with reason)

**Note:** Status 'approved' sebenarnya sudah ada di migration asli dengan nama yang berbeda, perlu disesuaikan.

---

## 🔧 Technical Decisions

### **Why separate `meeting_screenshots` table?**
- 1 meeting bisa punya multiple screenshots
- Screenshots tidak tied ke specific attendance record
- Admin bisa upload screenshots sebelum atau sesudah mark attendance
- Easier to manage and display

### **Why dual mode (auto vs manual)?**
- Flexibility untuk admin
- Auto-generate untuk consistency
- Manual upload untuk customized certificates
- Preview before approve untuk quality control

### **Why auto-add to certificate_queue?**
- Reduce admin manual work
- Immediate notification untuk user
- Trackable completion time
- Fair queue system (first complete, first in queue)

---

**Files Modified Summary (Phase 1):**
1. ✅ `database/migrations/2025_11_25_094037_create_meeting_screenshots_table.php`
2. ✅ `database/migrations/2025_11_25_095154_add_certificate_generation_fields_to_certificate_queue_table.php`
3. ✅ `app/Models/MeetingScreenshot.php`
4. ✅ `app/Models/Meeting.php`

**Total Files:** 4 files
**Status:** Phase 1 Complete, Ready for Phase 2

---

**Progress:** 16.67% (1/6 phases completed)
**Estimated Remaining:** 5 phases
**Current Blocker:** None
