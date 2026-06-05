# Architecture Overview

## What the App Does

LeadNEX is an e-learning platform where:
- **Admins** manage everything: users, courses, payments, certificates, analytics
- **Instructors** create and manage courses, lessons, quizzes, and assignments
- **Sub-admins** monitor a subset of students assigned to them
- **Students** browse, purchase, and complete courses; earn certificates

---

## User Roles

Roles are stored in the `roles` table and assigned via `user_roles` (many-to-many). The four role slugs used in the codebase are:

| Role slug | Display name | Key permissions |
|---|---|---|
| `admin` | Administrator | Full access to all features |
| `instructor` | Instructor | Create/manage own courses, grade students |
| `sub_admin` | Sub Administrator | Monitor assigned students only |
| `student` | Student | Enroll, learn, take quizzes, download certificates |

Role checks are done via `$user->hasRole('admin')` or via the `role:` middleware in routes (`middleware(['auth', 'role:admin'])`).

---

## Key Models and Relationships

```
User
 ├── roles (many-to-many via user_roles)
 ├── instructorProfile (HasOne → InstructorProfile)
 ├── createdCourses (HasMany → Course, as instructor)
 ├── enrollments (HasMany → Enrollment)
 ├── orders (HasMany → Order)
 └── certificates (HasMany → Certificate)

Course
 ├── instructor (BelongsTo → User)
 ├── instructors (BelongsToMany via course_instructors)
 ├── sections (HasMany → CourseSection)
 │    └── lessons (HasMany → Lesson)
 ├── enrollments (HasMany → Enrollment)
 ├── quizzes (HasMany → Quiz)
 ├── assignments (HasMany → Assignment)
 └── reviews (HasMany → Review)

Order
 ├── user (BelongsTo → User)
 ├── items (HasMany → OrderItem → Course)
 └── payment (HasOne → Payment)

Enrollment
 ├── user (BelongsTo → User)
 └── course (BelongsTo → Course)

Certificate
 ├── user (BelongsTo → User)
 └── course (BelongsTo → Course)

Meeting
 ├── course (BelongsTo → Course)
 └── attendances (HasMany → MeetingAttendance)
```

---

## Backend Directory Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/          # Admin-scoped controllers (Users, Courses, Reports, etc.)
│   │   ├── Auth/           # Breeze authentication controllers
│   │   ├── CheckoutController.php
│   │   ├── PaymentController.php
│   │   ├── MidtransController.php
│   │   ├── CertificateController.php
│   │   ├── MeetingController.php
│   │   ├── ChatbotProxyController.php
│   │   └── ...
│   ├── Middleware/
│   │   └── RoleMiddleware.php   # Enforces role:xxx middleware
│   └── Requests/               # Form request validation classes
├── Models/                     # 61 Eloquent models
├── Services/
│   ├── MidtransService.php          # Payment processing
│   ├── CertificateGeneratorService.php
│   ├── CourseAssignmentService.php
│   └── ProgressTrackingService.php
├── Notifications/              # Email + database notifications
├── Observers/                  # Model event listeners
├── Events/                     # Broadcast events (real-time)
└── Exports/                    # Excel export classes (Maatwebsite)
```

---

## Frontend Directory Structure

The frontend uses **Inertia.js** — the Laravel controller passes data directly to React page components via `Inertia::render('PageName', $props)`. There is no separate API layer for page rendering.

```
resources/js/
├── app.jsx                 # Inertia app bootstrap
├── Components/             # Reusable UI components (56 files)
│   ├── Navbar.jsx
│   ├── CourseCard.jsx
│   ├── Modal.jsx
│   ├── PDFViewer.jsx
│   ├── QuizPlayer.jsx
│   ├── VideoPlayer.jsx
│   └── ...
├── Layouts/
│   ├── AppLayout.jsx           # Main authenticated layout (sidebar + navbar)
│   ├── AuthenticatedLayout.jsx # Simpler auth layout
│   ├── GuestLayout.jsx         # Public pages
│   └── MonitoringLayout.jsx    # Sub-admin monitoring layout
├── Pages/
│   ├── Welcome.jsx             # Landing page
│   ├── Admin/                  # Admin panel pages
│   │   ├── Dashboard.jsx
│   │   ├── Courses/
│   │   ├── Users/
│   │   ├── Meetings/
│   │   ├── Reports/
│   │   └── ...
│   ├── Student/                # Student-facing pages
│   │   ├── Dashboard.jsx
│   │   ├── BrowseCourses.jsx
│   │   ├── CourseStudy.jsx
│   │   ├── QuizTake.jsx
│   │   └── ...
│   ├── Instructor/             # Instructor pages
│   ├── SubAdmin/               # Sub-admin pages
│   └── Auth/                   # Login, register, password reset
├── Hooks/                      # Custom React hooks
├── Utils/                      # Utility functions
└── lib/                        # Shared helpers
```

---

## Real-time Features

Real-time functionality uses **Laravel Echo + Pusher**. Events are broadcast from `app/Events/` and listened to in the frontend via `window.Echo`. Configure Pusher credentials in `.env` and set `BROADCAST_CONNECTION=pusher`.

---

## Queue Jobs

Background jobs (email notifications, certificate generation) run through the database queue. In production, run the queue worker via Supervisor (see [deployment.md](deployment.md)).

---

## Seeder Order

When seeding a fresh database, the DatabaseSeeder runs seeders in this order:
1. `RoleSeeder` — creates the four roles
2. `UserSeeder` — creates admin, instructor, and student demo accounts
3. `CategorySeeder` — course categories
4. `CourseTypeSeeder` — course types (Pelatihan Umum, Teknologi Bisnis Digital, etc.)
5. `DemoCourseSeeder` — sample courses with content
