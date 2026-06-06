<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->boot();

use App\Models\Order;
use App\Models\Payment;
use App\Models\Enrollment;

echo "=== MIDTRANS PAYMENT TESTING RESULTS ===\n\n";

// Check recent orders
echo "📋 RECENT ORDERS:\n";
echo str_repeat('-', 50) . "\n";
$orders = Order::with(['user', 'items.course'])->latest()->take(5)->get();

if ($orders->isEmpty()) {
    echo "No orders found.\n\n";
} else {
    foreach ($orders as $order) {
        echo "Order: {$order->order_number}\n";
        echo "User: {$order->user->email}\n"; 
        echo "Status: {$order->status}\n";
        echo "Total: Rp " . number_format($order->total_amount, 0, ',', '.') . "\n";
        echo "Date: {$order->created_at}\n";
        echo "Items: " . $order->items->count() . " course(s)\n";
        foreach ($order->items as $item) {
            echo "  - {$item->course->title} (Rp " . number_format($item->price, 0, ',', '.') . ")\n";
        }
        echo "\n";
    }
}

// Check payments
echo "💳 RECENT PAYMENTS:\n";
echo str_repeat('-', 50) . "\n";
$payments = Payment::with(['order.user'])->latest()->take(5)->get();

if ($payments->isEmpty()) {
    echo "No payments found.\n\n";
} else {
    foreach ($payments as $payment) {
        echo "Payment ID: {$payment->id}\n";
        echo "Order: {$payment->order->order_number}\n";
        echo "User: {$payment->order->user->email}\n";
        echo "Method: {$payment->payment_method}\n";
        echo "Status: {$payment->status}\n";
        echo "Amount: Rp " . number_format($payment->amount, 0, ',', '.') . "\n";
        echo "Transaction ID: {$payment->transaction_id}\n";
        if ($payment->paid_at) {
            echo "Paid At: {$payment->paid_at}\n";
        }
        echo "\n";
    }
}

// Check enrollments
echo "🎓 RECENT ENROLLMENTS:\n";
echo str_repeat('-', 50) . "\n";
$enrollments = Enrollment::with(['user', 'course', 'order'])->latest()->take(5)->get();

if ($enrollments->isEmpty()) {
    echo "No enrollments found.\n\n";
} else {
    foreach ($enrollments as $enrollment) {
        echo "User: {$enrollment->user->email}\n";
        echo "Course: {$enrollment->course->title}\n";
        echo "Status: {$enrollment->status}\n";
        echo "Type: {$enrollment->enrollment_type}\n";
        if ($enrollment->order) {
            echo "Order: {$enrollment->order->order_number}\n";
        }
        echo "Enrolled: {$enrollment->enrolled_at}\n";
        echo "\n";
    }
}

echo "=== TESTING INSTRUCTIONS ===\n\n";

echo "🧪 TESTING CARDS (Sandbox):\n";
echo "✅ SUCCESS: 4811 1111 1111 1114 | Exp: 01/25 | CVV: 123 | OTP: 112233\n";
echo "❌ FAILED:  4811 1111 1111 1113 | Exp: 01/25 | CVV: 123\n"; 
echo "⏳ PENDING: 4911 1111 1111 1113 | Exp: 01/25 | CVV: 123\n\n";

echo "🔗 TESTING URLS:\n";
echo "- Application: http://127.0.0.1:8000\n";
echo "- Courses: http://127.0.0.1:8000/courses\n";
echo "- Cart: http://127.0.0.1:8000/cart\n";
echo "- Checkout: http://127.0.0.1:8000/checkout\n\n";

echo "📋 TESTING FLOW:\n";
echo "1. Login/Register → Courses → Add to Cart → Checkout\n";
echo "2. Fill billing info → Choose payment → Submit\n";
echo "3. Use test cards above in Midtrans popup\n";
echo "4. Check results in database or run this script again\n\n";

echo "=== END ===\n";
?>