<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\ViteProxyController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CourseManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\SubAdminController;
use App\Http\Controllers\Admin\GroupCourseController;
use App\Http\Controllers\SubAdminDashboardController;
use App\Http\Controllers\Admin\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Vite asset proxy routes (must be BEFORE other routes)
Route::get('/@vite/{path}', [ViteProxyController::class, 'proxy'])->where('path', '.*');
Route::get('/resources/{path}', [ViteProxyController::class, 'proxy'])->where('path', '.*');
Route::get('/@react-refresh', [ViteProxyController::class, 'proxy']);

// Public Routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// Features page
Route::get('/features', function () {
    return Inertia::render('Features');
})->name('features');

// Pricing page
Route::get('/pricing', function () {
    return Inertia::render('Pricing');
})->name('pricing');

// About page
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

// Terms & Conditions page
Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

// Privacy Policy page
Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

// Public course browsing
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');

// CSRF token refresh route
Route::get('/csrf-token', function() {
    return response()->json([
        'csrf_token' => csrf_token(),
        'status' => 'success'
    ]);
})->name('csrf.token');

// Health check route to test functionality
Route::get('/health-check', function() {
    return response()->json([
        'status' => 'ok',
        'courses_count' => \App\Models\Course::count(),
        'app_name' => config('app.name'),
        'timestamp' => now()->toISOString()
    ]);
});


// Auth required routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/profile/settings', [ProfileController::class, 'settings'])->name('profile.settings');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Course Enrollment & Learning
    Route::post('/courses/{course:slug}/enroll', [EnrollmentController::class, 'store'])->name('courses.enroll');
    Route::get('/my-courses', [EnrollmentController::class, 'index'])->name('my-courses');
    Route::get('/learn/{course:slug}', [EnrollmentController::class, 'learn'])->name('courses.learn');
    Route::post('/lessons/{lesson}/complete', [EnrollmentController::class, 'completeLesson'])->name('lessons.complete');
    Route::post('/progress/update', [EnrollmentController::class, 'updateProgress'])->name('progress.update');
    
    // Quizzes & Assignments - General access for all authenticated users
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::post('/quizzes/{quiz}/start', [QuizController::class, 'start'])->name('quizzes.start');
    Route::get('/quizzes/{quiz}/take', [QuizController::class, 'take'])->name('quizzes.take');
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit'])->name('quizzes.submit');
    Route::get('/quizzes/{quiz}/result/{attempt}', [QuizController::class, 'result'])->name('quizzes.result');
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->name('assignments.submit');
    Route::get('/assignments/{assignment}/submission', [AssignmentController::class, 'viewSubmission'])->name('assignments.submission');
    
    // Reviews & Ratings
    Route::post('/courses/{course}/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    
    // Shopping Cart & Orders
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add/{course}', [CartController::class, 'add'])->name('cart.add');
    Route::delete('/cart/remove/{item}', [CartController::class, 'remove'])->name('cart.remove');
    Route::delete('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');
    Route::get('/cart/count', [CartController::class, 'count'])->name('cart.count');
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'index'])->name('checkout.post');
    Route::post('/checkout/process', [CheckoutController::class, 'processPayment'])->name('checkout.process');
    
    // Midtrans payment routes
    Route::get('/payment/success', [CheckoutController::class, 'paymentSuccess'])->name('payment.success');
    Route::get('/payment/failed', [CheckoutController::class, 'paymentFailed'])->name('payment.failed');
    Route::get('/payment/finish', [CheckoutController::class, 'paymentFinish'])->name('payment.finish');
    Route::get('/payment/unfinish', [CheckoutController::class, 'paymentUnfinish'])->name('payment.unfinish'); 
    Route::get('/payment/error', [CheckoutController::class, 'paymentError'])->name('payment.error');
    
    // GoPay Payment routes (both regular GoPay and QRIS)
    Route::post('/payment/gopay/create', [PaymentController::class, 'createGoPayPayment'])->name('payment.gopay.create');
    Route::post('/payment/static-qris/create', [PaymentController::class, 'createStaticQRISPayment'])->name('payment.static-qris.create');
    Route::post('/payment/static-qris/confirm', [PaymentController::class, 'confirmStaticQRISPayment'])->name('payment.static-qris.confirm');
    // Legacy QRIS routes for backward compatibility
    Route::post('/payment/qris/create', [PaymentController::class, 'createQRISPayment'])->name('payment.qris.create');
    Route::get('/payment/qris/status', [PaymentController::class, 'checkPaymentStatus'])->name('payment.qris.status');
    Route::get('/payment/qris/generate', [PaymentController::class, 'generateQRCode'])->name('payment.qris.generate');
    Route::get('/payment/test-connection', [PaymentController::class, 'testConnection'])->name('payment.test.connection');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    
    // Payments
    Route::post('/payments', [PaymentController::class, 'process'])->name('payments.process');
    Route::get('/payments/{payment}/success', [PaymentController::class, 'success'])->name('payments.success');
    Route::get('/payments/{payment}/cancel', [PaymentController::class, 'cancel'])->name('payments.cancel');
    
    // Certificates
    Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('/certificates/{certificate}', [CertificateController::class, 'show'])->name('certificates.show');
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
    
    // Forum
    Route::get('/forum', [ForumController::class, 'index'])->name('forum.index');
    Route::get('/forum/{topic}', [ForumController::class, 'show'])->name('forum.show');
    Route::post('/forum/topics', [ForumController::class, 'store'])->name('forum.store');
    Route::post('/forum/{topic}/replies', [ForumController::class, 'reply'])->name('forum.reply');
    
    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show'])->name('announcements.show');
    
    // Messages - Moved to role-specific route groups below
    // (Removed to avoid route conflicts)
});

// Instructor Routes
Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/dashboard', [InstructorController::class, 'dashboard'])->name('dashboard');
    Route::get('/courses', [InstructorController::class, 'courses'])->name('courses.index');
    Route::get('/courses/create', [InstructorController::class, 'createCourse'])->name('courses.create');
    Route::post('/courses', [InstructorController::class, 'storeCourse'])->name('courses.store');
    Route::get('/courses/{course}/edit', [InstructorController::class, 'editCourse'])->name('courses.edit');
    Route::put('/courses/{course}', [InstructorController::class, 'updateCourse'])->name('courses.update');
    Route::delete('/courses/{course}', [InstructorController::class, 'destroyCourse'])->name('courses.destroy');

    // Course Content Management
    Route::get('/courses/{course}/lessons', [InstructorController::class, 'lessons'])->name('courses.lessons');
    Route::post('/courses/{course}/lessons', [LessonController::class, 'store'])->name('lessons.store');
    Route::put('/lessons/{lesson}', [LessonController::class, 'update'])->name('lessons.update');
    Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');

    // Quiz Management
    Route::get('/courses/{course}/quizzes', [InstructorController::class, 'quizzes'])->name('courses.quizzes');
    Route::post('/courses/{course}/quizzes', [QuizController::class, 'store'])->name('quizzes.store');
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update'])->name('quizzes.update');
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy'])->name('quizzes.destroy');

    // Assignment Management
    Route::get('/courses/{course}/assignments', [InstructorController::class, 'assignments'])->name('courses.assignments');
    Route::post('/courses/{course}/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
    Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');

    // Messaging Routes for Instructor
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/create', [MessageController::class, 'create'])->name('messages.create');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/{conversation}', [MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/{conversation}/send', [MessageController::class, 'sendMessage'])->name('messages.send');
    Route::post('/messages/{conversation}/typing', [MessageController::class, 'typing'])->name('messages.typing');
    Route::get('/messages/{conversation}/messages', [MessageController::class, 'getMessages'])->name('messages.get');
    Route::post('/messages/{conversation}/read', [MessageController::class, 'markAsRead'])->name('messages.read');

    // Analytics
    Route::get('/analytics', [InstructorController::class, 'analytics'])->name('analytics');
    Route::get('/students', [InstructorController::class, 'students'])->name('students');
});

// Student Routes
Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentController::class, 'dashboard'])->name('dashboard');
    Route::get('/progress', [StudentController::class, 'progress'])->name('progress');
    Route::get('/achievements', [StudentController::class, 'achievements'])->name('achievements');
    Route::get('/my-learning', [StudentController::class, 'myLearning'])->name('my-learning');
    Route::get('/browse-courses', [StudentController::class, 'browseCourses'])->name('browse-courses');
    Route::get('/certificates', [StudentController::class, 'certificates'])->name('certificates');
    Route::get('/certificates/{certificate}', [StudentController::class, 'viewCertificate'])->name('certificates.view');
    Route::get('/certificates/{certificate}/download', [StudentController::class, 'downloadCertificate'])->name('certificates.download');

    // Messaging Routes for Student
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/create', [MessageController::class, 'create'])->name('messages.create');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/{conversation}', [MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/{conversation}/send', [MessageController::class, 'sendMessage'])->name('messages.send');
    Route::post('/messages/{conversation}/typing', [MessageController::class, 'typing'])->name('messages.typing');
    Route::get('/messages/{conversation}/messages', [MessageController::class, 'getMessages'])->name('messages.get');
    Route::post('/messages/{conversation}/read', [MessageController::class, 'markAsRead'])->name('messages.read');

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Course Study Routes
    Route::get('/courses/{course}/study', [CourseController::class, 'study'])->name('courses.study');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'markComplete'])->name('lessons.complete');
    
    // Assignment and Quiz Routes - using general routes above
});

// Temporary test route without role middleware for debugging
Route::middleware(['auth', 'verified'])->get('/student-test/browse-courses', [StudentController::class, 'browseCourses']);

// Sub Admin Routes
Route::middleware(['auth', 'verified', 'role:sub_admin'])->prefix('subadmin')->name('subadmin.')->group(function () {
    Route::get('/dashboard', [SubAdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/students', [SubAdminDashboardController::class, 'students'])->name('students');
    Route::get('/students/{student}', [SubAdminDashboardController::class, 'studentDetail'])->name('students.show');
    Route::get('/students/{student}/progress', [SubAdminDashboardController::class, 'studentProgress'])->name('students.progress');
    Route::get('/progress', [SubAdminDashboardController::class, 'progressTracking'])->name('progress');

    // Messaging Routes for Sub Admin
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/create', [MessageController::class, 'create'])->name('messages.create');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/{conversation}', [MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/{conversation}/send', [MessageController::class, 'sendMessage'])->name('messages.send');
    Route::post('/messages/{conversation}/typing', [MessageController::class, 'typing'])->name('messages.typing');
    Route::get('/messages/{conversation}/messages', [MessageController::class, 'getMessages'])->name('messages.get');
    Route::post('/messages/{conversation}/read', [MessageController::class, 'markAsRead'])->name('messages.read');
});

// Admin Routes - Fixed middleware for admin access
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Messaging Routes for Admin
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/create', [MessageController::class, 'create'])->name('messages.create');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/{conversation}', [MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/{conversation}/send', [MessageController::class, 'sendMessage'])->name('messages.send');
    Route::post('/messages/{conversation}/typing', [MessageController::class, 'typing'])->name('messages.typing');
    Route::get('/messages/{conversation}/messages', [MessageController::class, 'getMessages'])->name('messages.get');
    Route::post('/messages/{conversation}/read', [MessageController::class, 'markAsRead'])->name('messages.read');

    // Notification Routes for Admin
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // User Management - SPECIFIC ROUTES FIRST (before wildcard routes)
    
    // Instructor Management (must come before /users/{user} wildcard)
    Route::get('/users/instructors', [UserManagementController::class, 'instructors'])->name('users.instructors');
    Route::get('/users/instructors/export', [UserManagementController::class, 'exportInstructors'])->name('users.instructors.export');
    Route::get('/users/instructors/create', [UserManagementController::class, 'createInstructor'])->name('users.instructors.create');
    Route::post('/users/instructors', [UserManagementController::class, 'storeInstructor'])->name('users.instructors.store');
    Route::get('/users/instructors/{user}', [UserManagementController::class, 'showInstructor'])->name('users.instructors.show');
    Route::get('/users/instructors/{user}/edit', [UserManagementController::class, 'editInstructor'])->name('users.instructors.edit');
    Route::put('/users/instructors/{user}', [UserManagementController::class, 'updateInstructor'])->name('users.instructors.update');
    Route::delete('/users/instructors/{user}', [UserManagementController::class, 'destroyInstructor'])->name('users.instructors.destroy');
    
    // Student Management (must come before /users/{user} wildcard)
    Route::get('/users/students', [UserManagementController::class, 'students'])->name('users.students');
    Route::get('/users/students/export', [UserManagementController::class, 'exportStudents'])->name('users.students.export');
    Route::get('/users/students/create', [UserManagementController::class, 'createStudent'])->name('users.students.create');
    Route::post('/users/students', [UserManagementController::class, 'storeStudent'])->name('users.students.store');
    Route::get('/users/students/{user}', [UserManagementController::class, 'showStudent'])->name('users.students.show');
    Route::get('/users/students/{user}/debug', [UserManagementController::class, 'debugStudentEnrollments'])->name('users.students.debug');
    Route::post('/users/students/{user}/force-sync', [UserManagementController::class, 'forceSyncStudentEnrollments'])->name('users.students.force-sync');
    Route::post('/users/students/{user}/test-access', [UserManagementController::class, 'testCourseAccess'])->name('users.students.test-access');
    Route::get('/users/students/{user}/edit', [UserManagementController::class, 'editStudent'])->name('users.students.edit');
    Route::put('/users/students/{user}', [UserManagementController::class, 'updateStudent'])->name('users.students.update');
    Route::delete('/users/students/{user}', [UserManagementController::class, 'destroyStudent'])->name('users.students.destroy');

    // Bulk User Operations
    Route::post('/users/bulk-update', [UserManagementController::class, 'bulkUpdate'])->name('users.bulk-update');
    Route::post('/users/bulk-delete', [UserManagementController::class, 'bulkDelete'])->name('users.bulk-delete');

    // Sub Admin Management (must come before /users/{user} wildcard)
    Route::get('/sub-admins', [SubAdminController::class, 'index'])->name('sub-admins.index');
    Route::get('/sub-admins/create', [SubAdminController::class, 'create'])->name('sub-admins.create');
    Route::post('/sub-admins', [SubAdminController::class, 'store'])->name('sub-admins.store');
    Route::get('/sub-admins/{subAdmin}', [SubAdminController::class, 'show'])->name('sub-admins.show');
    Route::get('/sub-admins/{subAdmin}/edit', [SubAdminController::class, 'edit'])->name('sub-admins.edit');
    Route::put('/sub-admins/{subAdmin}', [SubAdminController::class, 'update'])->name('sub-admins.update');
    Route::delete('/sub-admins/{subAdmin}', [SubAdminController::class, 'destroy'])->name('sub-admins.destroy');
    
    // Sub Admin Group Management Routes
    Route::post('/sub-admins/groups', [SubAdminController::class, 'storeGroup'])->name('sub-admins.groups.store');
    Route::get('/sub-admins/groups/list', [SubAdminController::class, 'getGroups'])->name('sub-admins.groups.list');
    
    // Group Management (Full CRUD)
    Route::get('/groups', [App\Http\Controllers\Admin\GroupController::class, 'index'])->name('groups.index');
    Route::get('/groups/create', [App\Http\Controllers\Admin\GroupController::class, 'create'])->name('groups.create');
    Route::post('/groups', [App\Http\Controllers\Admin\GroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/{group}', [App\Http\Controllers\Admin\GroupController::class, 'show'])->name('groups.show');
    Route::get('/groups/{group}/edit', [App\Http\Controllers\Admin\GroupController::class, 'edit'])->name('groups.edit');
    Route::put('/groups/{group}', [App\Http\Controllers\Admin\GroupController::class, 'update'])->name('groups.update');
    Route::delete('/groups/{group}', [App\Http\Controllers\Admin\GroupController::class, 'destroy'])->name('groups.destroy');
    
    // Group API Routes
    Route::get('/api/groups', [App\Http\Controllers\Admin\GroupController::class, 'getGroups'])->name('groups.api.list');
    Route::post('/groups/bulk-action', [App\Http\Controllers\Admin\GroupController::class, 'bulkAction'])->name('groups.bulk-action');
    
    // Group Course Assignment Routes
    Route::get('/groups/{group}/courses', [GroupCourseController::class, 'index'])->name('groups.courses.index');
    Route::post('/groups/{group}/courses/assign', [GroupCourseController::class, 'assignCourse'])->name('groups.courses.assign');
    Route::delete('/groups/{group}/courses/{course}', [GroupCourseController::class, 'removeCourse'])->name('groups.courses.remove');
    Route::put('/groups/{group}/courses/{course}', [GroupCourseController::class, 'updateCourse'])->name('groups.courses.update');
    Route::get('/groups/{group}/courses/available', [GroupCourseController::class, 'getAvailableCourses'])->name('groups.courses.available');
    Route::post('/groups/{group}/courses/bulk-assign', [GroupCourseController::class, 'bulkAssignCourses'])->name('groups.courses.bulk-assign');
    
    // General User Management (wildcard routes LAST)
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserManagementController::class, 'show'])->name('users.show');
    Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/roles', [UserManagementController::class, 'assignRole'])->name('users.assign-role');
    
    // Course Content Management (must be BEFORE resource routes to avoid conflicts)
    Route::get('/courses/{course:slug}/content', [App\Http\Controllers\Admin\CourseContentController::class, 'show'])->name('courses.content');

    // Course Preview Routes - Preview course as student
    Route::get('/courses/{course:slug}/preview', [App\Http\Controllers\Admin\CourseController::class, 'preview'])->name('courses.preview');
    Route::get('/courses/{course:slug}/preview-enrolled', [App\Http\Controllers\Admin\CourseController::class, 'previewEnrolled'])->name('courses.preview-enrolled');

    // Chunked Upload Routes
    Route::post('/chunked-upload/start', [App\Http\Controllers\Admin\ChunkedUploadController::class, 'start'])->name('chunked-upload.start');
    Route::post('/chunked-upload/chunk', [App\Http\Controllers\Admin\ChunkedUploadController::class, 'uploadChunk'])->name('chunked-upload.chunk');
    Route::get('/chunked-upload/status', [App\Http\Controllers\Admin\ChunkedUploadController::class, 'status'])->name('chunked-upload.status');
    Route::post('/chunked-upload/complete', [App\Http\Controllers\Admin\ChunkedUploadController::class, 'complete'])->name('chunked-upload.complete');
    Route::post('/chunked-upload/cancel', [App\Http\Controllers\Admin\ChunkedUploadController::class, 'cancel'])->name('chunked-upload.cancel');

    // Course Access Management (Private Courses) 
    Route::get('/courses/{course}/access', [App\Http\Controllers\Admin\CourseAccessController::class, 'show'])->name('courses.access');
    Route::post('/courses/{course}/access/grant', [App\Http\Controllers\Admin\CourseAccessController::class, 'grantAccess'])->name('courses.access.grant');
    Route::delete('/courses/{course}/access/{access}', [App\Http\Controllers\Admin\CourseAccessController::class, 'revokeAccess'])->name('courses.access.revoke');
    Route::put('/courses/{course}/access/{access}', [App\Http\Controllers\Admin\CourseAccessController::class, 'updateAccess'])->name('courses.access.update');
    Route::post('/courses/{course}/access/bulk-grant', [App\Http\Controllers\Admin\CourseAccessController::class, 'bulkGrant'])->name('courses.access.bulk-grant');
    
    // All other course content routes
    Route::post('/courses/{course}/sections', [App\Http\Controllers\Admin\CourseContentController::class, 'storeSection'])->name('courses.sections.store');
    Route::put('/courses/{course}/sections/{section}', [App\Http\Controllers\Admin\CourseContentController::class, 'updateSection'])->name('courses.sections.update');
    Route::delete('/courses/{course}/sections/{section}', [App\Http\Controllers\Admin\CourseContentController::class, 'deleteSection'])->name('courses.sections.destroy');
    
    Route::post('/courses/{course}/sections/{section}/lessons', [App\Http\Controllers\Admin\CourseContentController::class, 'storeLesson'])->name('courses.lessons.store');
    Route::put('/courses/{course}/sections/{section}/lessons/{lesson}', [App\Http\Controllers\Admin\CourseContentController::class, 'updateLesson'])->name('courses.lessons.update');
    Route::delete('/courses/{course}/sections/{section}/lessons/{lesson}', [App\Http\Controllers\Admin\CourseContentController::class, 'deleteLesson'])->name('courses.lessons.destroy');
    
    Route::post('/courses/{course}/sections/{section}/assignments', [App\Http\Controllers\Admin\CourseContentController::class, 'storeAssignment'])->name('courses.assignments.store');
    Route::put('/courses/{course}/sections/{section}/assignments/{assignment}', [App\Http\Controllers\Admin\CourseContentController::class, 'updateAssignment'])->name('courses.assignments.update');
    Route::delete('/courses/{course}/sections/{section}/assignments/{assignment}', [App\Http\Controllers\Admin\CourseContentController::class, 'deleteAssignment'])->name('courses.assignments.destroy');
    
    Route::post('/courses/{course}/sections/{section}/quizzes', [App\Http\Controllers\Admin\CourseContentController::class, 'storeQuiz'])->name('courses.quizzes.store');
    Route::put('/courses/{course}/sections/{section}/quizzes/{quiz}', [App\Http\Controllers\Admin\CourseContentController::class, 'updateQuiz'])->name('courses.quizzes.update');
    Route::delete('/courses/{course}/sections/{section}/quizzes/{quiz}', [App\Http\Controllers\Admin\CourseContentController::class, 'deleteQuiz'])->name('courses.quizzes.destroy');

    // Meeting Routes (in content management context)
    Route::post('/courses/{course}/sections/{section}/meetings', [App\Http\Controllers\Admin\CourseContentController::class, 'storeMeeting'])->name('courses.meetings.store');
    Route::put('/courses/{course}/sections/{section}/meetings/{meeting}', [App\Http\Controllers\Admin\CourseContentController::class, 'updateMeeting'])->name('courses.meetings.update');
    Route::delete('/courses/{course}/sections/{section}/meetings/{meeting}', [App\Http\Controllers\Admin\CourseContentController::class, 'deleteMeeting'])->name('courses.meetings.destroy');
    Route::post('/meetings/{meeting}/send-alert', [App\Http\Controllers\Admin\CourseContentController::class, 'sendMeetingAlert'])->name('courses.meetings.send-alert');
    Route::get('/meetings/{meeting}/enrolled-students', [App\Http\Controllers\Admin\CourseContentController::class, 'getMeetingEnrolledStudents'])->name('courses.meetings.enrolled-students');

    // Quiz Import Routes
    Route::get('/quiz/import/template', [App\Http\Controllers\Admin\QuizImportController::class, 'downloadTemplate'])->name('quiz.import.template');
    Route::post('/courses/{course}/sections/{section}/quizzes/import', [App\Http\Controllers\Admin\QuizImportController::class, 'import'])->name('courses.quizzes.import');

    // Reordering routes
    Route::post('/courses/{course}/sections/reorder', [App\Http\Controllers\Admin\CourseContentController::class, 'reorderSections'])->name('courses.sections.reorder');
    Route::post('/courses/{course}/sections/{section}/lessons/reorder', [App\Http\Controllers\Admin\CourseContentController::class, 'reorderLessons'])->name('courses.lessons.reorder');
    Route::post('/courses/{course}/sections/{section}/move', [App\Http\Controllers\Admin\CourseContentController::class, 'moveSectionOrder'])->name('courses.sections.move');
    Route::post('/courses/{course}/sections/{section}/lessons/{lesson}/move', [App\Http\Controllers\Admin\CourseContentController::class, 'moveLessonOrder'])->name('courses.lessons.move');
    
    // Custom route for course update with file upload (POST method) - Use ID instead of model binding
    Route::post('/courses/{id}/update', [App\Http\Controllers\Admin\CourseController::class, 'updateById'])->name('courses.update-post');
    
    // Course export route
    Route::get('/courses/export', [App\Http\Controllers\Admin\CourseController::class, 'export'])->name('courses.export');
    
    // Course Management (Full CRUD) - Exclude 'show' to avoid conflicts with custom routes
    Route::resource('courses', App\Http\Controllers\Admin\CourseController::class)->except(['show']);
    
    // Category Management
    Route::get('/categories', [CategoryController::class, 'adminIndex'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Course Type Management
    Route::prefix('course-types')->name('course-types.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\CourseTypeController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\Admin\CourseTypeController::class, 'store'])->name('store');
        Route::put('/{courseType}', [App\Http\Controllers\Admin\CourseTypeController::class, 'update'])->name('update');
        Route::delete('/{courseType}', [App\Http\Controllers\Admin\CourseTypeController::class, 'destroy'])->name('destroy');
        Route::post('/{courseType}/toggle-active', [App\Http\Controllers\Admin\CourseTypeController::class, 'toggleActive'])->name('toggle-active');
        Route::post('/update-order', [App\Http\Controllers\Admin\CourseTypeController::class, 'updateOrder'])->name('update-order');
    });

    // Meeting Management
    Route::prefix('courses/{course}/meetings')->name('meetings.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\MeetingController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\Admin\MeetingController::class, 'store'])->name('store');
        Route::put('/{meeting}', [App\Http\Controllers\Admin\MeetingController::class, 'update'])->name('update');
        Route::delete('/{meeting}', [App\Http\Controllers\Admin\MeetingController::class, 'destroy'])->name('destroy');
        Route::post('/{meeting}/upload-proof', [App\Http\Controllers\Admin\MeetingController::class, 'uploadAttendanceProof'])->name('upload-proof');
        Route::get('/{meeting}/attendance', [App\Http\Controllers\Admin\MeetingController::class, 'showAttendance'])->name('attendance');
        Route::post('/{meeting}/mark-attendance', [App\Http\Controllers\Admin\MeetingController::class, 'markAttendance'])->name('mark-attendance');
        Route::post('/{meeting}/send-alert', [App\Http\Controllers\Admin\MeetingController::class, 'sendAlert'])->name('send-alert');
        Route::get('/{meeting}/enrolled-students', [App\Http\Controllers\Admin\MeetingController::class, 'getEnrolledStudents'])->name('enrolled-students');
    });

    // Certificate Queue Management
    Route::prefix('certificate-queue')->name('certificate-queue.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\CertificateQueueController::class, 'index'])->name('index');
        Route::get('/{certificate}', [App\Http\Controllers\Admin\CertificateQueueController::class, 'show'])->name('show');
        Route::post('/{certificate}/approve', [App\Http\Controllers\Admin\CertificateQueueController::class, 'approve'])->name('approve');
        Route::post('/{certificate}/reject', [App\Http\Controllers\Admin\CertificateQueueController::class, 'reject'])->name('reject');
        Route::post('/{certificate}/recalculate-attendance', [App\Http\Controllers\Admin\CertificateQueueController::class, 'recalculateAttendance'])->name('recalculate-attendance');
        Route::get('/api/pending-count', [App\Http\Controllers\Admin\CertificateQueueController::class, 'getPendingCount'])->name('pending-count');
    });

    // Reports & Analytics
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/users', [ReportController::class, 'users'])->name('reports.users');
    Route::get('/reports/courses', [ReportController::class, 'courses'])->name('reports.courses');
    Route::get('/reports/revenue', [ReportController::class, 'revenue'])->name('reports.revenue');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::get('/analytics', [AnalyticsController::class, 'admin'])->name('analytics');
    
    // System Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    
    // Settings Management with sub-pages
    Route::get('/settings/payment', [SettingController::class, 'payment'])->name('settings.payment');
    Route::put('/settings/payment', [SettingController::class, 'updatePayment'])->name('settings.payment.update');
    Route::get('/settings/smtp', [SettingController::class, 'smtp'])->name('settings.smtp');
    Route::put('/settings/smtp', [SettingController::class, 'updateSmtp'])->name('settings.smtp.update');
    Route::get('/settings/social', [SettingController::class, 'social'])->name('settings.social');
    Route::put('/settings/social', [SettingController::class, 'updateSocial'])->name('settings.social.update');
    
    // Course Monitoring - Main Entry Point
    Route::get('/monitoring', [App\Http\Controllers\Admin\CourseMonitoringController::class, 'index'])->name('monitoring.index');
    Route::get('/monitoring/courses/{course}', [App\Http\Controllers\Admin\CourseMonitoringController::class, 'show'])->name('monitoring.courses.show');
    
    // Assignment Monitoring
    Route::get('/assignments/monitoring', [App\Http\Controllers\Admin\AssignmentMonitoringController::class, 'index'])->name('assignments.monitoring.index');
    Route::get('/assignments/monitoring/{assignment}', [App\Http\Controllers\Admin\AssignmentMonitoringController::class, 'show'])->name('assignments.monitoring.show');
    Route::post('/assignments/{assignment}/submissions/{submission}/grade', [App\Http\Controllers\Admin\AssignmentMonitoringController::class, 'gradeSubmission'])->name('assignments.submissions.grade');
    Route::get('/assignments/{assignment}/submissions/{submission}/download', [App\Http\Controllers\Admin\AssignmentMonitoringController::class, 'downloadSubmission'])->name('assignments.submissions.download');
    Route::get('/assignments/{assignment}/export-grades', [App\Http\Controllers\Admin\AssignmentMonitoringController::class, 'exportGrades'])->name('assignments.export-grades');

    // Quiz Monitoring
    Route::get('/quizzes/monitoring', [App\Http\Controllers\Admin\QuizMonitoringController::class, 'index'])->name('quizzes.monitoring.index');
    Route::get('/quizzes/monitoring/{quiz}', [App\Http\Controllers\Admin\QuizMonitoringController::class, 'show'])->name('quizzes.monitoring.show');
    Route::get('/quizzes/monitoring/{quiz}/attempts/{attempt}', [App\Http\Controllers\Admin\QuizMonitoringController::class, 'showAttempt'])->name('quizzes.monitoring.attempt');
    Route::get('/quizzes/monitoring/{quiz}/attempts/{attempt}/edit', [App\Http\Controllers\Admin\QuizMonitoringController::class, 'editAttempt'])->name('quizzes.monitoring.edit-attempt');
    Route::put('/quizzes/monitoring/{quiz}/attempts/{attempt}', [App\Http\Controllers\Admin\QuizMonitoringController::class, 'updateAttempt'])->name('quizzes.monitoring.update-attempt');
    Route::delete('/quizzes/monitoring/{quiz}/attempts/{attempt}', [App\Http\Controllers\Admin\QuizMonitoringController::class, 'deleteAttempt'])->name('quizzes.monitoring.delete-attempt');
    Route::get('/quizzes/{quiz}/export-results', [App\Http\Controllers\Admin\QuizMonitoringController::class, 'exportResults'])->name('quizzes.export-results');

    // Announcements Management
    Route::get('/announcements', [AnnouncementController::class, 'adminIndex'])->name('announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    
    // Enrollment Management - Riwayat Pendaftaran
    Route::get('/enrollments/export', [\App\Http\Controllers\Admin\EnrollmentController::class, 'export'])->name('enrollments.export');
    Route::get('/enrollments', [\App\Http\Controllers\Admin\EnrollmentController::class, 'index'])->name('enrollments.index');
    Route::get('/enrollments/{enrollment}', [\App\Http\Controllers\Admin\EnrollmentController::class, 'show'])->name('enrollments.show');
    Route::put('/enrollments/{enrollment}/status', [\App\Http\Controllers\Admin\EnrollmentController::class, 'updateStatus'])->name('enrollments.update-status');
    
    // Certificate Management
    Route::get('/certificates', [\App\Http\Controllers\Admin\CertificateController::class, 'index'])->name('certificates.index');
    Route::post('/certificates', [\App\Http\Controllers\Admin\CertificateController::class, 'store'])->name('certificates.store');
    Route::delete('/certificates/{certificate}', [\App\Http\Controllers\Admin\CertificateController::class, 'destroy'])->name('certificates.destroy');
    Route::get('/certificates/{certificate}/download', [\App\Http\Controllers\Admin\CertificateController::class, 'download'])->name('certificates.download');
    
});

// Debug route - remove after fixing issue
Route::middleware(['auth'])->get('/debug/user', function() {
    $user = auth()->user();
    $user->load('roles');
    return response()->json([
        'user' => $user,
        'roles' => $user->roles->pluck('name'),
        'is_admin' => $user->hasRole('admin'),
        'routes' => [
            'admin.users.students' => route('admin.users.students'),
        ]
    ]);
});

// Debug route to test students page without middleware
Route::middleware(['auth'])->get('/debug/students', function() {
    try {
        $controller = new \App\Http\Controllers\Admin\UserManagementController();
        $request = new \Illuminate\Http\Request();
        return $controller->students($request);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
});

// Test imports fix
Route::get('/test-imports', function() {
    try {
        $admin = \App\Models\User::where('email', 'admin@example.com')->first();
        if ($admin) {
            auth()->login($admin);
        }
        
        $controller = new \App\Http\Controllers\Admin\UserManagementController();
        $request = new \Illuminate\Http\Request();
        
        // Test students method
        $studentsResult = $controller->students($request);
        $instructorsResult = $controller->instructors($request);
        
        return response()->json([
            'status' => 'success',
            'message' => 'All imports working correctly'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile())
        ], 500);
    }
});

// Auto login as admin for testing - REMOVE IN PRODUCTION
Route::get('/debug/login-admin', function() {
    // Try multiple admin emails
    $admin = \App\Models\User::whereIn('email', ['admin@lmsbdi.com', 'admin@example.com', 'test@admin.com'])
        ->whereHas('roles', function($q) {
            $q->where('name', 'admin');
        })
        ->first();

    if ($admin) {
        auth()->login($admin);
        return redirect('/messages')->with('success', 'Logged in as ' . $admin->email);
    }

    // Show available users for debugging
    $allAdmins = \App\Models\User::whereHas('roles', function($q) {
        $q->where('name', 'admin');
    })->get(['id', 'email', 'first_name', 'last_name']);

    return response()->json([
        'error' => 'No admin user found',
        'available_admins' => $allAdmins,
        'suggestion' => 'Try logging in manually at /login with one of the admin emails above'
    ]);
});

// Auto login as student for testing - REMOVE IN PRODUCTION
Route::get('/debug/login-student', function() {
    $student = \App\Models\User::where('email', 'dedi.kurniawan@student.com')->first();
    if ($student) {
        auth()->login($student);
        return redirect('/my-courses')->with('success', 'Logged in as student for testing');
    }
    return response()->json(['error' => 'Student user not found. Run seeder first.']);
});

// Test My Courses data
Route::middleware(['auth'])->get('/debug/my-courses', function() {
    try {
        $user = auth()->user();
        $controller = new \App\Http\Controllers\EnrollmentController();
        $result = $controller->index();

        // Grab data from Inertia response to debug
        return response()->json([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'component' => 'Student/MyCourses',
            'status' => 'success',
            'message' => 'My Courses controller working correctly'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile())
        ], 500);
    }
});

// DEMO routes removed - using production routes now

// Test course learn routing without middleware
Route::get('/debug/learn/{courseSlug}', function($courseSlug) {
    try {
        $course = \App\Models\Course::where('slug', $courseSlug)->first();
        if (!$course) {
            return response()->json(['error' => 'Course not found with slug: ' . $courseSlug], 404);
        }

        // Login user
        $user = \App\Models\User::first();
        auth()->login($user);

        $controller = new \App\Http\Controllers\EnrollmentController(app(\App\Services\ProgressTrackingService::class));
        $request = new \Illuminate\Http\Request();
        $request->merge(['lesson' => null]); // No specific lesson

        $result = $controller->learn($request, $course);

        return response()->json([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'course_slug' => $course->slug,
            'course_title' => $course->title,
            'component' => 'Student/Learn',
            'status' => 'success',
            'message' => 'Course learn controller working correctly'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile())
        ], 500);
    }
});

// Simple HTML test for students page
Route::get('/admin/users/students-test', function() {
    try {
        $students = \App\Models\User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
                  ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                  ->where('roles.name', 'student')
                  ->select('users.*')
                  ->limit(10)
                  ->get();

        $html = '<!DOCTYPE html>
<html>
<head>
    <title>Students Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .btn { padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
    </style>
</head>
<body>
    <h1>Students Management Test</h1>
    <p>Total Students: ' . $students->count() . '</p>
    
    <div style="margin: 20px 0;">
        <a href="/admin/users/students" class="btn">Try Inertia Route</a>
        <a href="/debug/students" class="btn">Test Controller</a>
        <a href="/debug/user" class="btn">Check User</a>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
            </tr>
        </thead>
        <tbody>';

        foreach($students as $student) {
            $html .= '<tr>
                <td>' . $student->id . '</td>
                <td>' . $student->first_name . ' ' . $student->last_name . '</td>
                <td>' . $student->email . '</td>
                <td>' . ($student->is_active ? 'Active' : 'Inactive') . '</td>
                <td>' . $student->created_at . '</td>
            </tr>';
        }

        $html .= '</tbody>
    </table>
</body>
</html>';

        return response($html);
    } catch (\Exception $e) {
        return response('<h1>Error</h1><p>' . $e->getMessage() . '</p><pre>' . $e->getTraceAsString() . '</pre>');
    }
});

// Test Inertia rendering with simple component
Route::get('/admin/users/students-inertia-test', function() {
    try {
        return \Inertia\Inertia::render('Admin/Users/StudentsTest', [
            'message' => 'This is a test page'
        ]);
    } catch (\Exception $e) {
        return response('<h1>Inertia Error</h1><p>' . $e->getMessage() . '</p><pre>' . $e->getTraceAsString() . '</pre>');
    }
});

// Test enrollment data directly  
Route::get('/test-enrollment', function() {
    try {
        $enrollments = App\Models\Enrollment::with(['user', 'course'])->take(5)->get();
        
        return Inertia\Inertia::render('Admin/Enrollments/Index', [
            'enrollments' => [
                'data' => $enrollments,
                'total' => $enrollments->count(),
                'from' => 1,
                'to' => $enrollments->count(),
                'last_page' => 1,
                'links' => []
            ],
            'stats' => [
                'total' => 90,
                'active' => 60,
                'completed' => 20,
                'cancelled' => 10,
                'this_month' => 15,
                'growth_percentage' => 5.2,
                'completion_rate' => 22.2
            ],
            'courses' => App\Models\Course::select('id', 'title')->get(),
            'filters' => [
                'search' => '',
                'status' => '',
                'course' => '',
                'date_range' => '',
                'per_page' => 15,
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


// Simple HTML test for course content
Route::get('/test/course-content-html', function() {
    $courses = \App\Models\Course::all(['id', 'title']);
    
    $html = '<!DOCTYPE html>
<html>
<head>
    <title>Course Content Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .btn { padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 5px; display: inline-block; }
        .course-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>Course Content Management Test</h1>
    <p>Available Courses:</p>';
    
    foreach($courses as $course) {
        $contentUrl = route('admin.courses.content', $course->id);
        $html .= '<div class="course-card">
            <h3>' . $course->title . '</h3>
            <a href="' . $contentUrl . '" class="btn">Manage Content (Route: ' . $contentUrl . ')</a>
            <a href="/admin/courses/' . $course->id . '/content" class="btn">Direct URL</a>
        </div>';
    }
    
    $html .= '</body></html>';
    
    return response($html);
});

// Test course content controller
Route::middleware(['auth'])->get('/test/course-content/{course}', function($courseId) {
    try {
        $course = \App\Models\Course::with([
            'sections.lessons' => function($query) {
                $query->orderBy('sort_order');
            },
            'sections.assignments' => function($query) {
                $query->orderBy('sort_order');
            },
            'sections.quizzes' => function($query) {
                $query->orderBy('sort_order');
            }
        ])->findOrFail($courseId);

        return response()->json([
            'course_id' => $course->id,
            'course_title' => $course->title,
            'sections_count' => $course->sections->count(),
            'sections' => $course->sections->map(function($section) {
                return [
                    'id' => $section->id,
                    'title' => $section->title,
                    'lessons_count' => $section->lessons->count(),
                    'assignments_count' => $section->assignments->count(),
                    'quizzes_count' => $section->quizzes->count(),
                ];
            }),
            'controller_test' => 'SUCCESS'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile()),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Test route that mimics exact students page request
Route::middleware(['auth'])->get('/test/students', function() {
    try {
        // Get current user
        $user = auth()->user();
        
        // Check middleware setup
        $middlewareResult = [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'has_roles_loaded' => $user->relationLoaded('roles'),
        ];
        
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }
        
        $middlewareResult['roles'] = $user->roles->pluck('name')->toArray();
        $middlewareResult['has_admin_role'] = $user->roles->where('name', 'admin')->isNotEmpty();
        
        // Call the actual controller method
        $controller = new \App\Http\Controllers\Admin\UserManagementController();
        $request = new \Illuminate\Http\Request();
        $result = $controller->students($request);
        
        return response()->json([
            'middleware_check' => $middlewareResult,
            'controller_result' => 'Success - Inertia response created',
            'route_exists' => \Illuminate\Support\Facades\Route::has('admin.users.students'),
            'route_url' => route('admin.users.students'),
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// API Routes for AJAX calls
Route::middleware(['auth'])->prefix('api')->name('api.')->group(function () {
    Route::get('/search/courses', [CourseController::class, 'search'])->name('courses.search');
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
    Route::post('/progress/update', [EnrollmentController::class, 'updateProgress'])->name('progress.update');
});

// Test route for student browse courses
Route::middleware(['auth'])->get('/test/student-courses', function() {
    try {
        $user = auth()->user();
        
        // Test basic course query first
        $basicCourses = \App\Models\Course::where('status', 'published')
            ->where('access_type', 'public')
            ->count();
        
        // Get actual course data
        $courses = \App\Models\Course::where('status', 'published')
            ->where('access_type', 'public')
            ->get();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'roles' => $user->roles->pluck('name')
            ],
            'basic_public_courses' => $basicCourses,
            'courses_data' => $courses->map(function($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'status' => $course->status,
                    'access_type' => $course->access_type,
                    'is_featured' => $course->is_featured
                ];
            }),
            'success' => true
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile()),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Simple course test route
Route::get('/test/courses-simple', function() {
    try {
        $courses = \App\Models\Course::all();
        
        return response()->json([
            'total_courses' => $courses->count(),
            'courses' => $courses->map(function($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'status' => $course->status ?? 'unknown',
                    'access_type' => $course->access_type ?? 'unknown',
                    'is_featured' => $course->is_featured ?? false
                ];
            })
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

// Test student browse courses direct (no role middleware)
Route::middleware(['auth'])->get('/test/browse', function() {
    try {
        $controller = new \App\Http\Controllers\StudentController();
        $request = new \Illuminate\Http\Request();
        $response = $controller->browseCourses($request);
        
        return response()->json([
            'success' => true,
            'message' => 'Controller executed successfully'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile()),
        ], 500);
    }
});


// Midtrans webhook routes (public, no auth required)
Route::post('/payment/notification', [PaymentController::class, 'handleNotification'])->name('payment.callback');

// Midtrans routes moved to api.php for better webhook handling

require __DIR__.'/auth.php';
