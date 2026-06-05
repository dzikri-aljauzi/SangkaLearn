# CLAUDE.md — LeadNEX Project Briefing

This file is read automatically by Claude Code at the start of every session.
Do not delete it. Update it when project state changes.

---

## What This Project Is

LeadNEX is an Indonesian **e-learning and training certification platform** built with
**Laravel 12 + React 18 (Inertia.js)**. Target market: Indonesian professional training
and certification (Midtrans payment, partially Indonesian UI).

**Live URL:** https://leadnex.addin.id
**Code lives at:** `/var/www/leadnex` on the VPS

Key features: course creation (video/PDF/text lessons), student enrollment, Midtrans
payments (QRIS/GoPay/bank transfer), quiz and assignment system, PDF certificate
generation, live meeting scheduling, in-app messaging, AI chatbot, admin analytics.

---

## Production Infrastructure

```
Internet → Cloudflare (DNS proxy, TLS termination at edge)
              │ leadnex.addin.id resolves to Cloudflare IPs, NOT the VPS
              │ SSL Labs / external TLS scanners test Cloudflare, not nginx
              ▼
           Nginx (host, :443 SSL)
              │ static files served from /var/www/leadnex/public/
              │ PHP → fastcgi_pass 127.0.0.1:8008
              ▼
         Docker container: leadnex_app
              │ Image: leadnex-app:latest (built from /var/www/leadnex/Dockerfile)
              │ PHP 8.3-FPM, port 127.0.0.1:8008 → 9000
              │ Storage bind-mount: /var/www/leadnex/storage → /var/www/html/storage
              │ Config: /var/www/leadnex/.env.docker
              ▼
         PostgreSQL (host :5432)
              DB: leadnex, User: leadnex_user
```

**⚠️ Cloudflare is in front:** All DNS for `leadnex.addin.id` points to Cloudflare proxy IPs
(`172.67.199.21`, `104.21.21.135`). TLS settings visible to the public (SSL Labs, browsers)
are **Cloudflare's** — nginx TLS config only affects the Cloudflare→VPS leg and direct IP access.

**Nginx config:** `/etc/nginx/sites-enabled/leadnex.addin.id`
**Container env:** `/var/www/leadnex/.env.docker` (DO NOT commit — has real credentials)

### Redeploy after code changes

```bash
cd /var/www/leadnex
docker build -t leadnex-app:latest .
docker stop leadnex_app && docker rm leadnex_app
docker run -d --name leadnex_app --restart unless-stopped \
  --add-host host.docker.internal:host-gateway \
  -p 127.0.0.1:8008:9000 \
  -v /var/www/leadnex/storage:/var/www/html/storage \
  --env-file /var/www/leadnex/.env.docker \
  leadnex-app:latest
```

### Check container health

```bash
docker ps | grep leadnex                  # is it running?
docker logs leadnex_app --tail 30         # startup errors?
curl -sk -o /dev/null -w "%{http_code}" https://leadnex.addin.id/   # 200?
```

---

## Tech Stack

| Concern | Tool | Notes |
|---|---|---|
| Backend | Laravel 12, PHP 8.3 | Runs inside Docker |
| Frontend | React 18, Inertia.js 2 | No separate API — Inertia renders pages |
| Styling | Tailwind CSS 3 | |
| Build | Vite 7 | Assets pre-built; output in `public/build/` |
| Auth | Laravel Sanctum + Breeze | Session-based, not token |
| Payments | Midtrans PHP SDK | `app/Services/MidtransService.php` |
| Real-time | Laravel Echo + Pusher | `BROADCAST_CONNECTION=log` in prod currently |
| PDF certs | Snappy + wkhtmltopdf | ⚠️ wkhtmltopdf NOT in container yet — see Known Issues |
| Excel | Maatwebsite Excel | Used for quiz import and report export |
| Queue | Database queue | Should be migrated to Redis — see Known Issues |
| Charts | Recharts | Used in admin analytics pages |

---

## User Roles — Must Know

Four roles in `roles` table, assigned via `user_roles` pivot (many-to-many).

| Slug | Route prefix | Notes |
|---|---|---|
| `admin` | `/admin/` | Bypasses ALL role middleware — can access any route |
| `instructor` | `/instructor/` | Scoped to their own courses only |
| `sub_admin` | `/subadmin/` | Scoped to their assigned students only |
| `student` | `/student/` | Standard learner access |

### Backend role checks

```php
// Route groups in routes/web.php
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->group(...);
Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->group(...);
Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->group(...);
Route::middleware(['auth', 'verified', 'role:sub_admin'])->prefix('subadmin')->group(...);

// In controllers
$user->hasRole('admin');
$user->hasAnyRole(['admin', 'instructor']);
$user->assignRole('student');
```

**`RoleMiddleware` (app/Http/Middleware/RoleMiddleware.php):** admin always passes through.
Non-matching roles are redirected to `/dashboard` with a 403 flash message.

### Frontend role checks

```js
// resources/js/Utils/roleHelper.js — use this, don't hardcode role names
import { getRoutePrefix } from '@/Utils/roleHelper';
const prefix = getRoutePrefix(auth.user);
// Returns: 'admin' | 'instructor' | 'student' | 'subadmin'
```

User's roles array is in every Inertia page via `usePage().props.auth.user.roles`.

---

## How Pages Work (Inertia.js)

No REST API for page rendering. Every page follows this flow:

```
URL → routes/web.php → Controller → Inertia::render('Path/Page', $props) → React component
```

```php
// Controller example
return Inertia::render('Admin/Courses/Index', [
    'courses' => CourseResource::collection($courses),
    'filters' => $request->only(['search', 'status']),
]);
```

```jsx
// resources/js/Pages/Admin/Courses/Index.jsx
export default function Index({ courses, filters }) { ... }
```

### Page directory → route prefix mapping

| Directory | URL prefix | Who sees it |
|---|---|---|
| `Pages/Admin/` | `/admin/` | admin role |
| `Pages/Student/` | `/student/` | student role |
| `Pages/Instructor/` | `/instructor/` | instructor role |
| `Pages/SubAdmin/` | `/subadmin/` | sub_admin role |
| `Pages/Auth/` | `/login`, `/register`, etc. | guests |
| `Pages/Welcome.jsx` | `/` | public landing |
| `Pages/Courses/` | `/courses/` | public course listing |

### Shared props (available on every page)

Set in `app/Http/Middleware/HandleInertiaRequests.php`:
- `auth.user` — authenticated user with `roles` array eager-loaded
- `flash.success`, `flash.error`, `flash.info`, `flash.warning` — session flash
- `locale` — current locale string

---

## Component Rules

**One location only: `resources/js/Components/`** (56 components)

Do NOT create components in Pages/ subdirectories or anywhere else.
Previously 20 JSX files were dumped at the project root — they have been removed.

Key components to know:

| Component | Purpose |
|---|---|
| `Navbar.jsx` | Public/student navbar — has Alumni and Job Info nav items |
| `MonitoringNavbar.jsx` / `MonitoringSidebar.jsx` | Sub-admin layout |
| `CourseCard.jsx` | Course listing card — supports multiple instructors |
| `VideoPlayer.jsx` | Google Drive + direct video player |
| `PDFViewer.jsx` | In-browser PDF viewer (react-pdf) |
| `QuizPlayer.jsx` | Student quiz taking UI |
| `NotificationCenter.jsx` | Real-time notification bell |
| `ChatbotWidget.jsx` | AI chatbot overlay |
| `QRISPayment.jsx` / `DANAPayment.jsx` / `StaticQRISPayment.jsx` | Payment UIs |
| `LearningChart.jsx` / `RevenueChart.jsx` | Admin dashboard charts |

---

## Important Files

| File | Why you need to know it |
|---|---|
| `routes/web.php` | ALL routes — 1240 lines, split into groups by role. Has ~12 leftover debug routes at the bottom (security risk) |
| `app/Http/Middleware/RoleMiddleware.php` | Role-based gate — admin bypasses all |
| `app/Http/Middleware/HandleInertiaRequests.php` | Inertia shared props — add global data here |
| `app/Services/MidtransService.php` | Every payment action goes through here |
| `app/Services/CertificateGeneratorService.php` | PDF generation — currently broken (no wkhtmltopdf in container) |
| `app/Services/ProgressTrackingService.php` | Student course progress logic |
| `resources/js/Utils/roleHelper.js` | Frontend role → route prefix — always use this instead of hardcoding |
| `config/midtrans.php` | Reads Midtrans keys from .env |
| `database/seeders/DatabaseSeeder.php` | Seeder run order + default credentials |
| `Dockerfile` | Container definition — rebuild when adding PHP extensions |
| `docker/entrypoint.sh` | Runs on container start: config:cache → route:cache → view:cache → migrate → php-fpm |
| `.env.docker` | Production container environment — DB_HOST=host.docker.internal, real credentials |

---

## Database

**Production:** PostgreSQL on host, accessible from container via `host.docker.internal:5432`
**Local dev:** SQLite (`database/database.sqlite`) — zero config, sufficient for development

**Schema:** 83 migrations. Do not use `migrate:fresh` in production — always `migrate`.

**Seeders:** 20 seeders exist. Entry point is always `DatabaseSeeder`. Run order:
```
RoleSeeder → UserSeeder → CategorySeeder → CourseTypeSeeder → DemoCourseSeeder
```

**Default accounts (after `php artisan db:seed`):**

| Role | Email | Password |
|---|---|---|
| Admin | admin@lmsbdi.com | password123 |
| Instructor | budi.santoso@lmsbdi.com | instructor123 |
| Student | andi.pratama@student.com | student123 |

**PostgreSQL only — after seeding:** run `php artisan postgres:fix-sequences`

---

## Payments (Midtrans)

- All logic in `app/Services/MidtransService.php`
- Webhook (no auth, must be publicly reachable): `POST /payment/notification`
- On successful payment: `MidtransService::processSuccessfulPayment()` creates `Enrollment` records and sends email
- Supported methods: QRIS, GoPay, bank transfer VA (BNI, BRI, BCA, Mandiri), DANA, ShopeePay
- For local webhook testing: use ngrok — scripts in `scripts/`
- Full guide: `docs/payments.md`

---

## Known Issues (Prioritised Backlog)

**🔴 Critical — fix before any new features:**

1. **wkhtmltopdf missing from Docker** — `CertificateGeneratorService` uses Snappy/wkhtmltopdf
   but the binary is not installed in `Dockerfile`. Certificate generation silently fails in
   production. Fix: add wkhtmltopdf install steps to Dockerfile and rebuild.

**🟡 Medium — next sprint:**

2. **SSL Labs grade still B — Cloudflare TLS setting** — `leadnex.addin.id` is behind Cloudflare.
   External TLS scans (SSL Labs) test Cloudflare's edge, not nginx. Fix: Cloudflare Dashboard →
   SSL/TLS → Edge Certificates → Minimum TLS Version → **TLS 1.2**. Also enable TLS 1.3.
   To remove CBC cipher findings, Cloudflare Business/Enterprise plan is required.

3. **`routes/web.php` is ~924 lines** — split into `routes/web/admin.php`,
   `routes/web/student.php`, `routes/web/instructor.php`, etc. for maintainability.

3. **Database queue and file cache won't scale** — switch to Redis:
   `CACHE_STORE=redis`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`.
   Requires installing `predis/predis` or the Redis PHP extension in Docker.

4. **`MIDTRANS_SSL_VERIFY_PEER=false` in production** — should be `true` with proper
   cert validation. Was disabled during development.

5. **Sensitive files world-readable (644)** — `.env`, `.env.docker`, `.env.production` should
   be `chmod 600`. Also `ssl/` directory and `.env.docker` are not in `.gitignore`.

**🟢 Low — clean up:**

6. `resources/js/Pages/Welcome.jsx.backup` — delete it
7. No feature tests — `tests/Feature/` has only Laravel stubs
8. `.env.docker` and `.env.production` not in `.gitignore` — add them

> ✅ **Resolved June 2026:** Debug routes (`/debug/login-admin`, `/debug/*`, `/test/*`) deleted.
> ✅ **Resolved June 2026:** nginx: TLS 1.0/1.1 disabled; modern GCM+CHACHA20 ciphers only; HSTS added (`max-age=31536000; includeSubDomains; preload`). Note: SSL Labs still shows B because it tests **Cloudflare's edge**, not nginx — fix requires Cloudflare Dashboard → Minimum TLS Version → TLS 1.2.

---

## Common Commands

```bash
# --- Container ---
docker ps | grep leadnex                        # check container status
docker logs leadnex_app --tail 50               # view logs
docker exec -it leadnex_app sh                  # shell into container
docker build -t leadnex-app:latest .            # rebuild image (from /var/www/leadnex)

# --- Laravel (run inside container or via docker exec) ---
docker exec leadnex_app php artisan optimize:clear     # clear all caches
docker exec leadnex_app php artisan optimize           # cache for production
docker exec leadnex_app php artisan route:list         # list all routes
docker exec leadnex_app php artisan migrate            # run new migrations
docker exec leadnex_app php artisan queue:work         # manual queue worker

# --- Database ---
PGPASSWORD='leadnex_db_2024!' psql -h 127.0.0.1 -U leadnex_user -d leadnex   # psql shell

# --- Local dev only (PHP on host) ---
php artisan serve         # :8000
npm run dev               # Vite HMR
composer dev              # all-in-one: serve + queue + logs + vite
php artisan test          # run tests
```

---

## Docs Directory

| File | Contents |
|---|---|
| `docs/architecture.md` | Model relationships, role system, directory map, Inertia data flow |
| `docs/payments.md` | Midtrans methods, webhook flow, sandbox testing, key service methods |
| `docs/deployment.md` | Nginx config, Supervisor workers, cron, SSL, file permissions |
| `docs/archive/` | 146 AI session notes from original development — **historical reference only, not documentation** |

---

## What NOT to Do

- **Don't** add components outside `resources/js/Components/` — causes duplicates
- **Don't** commit `.env` or `.env.docker` — both contain live credentials
- **Don't** run `php artisan migrate:fresh` in production — use `migrate`
- **Don't** add debug routes to `web.php` — use `php artisan tinker`
- **Don't** create `.md` files in the project root — put them in `docs/`
- **Don't** use `DB_HOST=127.0.0.1` inside Docker — use `host.docker.internal`
- **Don't** modify `/etc/nginx/sites-enabled/leadnex.addin.id` without running `sudo nginx -t` first
- **Don't** remove the HSTS header without first submitting a removal request at hstspreload.org — once preloaded in browsers, removing it breaks HTTPS for all visitors for up to a year
