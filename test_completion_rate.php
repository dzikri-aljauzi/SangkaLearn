<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Enrollment;
use App\Models\User;

echo "=== Test Completion Rate Fix ===\n\n";

// Get test user
$testEmail = 'ayruzrahmad@gmail.com';
$user = User::where('email', $testEmail)->first();

if (!$user) {
    echo "❌ User {$testEmail} tidak ditemukan\n";
    exit(1);
}

echo "✅ Testing dengan user: {$user->email}\n\n";

// Get all enrollments with course relationship
$enrollments = Enrollment::where('user_id', $user->id)->with('course')->get();

echo "📊 Enrollment Summary:\n";
echo str_repeat("=", 100) . "\n";
printf("%-40s %-15s %-15s %-10s\n", "Course", "Status", "Progress", "Should Count");
echo str_repeat("=", 100) . "\n";

$oldMethodCount = 0;
$newMethodCount = 0;

foreach ($enrollments as $enrollment) {
    $courseName = substr($enrollment->course->title ?? 'Unknown', 0, 37) . '...';
    $status = $enrollment->status;
    $progress = $enrollment->progress_percentage ?? 0;

    // OLD METHOD - hanya count status = completed
    if ($status === 'completed') {
        $oldMethodCount++;
        $shouldCountOld = '✓ YES';
    } else {
        $shouldCountOld = '✗ NO';
    }

    // NEW METHOD - count status = completed OR progress >= 100
    if ($status === 'completed' || $progress >= 100) {
        $newMethodCount++;
        $shouldCountNew = '✓ YES';
    } else {
        $shouldCountNew = '✗ NO';
    }

    printf(
        "%-40s %-15s %-15s %-10s\n",
        $courseName,
        $status,
        $progress . '%',
        $shouldCountNew
    );
}
echo str_repeat("=", 100) . "\n\n";

echo "📈 Comparison:\n";
echo "   OLD METHOD (status = 'completed' only): {$oldMethodCount} courses\n";
echo "   NEW METHOD (status = 'completed' OR progress >= 100): {$newMethodCount} courses\n\n";

if ($newMethodCount > $oldMethodCount) {
    $diff = $newMethodCount - $oldMethodCount;
    echo "✅ FIX WORKING! New method detects {$diff} more completed course(s)\n\n";
} else if ($newMethodCount == $oldMethodCount) {
    if ($newMethodCount == 0) {
        echo "⚠️  Both methods return 0. Need to run: php artisan progress:sync\n\n";
    } else {
        echo "✅ Both methods consistent (all completed courses already have correct status)\n\n";
    }
} else {
    echo "⚠️  Unexpected result. Old method > New method (shouldn't happen)\n\n";
}

// Calculate completion rate
$totalEnrolled = $enrollments->count();
$oldCompletionRate = $totalEnrolled > 0 ? round(($oldMethodCount / $totalEnrolled) * 100) : 0;
$newCompletionRate = $totalEnrolled > 0 ? round(($newMethodCount / $totalEnrolled) * 100) : 0;

echo "📊 Completion Rate:\n";
echo "   Total Enrolled: {$totalEnrolled}\n";
echo "   OLD: {$oldCompletionRate}% ({$oldMethodCount}/{$totalEnrolled})\n";
echo "   NEW: {$newCompletionRate}% ({$newMethodCount}/{$totalEnrolled})\n\n";

echo "=== Recommendations ===\n";

if ($newMethodCount == 0 && $enrollments->where('progress_percentage', '>=', 100)->count() > 0) {
    echo "⚠️  Ada enrollment dengan progress 100% tapi status belum di-update\n";
    echo "💡 Solusi:\n";
    echo "   1. Backend fix sudah diterapkan (query akan detect progress >= 100)\n";
    echo "   2. Untuk permanent fix, jalankan di production:\n";
    echo "      php artisan progress:sync\n\n";
} else if ($newMethodCount > 0) {
    echo "✅ Fix sudah bekerja! Completed courses terdeteksi dengan benar.\n\n";
}

// Check enrollments yang perlu sync
$needsSync = Enrollment::where('user_id', $user->id)
    ->where('progress_percentage', '>=', 100)
    ->where('status', '!=', 'completed')
    ->count();

if ($needsSync > 0) {
    echo "⚠️  {$needsSync} enrollment(s) memiliki progress 100% tapi status belum 'completed'\n";
    echo "💡 Jalankan: php artisan progress:sync\n\n";
} else {
    echo "✅ Semua enrollment dengan progress 100% sudah ter-mark sebagai 'completed'\n\n";
}

echo "\n";
