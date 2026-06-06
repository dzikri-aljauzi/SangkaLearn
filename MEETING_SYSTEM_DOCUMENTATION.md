# 📋 MEETING & CERTIFICATE QUEUE SYSTEM - DOKUMENTASI LENGKAP

## ✅ STATUS: 100% BACKEND COMPLETE - FRONTEND PENDING

**Tanggal:** 2025-11-09
**Versi:** 1.0.0
**Status:** Backend Ready, Frontend Components Pending

---

## 🎯 OVERVIEW

Sistem Meeting & Certificate Queue adalah fitur baru yang menambahkan:

1. **Meeting Management** - Admin dapat menambahkan Zoom meetings ke course
2. **Manual Attendance Tracking** - Admin manually marks who attended meetings
3. **Certificate Queue System** - Students who complete 100% progress (lessons + quizzes + assignments) enter certificate queue
4. **Certificate Approval Workflow** - Admin reviews meeting attendance before issuing certificates

### **KEY PRINCIPLE:**
- ✅ **Meetings DO NOT count toward progress**
- ✅ **Progress = (Lessons + Quizzes + Assignments) ONLY**
- ✅ **100% Progress → Certificate Queue**
- ✅ **Admin checks meeting attendance → Approve/Reject certificate**

---

## 📊 DATABASE STRUCTURE

### **1. meetings table**

```sql
CREATE TABLE meetings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    section_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    zoom_link VARCHAR(255) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    notes TEXT NULL,
    meeting_id VARCHAR(255) NULL,
    passcode VARCHAR(255) NULL,
    attendance_proof VARCHAR(255) NULL,
    is_published BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE SET NULL,

    INDEX idx_course_id (course_id),
    INDEX idx_section_id (section_id),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_is_published (is_published)
);
```

### **2. meeting_attendances table**

```sql
CREATE TABLE meeting_attendances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    attended BOOLEAN DEFAULT FALSE,
    marked_at DATETIME NULL,
    marked_by BIGINT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,

    UNIQUE KEY unique_meeting_user (meeting_id, user_id),

    INDEX idx_meeting_id (meeting_id),
    INDEX idx_user_id (user_id),
    INDEX idx_attended (attended)
);
```

### **3. certificate_queue table**

```sql
CREATE TABLE certificate_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrollment_id BIGINT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    certificate_file VARCHAR(255) NULL,
    rejection_reason TEXT NULL,
    completed_at DATETIME NOT NULL,
    reviewed_at DATETIME NULL,
    reviewed_by BIGINT NULL,
    all_meetings_attended BOOLEAN DEFAULT FALSE,
    meetings_attended_count INT DEFAULT 0,
    total_meetings_count INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

    UNIQUE KEY unique_user_course (user_id, course_id),

    INDEX idx_status (status),
    INDEX idx_completed_at (completed_at),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id)
);
```

---

## 🏗️ BACKEND FILES CREATED

### **Migrations (3 files)**

1. ✅ `database/migrations/2025_11_09_131615_create_meetings_table.php`
2. ✅ `database/migrations/2025_11_09_131654_create_meeting_attendances_table.php`
3. ✅ `database/migrations/2025_11_09_131712_create_certificate_queue_table.php`

### **Models (3 files)**

1. ✅ `app/Models/Meeting.php`
   - Relations: `course()`, `section()`, `attendances()`, `attendedStudents()`
   - Methods: `isAttendedBy()`, `getAttendanceForUser()`, `getAttendanceStats()`, `hasPassed()`, `isUpcoming()`
   - Accessors: `formatted_schedule`, `attendance_proof_url`

2. ✅ `app/Models/MeetingAttendance.php`
   - Relations: `meeting()`, `user()`, `markedBy()`
   - Methods: `markAsAttended()`, `markAsNotAttended()`

3. ✅ `app/Models/CertificateQueue.php`
   - Relations: `user()`, `course()`, `enrollment()`, `reviewer()`
   - Methods: `approve()`, `reject()`, `isPending()`, `isApproved()`, `isRejected()`
   - Scopes: `pending()`, `approved()`, `rejected()`
   - Accessors: `certificate_file_url`

### **Controllers (2 files)**

1. ✅ `app/Http/Controllers/Admin/MeetingController.php`
   - `index()` - Display all meetings for a course
   - `store()` - Create new meeting
   - `update()` - Update meeting
   - `destroy()` - Delete meeting
   - `uploadAttendanceProof()` - Upload screenshot proof
   - `showAttendance()` - Show attendance page
   - `markAttendance()` - Mark students as attended/not attended

2. ✅ `app/Http/Controllers/Admin/CertificateQueueController.php`
   - `index()` - Display all certificate queue entries
   - `show()` - Show queue entry details with meeting attendance
   - `approve()` - Approve and upload certificate
   - `reject()` - Reject with reason
   - `recalculateAttendance()` - Recalculate meeting stats
   - `getPendingCount()` - Get pending count (for badges)

### **Services Modified (1 file)**

1. ✅ `app/Services/ProgressTrackingService.php`
   - Added: `addToCertificateQueue()` method
   - Added: `updateCertificateQueueMeetingStats()` method
   - Modified: `updateEnrollmentProgress()` to call certificate queue instead of auto-generating certificate
   - When student reaches 100% progress → added to certificate queue

### **Models Modified (1 file)**

1. ✅ `app/Models/Course.php`
   - Added: `meetings()` relation

### **Routes Added**

1. ✅ `routes/web.php`
   - Meeting routes: 7 routes under `admin/courses/{course}/meetings`
   - Certificate queue routes: 6 routes under `admin/certificate-queue`

---

## 🚀 HOW IT WORKS

### **Flow 1: Admin Creates Meeting**

```
1. Admin navigates to: /admin/courses/{course}/meetings
2. Clicks "Add Meeting"
3. Fills in:
   - Title
   - Description
   - Zoom Link
   - Scheduled Date/Time
   - Duration
   - Notes
   - Meeting ID (optional)
   - Passcode (optional)
4. Submits
5. Meeting created
6. Attendance records auto-created for all enrolled students (attended = false)
```

### **Flow 2: Meeting Happens & Admin Marks Attendance**

```
1. Meeting takes place on Zoom
2. Admin takes screenshot of Zoom participants
3. Admin navigates to: /admin/courses/{course}/meetings/{meeting}/attendance
4. Uploads screenshot proof
5. Marks each student as attended or not attended
6. Adds notes if needed
7. Submits
8. Attendance records updated
```

### **Flow 3: Student Completes Course (100% Progress)**

```
1. Student completes all:
   - Lessons ✓
   - Quizzes ✓
   - Assignments ✓
2. Progress reaches 100%
3. ProgressTrackingService automatically:
   - Marks enrollment as 'completed'
   - Calculates meeting attendance stats
   - Creates entry in certificate_queue table
   - Status: 'pending'
4. Admin receives notification (optional, can be added)
```

### **Flow 4: Admin Reviews Certificate Request**

```
1. Admin navigates to: /admin/certificate-queue
2. Sees list of pending certificates
3. Clicks on entry to view details
4. Reviews:
   - Student info
   - Course completion: 100% ✓
   - Meeting attendance:
     * Total meetings: X
     * Attended: Y
     * Screenshot proofs visible
5. Decision:

   OPTION A - APPROVE:
   - Uploads certificate file (PDF/JPG/PNG)
   - Clicks "Approve"
   - Certificate issued to student
   - Status: 'approved'

   OPTION B - REJECT:
   - Enters rejection reason (e.g., "Tidak menghadiri Zoom meeting 1 & 2")
   - Clicks "Reject"
   - Student notified (optional)
   - Status: 'rejected'
```

---

## 📋 ADMIN ROUTES

### **Meeting Management**

| Method | Route | Action |
|--------|-------|--------|
| GET | `/admin/courses/{course}/meetings` | List all meetings |
| POST | `/admin/courses/{course}/meetings` | Create meeting |
| PUT | `/admin/courses/{course}/meetings/{meeting}` | Update meeting |
| DELETE | `/admin/courses/{course}/meetings/{meeting}` | Delete meeting |
| POST | `/admin/courses/{course}/meetings/{meeting}/upload-proof` | Upload attendance proof |
| GET | `/admin/courses/{course}/meetings/{meeting}/attendance` | Show attendance page |
| POST | `/admin/courses/{course}/meetings/{meeting}/mark-attendance` | Mark attendance |

### **Certificate Queue**

| Method | Route | Action |
|--------|-------|--------|
| GET | `/admin/certificate-queue` | List all queue entries |
| GET | `/admin/certificate-queue/{certificate}` | Show entry details |
| POST | `/admin/certificate-queue/{certificate}/approve` | Approve & upload certificate |
| POST | `/admin/certificate-queue/{certificate}/reject` | Reject with reason |
| POST | `/admin/certificate-queue/{certificate}/recalculate-attendance` | Recalculate stats |
| GET | `/admin/certificate-queue/api/pending-count` | Get pending count |

---

## 🎨 FRONTEND COMPONENTS NEEDED

### **Components to Create:**

1. **MeetingForm.jsx** - Form to add/edit meetings
2. **MeetingList.jsx** - Display meetings in course content
3. **MeetingCard.jsx** - Display single meeting with Zoom link
4. **AttendanceMarker.jsx** - Mark attendance interface
5. **CertificateQueueIndex.jsx** - List of certificate requests (Admin page)
6. **CertificateQueueShow.jsx** - Certificate request details (Admin page)
7. **CertificateApprovalForm.jsx** - Approve/reject form

### **Pages to Create/Update:**

1. **Admin/Meetings/Index.jsx** - Meeting management page
2. **Admin/Meetings/Attendance.jsx** - Attendance marking page
3. **Admin/CertificateQueue/Index.jsx** - Certificate queue list
4. **Admin/CertificateQueue/Show.jsx** - Certificate review page
5. **Student/Learn.jsx** - Update to show meetings alongside lessons/quizzes/assignments

---

## 🧪 TESTING CHECKLIST

### **Database:**
- [x] Migrations run successfully
- [x] Tables created with correct structure
- [x] Foreign keys working
- [x] Indexes created

### **Backend:**
- [x] Models created with relations
- [x] Controllers created with CRUD methods
- [x] Routes registered
- [x] ProgressTrackingService updated
- [ ] Test meeting CRUD operations (pending frontend)
- [ ] Test attendance marking (pending frontend)
- [ ] Test certificate queue creation (pending frontend)
- [ ] Test certificate approval/rejection (pending frontend)

### **Frontend:**
- [ ] Create meeting form components
- [ ] Create meeting list display
- [ ] Create attendance marker interface
- [ ] Create certificate queue pages
- [ ] Update student learn page
- [ ] Test complete workflow

---

## 📝 USAGE EXAMPLE

### **Create Meeting via API/Tinker:**

```php
use App\Models\Course;
use App\Models\Meeting;

$course = Course::find(1);

$meeting = Meeting::create([
    'course_id' => $course->id,
    'title' => 'Zoom Session 1 - Introduction',
    'description' => 'Overview of the training program',
    'zoom_link' => 'https://zoom.us/j/1234567890',
    'scheduled_at' => '2025-11-15 10:00:00',
    'duration_minutes' => 90,
    'meeting_id' => '1234567890',
    'passcode' => 'training123',
]);

// Auto-create attendance records for all enrolled students
foreach ($course->enrollments()->where('status', 'active')->get() as $enrollment) {
    \App\Models\MeetingAttendance::create([
        'meeting_id' => $meeting->id,
        'user_id' => $enrollment->user_id,
        'attended' => false,
    ]);
}
```

### **Mark Attendance:**

```php
use App\Models\Meeting;
use App\Models\User;

$meeting = Meeting::find(1);
$admin = User::find(1);
$student = User::find(10);

$attendance = $meeting->attendances()->where('user_id', $student->id)->first();
$attendance->markAsAttended($admin, 'Present throughout session');
```

### **Check Certificate Queue:**

```php
use App\Models\CertificateQueue;

$pending = CertificateQueue::pending()->get();

foreach ($pending as $cert) {
    echo "Student: {$cert->user->name}\n";
    echo "Course: {$cert->course->title}\n";
    echo "Meetings attended: {$cert->meetings_attended_count} / {$cert->total_meetings_count}\n";
    echo "All attended: " . ($cert->all_meetings_attended ? 'YES' : 'NO') . "\n\n";
}
```

---

## 🔧 CONFIGURATION

### **File Upload Settings:**

**Attendance Proof Screenshots:**
- Max size: 5MB
- Allowed: JPG, PNG
- Storage: `storage/app/public/meeting-attendance-proofs/`

**Certificate Files:**
- Max size: 10MB
- Allowed: PDF, JPG, PNG
- Storage: `storage/app/public/certificates/`

### **Auto-Generated Attendance Records:**

When a meeting is created, attendance records are automatically created for:
- All students with `enrollment.status = 'active'`
- Default: `attended = false`

When new students enroll after meeting creation:
- Attendance records are created when they view the meeting

---

## 📊 STATISTICS & REPORTING

### **Meeting Stats:**

```php
$meeting->getAttendanceStats();
// Returns:
// [
//     'total' => 50,
//     'attended' => 45,
//     'not_attended' => 5,
//     'attendance_rate' => 90.00
// ]
```

### **Certificate Queue Stats:**

```php
$totalPending = CertificateQueue::pending()->count();
$totalApproved = CertificateQueue::approved()->count();
$totalRejected = CertificateQueue::rejected()->count();
```

---

## 🚦 STATUS SUMMARY

| Component | Status | Notes |
|-----------|--------|-------|
| **Database** | 🟢 100% | All tables created |
| **Models** | 🟢 100% | All models with relations |
| **Controllers** | 🟢 100% | Full CRUD operations |
| **Routes** | 🟢 100% | All routes registered |
| **Services** | 🟢 100% | ProgressTrackingService updated |
| **Migrations** | 🟢 100% | Migrated successfully |
| **Frontend Components** | 🔴 0% | Pending implementation |
| **Frontend Pages** | 🔴 0% | Pending implementation |
| **Testing** | 🟡 50% | Backend ready, frontend pending |

**Overall Backend:** 🟢 **100% COMPLETE**
**Overall Frontend:** 🔴 **0% - PENDING**

---

## 📚 NEXT STEPS

### **Immediate:**

1. **Create Frontend Components:**
   - MeetingForm component
   - MeetingList component
   - AttendanceMarker component

2. **Create Admin Pages:**
   - Meetings Index page
   - Attendance marking page
   - Certificate Queue pages

3. **Update Student View:**
   - Show meetings in Learn page
   - Display Zoom links to enrolled students

### **Optional (Future Enhancements):**

1. Email notifications when:
   - Student added to certificate queue
   - Certificate approved
   - Certificate rejected

2. Automatic Zoom integration:
   - Fetch attendees from Zoom API
   - Auto-mark attendance

3. Certificate templates:
   - Auto-generate certificates with template
   - Student name, course name, completion date

4. Attendance reports:
   - Export attendance to Excel
   - Meeting attendance analytics

---

## 🆘 TROUBLESHOOTING

### **Issue: Meeting attendance not auto-created**

**Solution:** Check if enrollment status is 'active'. Only active enrollments get attendance records.

```php
// Manually create missing attendance records
$meeting = Meeting::find(1);
foreach ($meeting->course->enrollments()->where('status', 'active')->get() as $enrollment) {
    MeetingAttendance::firstOrCreate([
        'meeting_id' => $meeting->id,
        'user_id' => $enrollment->user_id,
    ], [
        'attended' => false,
    ]);
}
```

### **Issue: Certificate queue not created when reaching 100%**

**Solution:** Check if course has `has_certificate = true`.

```php
$course = Course::find(1);
if (!$course->has_certificate) {
    $course->update(['has_certificate' => true]);
}
```

### **Issue: Meeting attendance stats not updating**

**Solution:** Recalculate stats manually.

```php
$cert = CertificateQueue::find(1);
app(\App\Services\ProgressTrackingService::class)->recalculateAttendance($cert);
```

---

## 📞 SUPPORT

**Logs:**
```bash
tail -f storage/logs/laravel.log
```

**Database Check:**
```sql
SELECT * FROM meetings;
SELECT * FROM meeting_attendances;
SELECT * FROM certificate_queue;
```

**Artisan Commands:**
```bash
php artisan migrate:status
php artisan route:list | grep meetings
php artisan route:list | grep certificate-queue
```

---

**Developed by:** Claude Code Assistant
**Date:** 2025-11-09
**Version:** 1.0.0
**Status:** ✅ **BACKEND 100% COMPLETE - FRONTEND PENDING**

---

## 🎉 SUMMARY

**What's Done:**
- ✅ 3 Database tables (meetings, meeting_attendances, certificate_queue)
- ✅ 3 Models with full relations and methods
- ✅ 2 Controllers with complete CRUD
- ✅ 13 Routes registered
- ✅ ProgressTrackingService updated
- ✅ Migrations run successfully

**What's Next:**
- ⏳ Frontend components
- ⏳ Admin pages
- ⏳ Student view updates
- ⏳ Manual testing

**System is ready for frontend implementation!** 🚀
