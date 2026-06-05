# LeadNEX — AI Learning Platform

LeadNEX is a full-stack **Indonesian e-learning and training certification platform** built with Laravel 12 and React 18 (Inertia.js). It covers the full lifecycle of online learning: course creation, student enrollment, payment processing, quiz and assignment management, live meetings, certificate generation, and an AI chatbot assistant.

**Live site:** https://leadnex.addin.id

---

## Feature Overview

| Area | What it does |
|---|---|
| **Courses** | Instructors create courses with sections, lessons (video/PDF/text), quizzes, and assignments |
| **Enrollment** | Students browse, purchase, and enroll. Free and paid courses supported |
| **Payments** | Midtrans integration — QRIS, GoPay, bank transfer VA, DANA, ShopeePay |
| **Certificates** | Auto-generated PDF certificates on course completion |
| **Meetings** | Live session scheduling and attendance tracking |
| **Messaging** | In-app messaging between students, instructors, and admins |
| **Monitoring** | Sub-admin dashboard to track assigned student progress |
| **Analytics** | Admin analytics: revenue, enrollment trends, quiz scores, system health |
| **Chatbot** | AI chatbot assistant embedded in the platform |
| **Notifications** | Email + in-app notifications for payments, meetings, and progress |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend framework | Laravel | 12 |
| Language | PHP | 8.3 |
| Frontend | React + Inertia.js | 18 / 2 |
| Styling | Tailwind CSS | 3 |
| Build tool | Vite | 7 |
| Auth | Laravel Sanctum + Breeze | — |
| Database | PostgreSQL (production) / SQLite (local) | — |
| Payments | Midtrans PHP SDK | — |
| Real-time | Laravel Echo + Pusher | — |
| PDF generation | Snappy (wkhtmltopdf) + DomPDF | — |
| Excel export | Maatwebsite Excel | — |
| Charts | Recharts | — |
| Drag & drop | react-beautiful-dnd | — |
| Queue | Laravel database queue | — |
| Container | Docker (PHP-FPM) | — |
| Web server | Nginx (host) | — |

---

## User Roles

The platform has four roles. Every route group and frontend page is scoped to a specific role.

| Role | Route prefix | What they can do |
|---|---|---|
| `admin` | `/admin/` | Full access — manage all users, courses, payments, settings, analytics |
| `instructor` | `/instructor/` | Create and manage their own courses, lessons, quizzes, assignments |
| `sub_admin` | `/subadmin/` | Monitor only the students assigned to them by an admin |
| `student` | `/student/` | Browse, purchase, and complete courses; earn certificates |

> **Note:** Admin bypasses all role middleware — admins can access any role-prefixed route.

---

## Project Structure

```
leadnex/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/          # 28 admin-scoped controllers
│   │   │   │   ├── AdminDashboardController.php
│   │   │   │   ├── CourseManagementController.php
│   │   │   │   ├── UserManagementController.php
│   │   │   │   ├── MeetingController.php
│   │   │   │   ├── CertificateController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   └── ... (28 total)
│   │   │   ├── Auth/           # Breeze auth controllers
│   │   │   ├── PaymentController.php
│   │   │   ├── MidtransController.php
│   │   │   ├── CheckoutController.php
│   │   │   ├── CertificateController.php
│   │   │   ├── CourseController.php
│   │   │   ├── ChatbotProxyController.php
│   │   │   └── ... (32 total root controllers)
│   │   ├── Middleware/
│   │   │   ├── RoleMiddleware.php          # role:admin / role:student etc.
│   │   │   ├── HandleInertiaRequests.php   # shares auth + flash props to all pages
│   │   │   ├── CheckCourseAccess.php
│   │   │   ├── TrackLearningActivity.php
│   │   │   └── TrackLoginStreak.php
│   │   └── Requests/           # Form request validation classes
│   │
│   ├── Models/                 # 61 Eloquent models
│   │   ├── User.php            # has roles (many-to-many), enrollments, orders
│   │   ├── Course.php          # has sections → lessons, quizzes, assignments
│   │   ├── Enrollment.php      # links User ↔ Course
│   │   ├── Order.php / Payment.php / OrderItem.php
│   │   ├── Certificate.php
│   │   ├── Meeting.php / MeetingAttendance.php
│   │   ├── Quiz.php / QuizQuestion.php / QuizAttempt.php
│   │   ├── Assignment.php / AssignmentSubmission.php
│   │   ├── Message.php / Conversation.php
│   │   └── ... (61 total)
│   │
│   ├── Services/
│   │   ├── MidtransService.php              # all payment logic
│   │   ├── CertificateGeneratorService.php  # PDF generation via wkhtmltopdf
│   │   ├── ProgressTrackingService.php      # student progress calculation
│   │   ├── CourseAssignmentService.php      # special student → course assignment
│   │   └── SpecialStudentCourseAccessService.php
│   │
│   ├── Notifications/          # Email + database notification classes
│   ├── Observers/              # Model event observers
│   └── Events/                 # Broadcast events (Pusher)
│
├── resources/
│   └── js/
│       ├── Components/         # 56 reusable React components
│       │   ├── Navbar.jsx / MonitoringNavbar.jsx / MonitoringSidebar.jsx
│       │   ├── CourseCard.jsx / VideoPlayer.jsx / PDFViewer.jsx
│       │   ├── QuizPlayer.jsx / QuestionEditor.jsx
│       │   ├── Modal.jsx / Dropdown.jsx / Alert.jsx
│       │   ├── NotificationCenter.jsx / ChatbotWidget.jsx
│       │   ├── QRISPayment.jsx / DANAPayment.jsx / StaticQRISPayment.jsx
│       │   └── ... (56 total — this is the ONLY place for components)
│       │
│       ├── Layouts/
│       │   ├── AppLayout.jsx           # main authenticated layout (sidebar + navbar)
│       │   ├── AuthenticatedLayout.jsx # simple auth wrapper
│       │   ├── GuestLayout.jsx         # public/guest pages
│       │   └── MonitoringLayout.jsx    # sub-admin monitoring layout
│       │
│       ├── Pages/              # Inertia page components (1 file = 1 route)
│       │   ├── Welcome.jsx             # public landing page
│       │   ├── Admin/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Analytics.jsx
│       │   │   ├── Courses/            # course CRUD + content builder
│       │   │   ├── Users/              # user management
│       │   │   ├── Meetings/           # meeting scheduling
│       │   │   ├── Certificates/       # certificate queue + management
│       │   │   ├── Reports/            # financial and enrollment reports
│       │   │   └── ... (20+ admin pages)
│       │   ├── Student/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── BrowseCourses.jsx
│       │   │   ├── CourseStudy.jsx     # main learning view
│       │   │   ├── QuizTake.jsx / QuizResult.jsx
│       │   │   ├── AssignmentView.jsx / AssignmentSubmission.jsx
│       │   │   ├── Certificates.jsx
│       │   │   └── PurchaseHistory.jsx
│       │   ├── Instructor/
│       │   │   └── Dashboard.jsx
│       │   └── SubAdmin/
│       │       ├── Dashboard.jsx
│       │       ├── Students.jsx / StudentDetail.jsx
│       │       └── ProgressTracking.jsx
│       │
│       ├── Hooks/
│       │   ├── useCartCount.js
│       │   ├── useRealtimeMessaging.js
│       │   └── useScreenRecordingDetector.js
│       │
│       └── Utils/
│           ├── roleHelper.js   # maps user role → route prefix (critical utility)
│           ├── autoRefresh.js / immediateRefresh.js
│           └── messageNotifications.js
│
├── routes/
│   ├── web.php             # all routes — public, admin, instructor, student, subadmin, payments
│   ├── api.php             # minimal API routes
│   ├── auth.php            # Breeze auth routes
│   └── console.php         # scheduled commands
│
├── database/
│   ├── migrations/         # 83 migrations (full schema history)
│   └── seeders/            # 20 seeders — use DatabaseSeeder as entry point only
│
├── config/
│   ├── midtrans.php        # payment gateway config (reads from .env)
│   └── snappy.php          # PDF generation config
│
├── docker/
│   └── entrypoint.sh       # container startup: cache → migrate → php-fpm
│
├── docs/
│   ├── architecture.md     # model relationships, role system, data flow
│   ├── payments.md         # Midtrans integration, webhook, payment methods
│   ├── deployment.md       # server setup, nginx, supervisor, cron
│   └── archive/            # 146 historical AI session notes — reference only
│
└── scripts/                # deployment and ngrok tunnel scripts
```

---

## Production Architecture

```
Internet
   │  HTTPS :443
   ▼
Cloudflare (DNS proxy)
   │  leadnex.addin.id → Cloudflare edge IPs (172.67.199.21 / 104.21.21.135)
   │  TLS termination happens here — SSL Labs tests this layer, not nginx
   ▼
Nginx (host)
   │  /etc/nginx/sites-enabled/leadnex.addin.id
   │  static files → /var/www/leadnex/public/
   │  PHP requests → fastcgi_pass 127.0.0.1:8008
   ▼
Docker container: leadnex_app
   │  Image: leadnex-app:latest
   │  Port: 127.0.0.1:8008 → 9000 (PHP-FPM)
   │  Storage: /var/www/leadnex/storage (bind mount)
   │  Config: .env.docker
   ▼
PostgreSQL (host :5432)
   DB: leadnex / User: leadnex_user
```

**To restart the container after code changes:**
```bash
docker build -t leadnex-app:latest /var/www/leadnex
docker stop leadnex_app && docker rm leadnex_app
docker run -d --name leadnex_app --restart unless-stopped \
  --add-host host.docker.internal:host-gateway \
  -p 127.0.0.1:8008:9000 \
  -v /var/www/leadnex/storage:/var/www/html/storage \
  --env-file /var/www/leadnex/.env.docker \
  leadnex-app:latest
```

---

## Local Development Setup

### Prerequisites
- PHP 8.2+, Composer 2+, Node.js 18+, npm
- PostgreSQL 14+ or SQLite (zero-config for local)

### Steps

```bash
# 1. Install dependencies
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate
# Edit .env — set DB, mail, Midtrans keys (see Environment Variables below)

# 3. Database (SQLite — easiest for local)
touch database/database.sqlite
php artisan migrate
php artisan db:seed
php artisan storage:link

# 4. Run everything
composer dev
# Opens: Laravel :8000, Vite HMR, queue listener, log watcher
```

Visit `http://localhost:8000`

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `APP_URL` | Full public URL | `https://leadnex.addin.id` |
| `APP_KEY` | Laravel app key | `base64:...` (generated) |
| `DB_CONNECTION` | Database driver | `pgsql` or `sqlite` |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | DB credentials | — |
| `MAIL_MAILER` | Mail driver | `smtp` or `log` (dev) |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP credentials | — |
| `MAIL_FROM_ADDRESS` | Sender email | `hello@leadnex.id` |
| `MIDTRANS_SERVER_KEY` | Midtrans server key | `Mid-server-...` |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key | `Mid-client-...` |
| `MIDTRANS_IS_PRODUCTION` | Sandbox or live | `false` / `true` |
| `BROADCAST_CONNECTION` | Real-time driver | `log` (dev) / `pusher` (prod) |
| `PUSHER_APP_ID` / `PUSHER_APP_KEY` / `PUSHER_APP_SECRET` / `PUSHER_APP_CLUSTER` | Pusher credentials | — |

> Docker production uses `.env.docker` — same keys but `DB_HOST=host.docker.internal`

---

## Default Seeded Accounts

```bash
php artisan db:seed
```

| Role | Email | Password |
|---|---|---|
| Admin | admin@lmsbdi.com | password123 |
| Instructor | budi.santoso@lmsbdi.com | instructor123 |
| Student | andi.pratama@student.com | student123 |

---

## Running Tests

```bash
composer test
# or
php artisan test
```

---

## Known Issues (Backlog)

These are known issues the dev team should prioritise:

| Priority | Issue | Location |
|---|---|---|
| 🔴 High | `wkhtmltopdf` not in Docker container — certificates broken in prod | `Dockerfile` |
| 🟡 Medium | SSL Labs grade B — Cloudflare TLS minimum not set to 1.2; CBC ciphers offered at edge | Cloudflare Dashboard → SSL/TLS → Edge Certificates |
| 🟡 Medium | `routes/web.php` is ~924 lines — split by role for maintainability | `routes/web.php` |
| 🟡 Medium | File-based cache and DB queue — won't scale | Switch to Redis |
| 🟡 Medium | `MIDTRANS_SSL_VERIFY_PEER=false` in production | `config/midtrans.php` |
| 🟡 Medium | `.env`, `.env.docker` are world-readable (644) — should be 600 | VPS file permissions |
| 🟢 Low | `.env.docker`, `.env.production`, `ssl/` not in `.gitignore` | `.gitignore` |
| 🟢 Low | `resources/js/Pages/Welcome.jsx.backup` stale file | Delete it |
| 🟢 Low | No feature tests — only default Laravel stubs exist | `tests/Feature/` |

> ✅ **Resolved June 2026:** All debug/test routes (`/debug/login-admin`, `/debug/*`, `/test/*`) deleted from `routes/web.php`.
> ✅ **Resolved June 2026:** nginx hardened — TLS 1.0/1.1 disabled, modern GCM+CHACHA20 ciphers, HSTS (`max-age=31536000; includeSubDomains; preload`) added. Note: `leadnex.addin.id` is behind Cloudflare — SSL Labs grade remains B until Cloudflare's minimum TLS version is set to 1.2 in the Cloudflare Dashboard.

---

## Further Reading

- [Architecture & data model](docs/architecture.md)
- [Payment integration (Midtrans)](docs/payments.md)
- [Production deployment guide](docs/deployment.md)
- [CLAUDE.md](CLAUDE.md) — AI assistant briefing (auto-read by Claude Code)
