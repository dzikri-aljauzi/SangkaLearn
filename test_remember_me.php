<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

echo "=== Testing Remember Me Functionality ===\n\n";

// Get test user
$user = User::where('email', 'ayruzrahmad@gmail.com')->first();

if (!$user) {
    echo "❌ User ayruzrahmad@gmail.com tidak ditemukan\n";
    exit(1);
}

echo "✅ User ditemukan: {$user->email}\n";
echo "📝 Current remember_token: " . ($user->remember_token ? 'SET' : 'NULL') . "\n";
if ($user->remember_token) {
    echo "   Token: " . substr($user->remember_token, 0, 20) . "...\n";
}

echo "\n=== Simulasi Login dengan Remember Me ===\n";

// Simulate login attempt with remember = true
$credentials = [
    'email' => 'ayruzrahmad@gmail.com',
    'password' => 'password', // Ganti dengan password yang benar
    'is_active' => true
];

// Note: We can't fully test Auth::attempt() in CLI context
// But we can check if the remember_token gets generated

echo "ℹ️  Untuk test lengkap, silakan:\n";
echo "   1. Buka browser dalam mode incognito\n";
echo "   2. Login dengan centang 'Remember Me'\n";
echo "   3. Tutup browser\n";
echo "   4. Buka browser lagi dan akses dashboard\n";
echo "   5. Jika masih login otomatis = Remember Me BERFUNGSI ✅\n";
echo "   6. Jika diminta login lagi = Remember Me TIDAK BERFUNGSI ❌\n";

echo "\n=== Checking Session Configuration ===\n";
echo "SESSION_DRIVER: " . config('session.driver') . "\n";
echo "SESSION_LIFETIME: " . config('session.lifetime') . " minutes\n";
echo "SESSION_EXPIRE_ON_CLOSE: " . (config('session.expire_on_close') ? 'true' : 'false') . "\n";
echo "SESSION_DOMAIN: " . (config('session.domain') ?? 'null') . "\n";
echo "SESSION_SECURE_COOKIE: " . (config('session.secure') ? 'true' : 'false') . "\n";
echo "SESSION_SAME_SITE: " . (config('session.same_site') ?? 'null') . "\n";

echo "\n=== Checking Database Sessions Table ===\n";
try {
    $sessionCount = \DB::table('sessions')->count();
    echo "✅ Sessions table exists\n";
    echo "📊 Total sessions: {$sessionCount}\n";

    // Show recent sessions
    $recentSessions = \DB::table('sessions')
        ->where('user_id', $user->id)
        ->orderBy('last_activity', 'desc')
        ->limit(3)
        ->get();

    if ($recentSessions->count() > 0) {
        echo "\n📋 Recent sessions for {$user->email}:\n";
        foreach ($recentSessions as $session) {
            $lastActivity = date('Y-m-d H:i:s', $session->last_activity);
            echo "   - Last Activity: {$lastActivity}\n";
        }
    }
} catch (\Exception $e) {
    echo "❌ Error accessing sessions table: " . $e->getMessage() . "\n";
}

echo "\n=== Diagnosis ===\n";

$issues = [];
$recommendations = [];

// Check session driver
if (config('session.driver') !== 'database') {
    $issues[] = "Session driver bukan 'database' (saat ini: " . config('session.driver') . ")";
    $recommendations[] = "Set SESSION_DRIVER=database di .env";
}

// Check expire_on_close
if (config('session.expire_on_close') === true) {
    $issues[] = "SESSION_EXPIRE_ON_CLOSE=true akan menghapus session saat browser ditutup";
    $recommendations[] = "Set SESSION_EXPIRE_ON_CLOSE=false di .env";
}

// Check remember_token column
if (!$user->getRememberTokenName()) {
    $issues[] = "Remember token name tidak diset di User model";
    $recommendations[] = "Pastikan User model extends Authenticatable";
}

if (empty($issues)) {
    echo "✅ Semua konfigurasi terlihat benar!\n";
    echo "\nℹ️  Jika Remember Me masih tidak berfungsi, kemungkinan masalah:\n";
    echo "   1. Browser menghapus cookie saat ditutup (Private/Incognito mode)\n";
    echo "   2. Cookie HTTPS mismatch (secure cookie di HTTP)\n";
    echo "   3. Domain cookie tidak cocok\n";
    echo "   4. Browser extension memblokir cookie\n";
} else {
    echo "⚠️  Ditemukan " . count($issues) . " masalah potensial:\n\n";
    foreach ($issues as $i => $issue) {
        echo "   " . ($i + 1) . ". " . $issue . "\n";
    }

    echo "\n💡 Rekomendasi perbaikan:\n";
    foreach ($recommendations as $i => $rec) {
        echo "   " . ($i + 1) . ". " . $rec . "\n";
    }
}

echo "\n";
