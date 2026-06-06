# 🔧 PANDUAN INTEGRASI MANUAL - Sistem Pelatihan

## 📝 YANG SUDAH SELESAI (Backend + Component)

✅ Backend 100% complete
✅ Component `CourseTrainingFields.jsx` sudah dibuat
✅ Migration & Seeder sudah dijalankan
✅ Testing passed

---

## 🎯 YANG PERLU DILAKUKAN MANUAL

Ada **3 langkah integrasi** yang perlu dilakukan di frontend:

### **1. Integrasi ke Create Course Form**
### **2. Integrasi ke Edit Course Form**
### **3. Update Course Display (List & Detail)**

---

## 📋 LANGKAH 1: Integrasi ke CREATE FORM

### **File:** `resources/js/Pages/Admin/Courses/Create.jsx`

#### **A. Import Component**
Tambahkan di bagian atas file:

```jsx
import CourseTrainingFields from '@/Components/CourseTrainingFields';
```

#### **B. Update Initial State**
Tambahkan fields baru di `formData` initial state:

```jsx
const [formData, setFormData] = useState({
    // ... existing fields ...

    // Training Fields - TAMBAHKAN INI
    course_type_id: null,
    is_permanent: true,
    period_start: '',
    period_end: '',
    registration_deadline: '',
    auto_archive: false,
    certificate_provider: 'leadnex',
    certificate_title: '',
    delivery_method: 'hybrid',
    zoom_link: '',
    zoom_schedule: '',
    zoom_notes: '',
});
```

#### **C. Tambahkan Component di Form**
Sisipkan component di dalam form (biasanya setelah section Certificate atau sebelum Submit button):

```jsx
<form onSubmit={handleSubmit}>
    {/* ... existing form fields ... */}

    {/* TAMBAHKAN SECTION INI */}
    <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Konfigurasi Pelatihan
        </h2>
        <CourseTrainingFields
            formData={formData}
            setFormData={setFormData}
            courseTypes={courseTypes}
        />
    </div>

    {/* Submit buttons */}
</form>
```

#### **D. Pastikan Props `courseTypes` Ada**
Controller sudah mengirim `courseTypes`, jadi component props harus terima:

```jsx
export default function Create({ auth, instructors, categories, courseTypes }) {
    // Component code...
}
```

---

## 📋 LANGKAH 2: Integrasi ke EDIT FORM

### **File:** `resources/js/Pages/Admin/Courses/Edit.jsx`

#### **A. Import Component**
```jsx
import CourseTrainingFields from '@/Components/CourseTrainingFields';
```

#### **B. Update Initial State**
Saat load course data, pastikan fields baru juga di-populate:

```jsx
const [formData, setFormData] = useState({
    // ... existing fields ...

    // Training Fields - TAMBAHKAN INI
    course_type_id: course.course_type_id || null,
    is_permanent: course.is_permanent !== false, // default true
    period_start: course.period_start || '',
    period_end: course.period_end || '',
    registration_deadline: course.registration_deadline || '',
    auto_archive: course.auto_archive || false,
    certificate_provider: course.certificate_provider || 'leadnex',
    certificate_title: course.certificate_title || '',
    delivery_method: course.delivery_method || 'hybrid',
    zoom_link: course.zoom_link || '',
    zoom_schedule: course.zoom_schedule || '',
    zoom_notes: course.zoom_notes || '',
});
```

#### **C. Tambahkan Component di Form**
```jsx
<form onSubmit={handleSubmit}>
    {/* ... existing form fields ... */}

    {/* TAMBAHKAN SECTION INI */}
    <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Konfigurasi Pelatihan
        </h2>
        <CourseTrainingFields
            formData={formData}
            setFormData={setFormData}
            courseTypes={courseTypes}
        />
    </div>

    {/* Submit buttons */}
</form>
```

#### **D. Pastikan Props Ada**
```jsx
export default function Edit({ auth, course, instructors, categories, courseTypes }) {
    // Component code...
}
```

---

## 📋 LANGKAH 3: Update COURSE DISPLAY

### **A. Course List (Index)**

**File:** `resources/js/Pages/Admin/Courses/Index.jsx`

Tambahkan badge untuk tipe pelatihan & status periode:

```jsx
{/* Course Card */}
<div className="course-card">
    <h3>{course.title}</h3>

    {/* TAMBAHKAN BADGES INI */}
    <div className="flex items-center gap-2 mb-3">
        {/* Course Type Badge */}
        {course.course_type && (
            <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                    backgroundColor: course.course_type.color + '20',
                    color: course.course_type.color,
                    borderWidth: '1px',
                    borderColor: course.course_type.color
                }}
            >
                {course.course_type.name}
            </span>
        )}

        {/* Period Badge */}
        {course.is_permanent ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Permanen
            </span>
        ) : (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {new Date(course.period_start).toLocaleDateString()} - {new Date(course.period_end).toLocaleDateString()}
            </span>
        )}

        {/* Certificate Badge */}
        {course.certificate_provider === 'bnsp' && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                BNSP
            </span>
        )}
        {course.certificate_provider === 'both' && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                LeadNex + BNSP
            </span>
        )}
    </div>

    {/* Rest of card content */}
</div>
```

### **B. Course Detail (Show)**

**File:** `resources/js/Pages/Courses/Show.jsx`

Tambahkan section untuk info pelatihan:

```jsx
{/* Course Header */}
<div className="course-header">
    <h1>{course.title}</h1>

    {/* TAMBAHKAN INFO SECTION INI */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Tipe Pelatihan */}
        {course.course_type && (
            <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-500" />
                <div>
                    <p className="text-sm text-gray-500">Tipe Pelatihan</p>
                    <p className="font-semibold" style={{ color: course.course_type.color }}>
                        {course.course_type.name}
                    </p>
                </div>
            </div>
        )}

        {/* Metode Pembelajaran */}
        <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-gray-500" />
            <div>
                <p className="text-sm text-gray-500">Metode</p>
                <p className="font-semibold">
                    {course.delivery_method === 'hybrid' && 'Hybrid (Recording + Zoom)'}
                    {course.delivery_method === 'online_recording' && 'Online Recording'}
                    {course.delivery_method === 'zoom_interactive' && 'Zoom Interaktif'}
                </p>
            </div>
        </div>

        {/* Sertifikat */}
        <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-gray-500" />
            <div>
                <p className="text-sm text-gray-500">Sertifikat</p>
                <p className="font-semibold">
                    {course.certificate_provider === 'leadnex' && 'LeadNex'}
                    {course.certificate_provider === 'bnsp' && 'BNSP'}
                    {course.certificate_provider === 'both' && 'LeadNex + BNSP'}
                </p>
            </div>
        </div>
    </div>

    {/* Periode (jika tidak permanen) */}
    {!course.is_permanent && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
            <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                    <p className="text-sm font-semibold text-blue-800">Periode Pelatihan</p>
                    <p className="text-sm text-blue-600">
                        {new Date(course.period_start).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                        {' - '}
                        {new Date(course.period_end).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                    {course.registration_deadline && (
                        <p className="text-xs text-blue-500 mt-1">
                            Deadline Pendaftaran: {new Date(course.registration_deadline).toLocaleDateString('id-ID')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )}

    {/* Zoom Info (jika ada) */}
    {course.zoom_link && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-4">
            <div className="flex items-center">
                <Video className="w-5 h-5 text-green-600 mr-2" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">Zoom Meeting</p>
                    {course.zoom_schedule && (
                        <p className="text-sm text-green-600">
                            Jadwal: {new Date(course.zoom_schedule).toLocaleString('id-ID')}
                        </p>
                    )}
                    <a
                        href={course.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-700 hover:text-green-900 underline"
                    >
                        Join Zoom Meeting →
                    </a>
                </div>
            </div>
            {course.zoom_notes && (
                <p className="text-sm text-green-600 mt-2">{course.zoom_notes}</p>
            )}
        </div>
    )}
</div>
```

### **C. Course Index (Student View)**

**File:** `resources/js/Pages/Courses/Index.jsx` (yang untuk student)

Tambahkan filter tipe pelatihan & badge:

```jsx
{/* Filter Section - TAMBAHKAN FILTER TIPE */}
<select
    value={filters.course_type || ''}
    onChange={(e) => handleFilterChange('course_type', e.target.value)}
    className="..."
>
    <option value="">Semua Tipe</option>
    {courseTypes.map(type => (
        <option key={type.id} value={type.id}>{type.name}</option>
    ))}
</select>

{/* Course Card - TAMBAHKAN BADGE */}
<div className="course-card">
    {/* Course Type Badge */}
    {course.course_type && (
        <span
            className="px-2 py-1 rounded text-xs font-bold"
            style={{
                backgroundColor: course.course_type.color + '20',
                color: course.course_type.color
            }}
        >
            {course.course_type.name}
        </span>
    )}

    {/* Registration Status */}
    {!course.is_permanent && (
        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
            Periode: {new Date(course.period_start).toLocaleDateString()} - {new Date(course.period_end).toLocaleDateString()}
        </span>
    )}

    {/* Delivery Method Icon */}
    {course.delivery_method === 'zoom_interactive' && (
        <span className="flex items-center text-xs text-green-600">
            <Video className="w-3 h-3 mr-1" />
            Live Class
        </span>
    )}

    {/* ... rest of card */}
</div>
```

---

## 🎨 IMPORT ICONS YANG DIPERLUKAN

Pastikan import icons di file yang dibutuhkan:

```jsx
import {
    Award,
    Calendar,
    Monitor,
    Video,
    Clock
} from 'lucide-react';
```

---

## ✅ CHECKLIST INTEGRASI

### Backend (Sudah Selesai)
- [x] Migration
- [x] Model
- [x] Controller
- [x] Routes
- [x] Command
- [x] Seeder

### Frontend Component (Sudah Selesai)
- [x] CourseTrainingFields.jsx dibuat
- [x] CourseTypes Index page dibuat

### Integrasi Manual (Perlu Dilakukan)
- [ ] Import component di Create.jsx
- [ ] Tambah initial state di Create.jsx
- [ ] Sisipkan component di Create.jsx form
- [ ] Import component di Edit.jsx
- [ ] Tambah initial state di Edit.jsx
- [ ] Sisipkan component di Edit.jsx form
- [ ] Update Course List dengan badges
- [ ] Update Course Detail dengan info section
- [ ] Update Student Course Index dengan filter & badges

---

## 🧪 TESTING SETELAH INTEGRASI

### 1. Test Create Course
```
- Akses /admin/courses/create
- Isi form lengkap
- Pilih tipe pelatihan
- Set periode (uncheck permanent)
- Pilih certificate provider
- Pilih delivery method
- Submit
- Cek di database: semua field tersimpan
```

### 2. Test Edit Course
```
- Akses course yang sudah ada
- Klik Edit
- Pastikan semua field ter-load
- Update beberapa field
- Submit
- Cek perubahan tersimpan
```

### 3. Test Display
```
- Lihat course list: badge muncul
- Lihat course detail: info section muncul
- Cek responsiveness
- Cek warna badge sesuai course type
```

---

## 📞 TROUBLESHOOTING

### **Error: courseTypes is undefined**
**Solusi:** Pastikan controller sudah mengirim data:
```php
// CourseController.php
$courseTypes = CourseType::active()->ordered()->get();
return Inertia::render('...', ['courseTypes' => $courseTypes]);
```

### **Error: formData fields undefined**
**Solusi:** Pastikan initial state mencakup semua field baru

### **Badge tidak muncul**
**Solusi:**
1. Cek relasi course_type di-load: `$course->load('courseType')`
2. Cek conditional rendering: `{course.course_type && ...}`

---

## 🎯 TIPS

1. **Testing Bertahap:** Test satu per satu (create dulu, baru edit, baru display)
2. **Console Log:** Gunakan `console.log(formData)` untuk debug
3. **Backend Check:** Gunakan `dd($request->all())` di controller untuk cek data
4. **Database Check:** Cek langsung di database apakah data tersimpan

---

## 📚 REFERENSI

- **Component:** `resources/js/Components/CourseTrainingFields.jsx`
- **Controller:** `app/Http/Controllers/Admin/CourseController.php`
- **Model:** `app/Models/Course.php`
- **Full Docs:** `SISTEM_PELATIHAN_DOCUMENTATION.md`

---

**Status:** ⏳ Menunggu integrasi manual
**Estimasi Waktu:** 30-45 menit untuk semua integrasi
**Difficulty:** ⭐⭐ (Easy - Medium)
