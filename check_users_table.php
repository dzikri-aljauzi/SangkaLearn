<?php

require 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;

echo "=== CHECKING USERS TABLE STRUCTURE ===\n\n";

// Check if columns exist
$columns = ['first_name', 'last_name', 'email', 'phone'];
foreach ($columns as $column) {
    $exists = Schema::hasColumn('users', $column);
    echo "Column '{$column}': " . ($exists ? "✅ EXISTS" : "❌ MISSING") . "\n";
}

echo "\n=== SAMPLE USERS DATA ===\n";

// Get sample users
$users = User::select('id', 'first_name', 'last_name', 'email', 'phone')
    ->take(3)
    ->get();

if ($users->isEmpty()) {
    echo "No users found in database.\n";
} else {
    foreach ($users as $user) {
        echo "ID: {$user->id}\n";
        echo "Name: {$user->first_name} {$user->last_name}\n";
        echo "Email: {$user->email}\n";
        echo "Phone: " . ($user->phone ?? 'NULL') . "\n";
        echo "---\n";
    }
}

echo "\n=== CHECKING CART ITEMS WITH RELATIONS ===\n";

try {
    $cartItems = DB::table('cart_items')
        ->join('courses', 'cart_items.course_id', '=', 'courses.id')
        ->join('users as instructors', 'courses.instructor_id', '=', 'instructors.id')
        ->select(
            'cart_items.id',
            'courses.title as course_title',
            'instructors.first_name as instructor_first_name', 
            'instructors.last_name as instructor_last_name'
        )
        ->take(5)
        ->get();

    if ($cartItems->isEmpty()) {
        echo "No cart items found.\n";
    } else {
        foreach ($cartItems as $item) {
            echo "Cart Item {$item->id}: {$item->course_title}\n";
            echo "Instructor: {$item->instructor_first_name} {$item->instructor_last_name}\n";
            echo "---\n";
        }
    }
} catch (\Exception $e) {
    echo "Error checking cart items: " . $e->getMessage() . "\n";
}

echo "\n=== END ===\n";
?>