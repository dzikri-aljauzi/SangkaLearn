<?php
// Simple database check script
require 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== MIDTRANS TESTING RESULTS ===\n\n";

// Check orders
$orders = DB::table('orders')
    ->join('users', 'orders.user_id', '=', 'users.id')
    ->select('orders.*', 'users.email')
    ->orderBy('orders.created_at', 'desc')
    ->take(5)
    ->get();

echo "📋 Recent Orders:\n";
foreach ($orders as $order) {
    echo "- Order: {$order->order_number} | User: {$order->email} | Status: {$order->status} | Total: Rp " . number_format($order->total_amount) . "\n";
}

// Check payments  
$payments = DB::table('payments')
    ->join('orders', 'payments.order_id', '=', 'orders.id')
    ->join('users', 'orders.user_id', '=', 'users.id')
    ->select('payments.*', 'orders.order_number', 'users.email')
    ->orderBy('payments.created_at', 'desc')
    ->take(5)
    ->get();

echo "\n💳 Recent Payments:\n";
foreach ($payments as $payment) {
    echo "- Payment: {$payment->transaction_id} | User: {$payment->email} | Status: {$payment->status} | Amount: Rp " . number_format($payment->amount) . "\n";
}

// Check enrollments
$enrollments = DB::table('enrollments')
    ->join('users', 'enrollments.user_id', '=', 'users.id') 
    ->join('courses', 'enrollments.course_id', '=', 'courses.id')
    ->select('enrollments.*', 'users.email', 'courses.title')
    ->orderBy('enrollments.created_at', 'desc')
    ->take(5)
    ->get();

echo "\n🎓 Recent Enrollments:\n";
foreach ($enrollments as $enrollment) {
    echo "- User: {$enrollment->email} | Course: {$enrollment->title} | Status: {$enrollment->status}\n";
}

echo "\n=== END ===\n";
?>