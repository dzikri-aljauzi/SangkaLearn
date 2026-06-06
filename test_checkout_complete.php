<?php

require 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\CheckoutController;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CartItem;
use Illuminate\Support\Facades\Auth;

echo "=== TESTING CHECKOUT FLOW ===\n\n";

// Test 1: Login as test student
$testUser = User::where('email', 'student.test@example.com')->first();
if (!$testUser) {
    echo "❌ Test user not found. Please run seeder first.\n";
    exit(1);
}

Auth::login($testUser);
echo "✅ Logged in as: {$testUser->email}\n";

// Test 2: Check cart items
$cartItems = CartItem::where('user_id', $testUser->id)
    ->with(['course.instructor'])
    ->get();

echo "🛒 Cart items: " . $cartItems->count() . "\n";

if ($cartItems->isEmpty()) {
    echo "❌ No cart items found. Please run seeder first.\n";
    exit(1);
}

foreach ($cartItems as $item) {
    echo "   - Course: {$item->course->title}\n";
    echo "   - Price: Rp " . number_format($item->price, 0, ',', '.') . "\n";
    echo "   - Instructor: {$item->course->instructor->first_name} {$item->course->instructor->last_name}\n";
}

// Test 3: Test checkout controller
echo "\n📋 Testing CheckoutController::index()\n";

try {
    $controller = new CheckoutController();
    $request = new Request();
    
    $response = $controller->index($request);
    
    // Get the props from Inertia response
    $props = $response->getData()['props'];
    
    echo "✅ Checkout page loads successfully\n";
    echo "   - Items count: " . count($props['items']) . "\n";
    echo "   - Total: Rp " . number_format($props['total'], 0, ',', '.') . "\n";
    echo "   - User: {$props['user']['name']}\n";
    
    // Test each item structure
    foreach ($props['items'] as $item) {
        echo "   - Item ID: {$item['id']}\n";
        echo "   - Course: {$item['course']['title']}\n";
        echo "   - Instructor: {$item['course']['instructor_name']}\n";
        echo "   - Final Price: Rp " . number_format($item['course']['final_price'], 0, ',', '.') . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ CheckoutController error: " . $e->getMessage() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
    echo "   File: " . basename($e->getFile()) . "\n";
    exit(1);
}

// Test 4: Test Midtrans service instantiation
echo "\n💳 Testing MidtransService\n";

try {
    $midtransService = new \App\Services\MidtransService();
    echo "✅ MidtransService instantiated successfully\n";
    
    // Check config
    echo "   - Server Key: " . (config('services.midtrans.server_key') ? '✅ Set' : '❌ Missing') . "\n";
    echo "   - Client Key: " . (config('services.midtrans.client_key') ? '✅ Set' : '❌ Missing') . "\n";
    echo "   - Environment: " . config('services.midtrans.environment') . "\n";
    
} catch (\Exception $e) {
    echo "❌ MidtransService error: " . $e->getMessage() . "\n";
}

// Test 5: Test Order creation flow
echo "\n📦 Testing Order Creation Process\n";

try {
    $orderData = [
        'order_number' => 'TEST-' . strtoupper(uniqid()),
        'user_id' => $testUser->id,
        'status' => 'pending',
        'subtotal' => 100000,
        'total_amount' => 100000,
        'currency' => 'IDR',
        'billing_details' => [
            'email' => $testUser->email,
            'phone' => $testUser->phone
        ]
    ];
    
    $order = \App\Models\Order::create($orderData);
    echo "✅ Test order created: {$order->order_number}\n";
    
    // Create order items
    foreach ($cartItems as $cartItem) {
        \App\Models\OrderItem::create([
            'order_id' => $order->id,
            'course_id' => $cartItem->course_id,
            'price' => $cartItem->price,
            'quantity' => 1
        ]);
    }
    echo "✅ Order items created: " . $cartItems->count() . " items\n";
    
    // Test Midtrans transaction creation
    echo "\n💰 Testing Midtrans Transaction Creation\n";
    
    $midtransResponse = $midtransService->createTransaction($order);
    echo "✅ Midtrans transaction created\n";
    echo "   - Snap Token: " . substr($midtransResponse['snap_token'], 0, 20) . "...\n";
    echo "   - Payment ID: {$midtransResponse['payment']->id}\n";
    
    // Clean up test order
    $order->items()->delete();
    $order->payments()->delete();
    $order->delete();
    echo "✅ Test order cleaned up\n";
    
} catch (\Exception $e) {
    echo "❌ Order/Midtrans error: " . $e->getMessage() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
    echo "   File: " . basename($e->getFile()) . "\n";
}

echo "\n=== CHECKOUT FLOW TEST COMPLETE ===\n";
echo "\n🎯 MANUAL TESTING INSTRUCTIONS:\n";
echo "1. Open browser: http://127.0.0.1:8000\n";
echo "2. Login with: student.test@example.com / password\n";
echo "3. Go to Cart: http://127.0.0.1:8000/cart\n";
echo "4. Click Checkout\n";
echo "5. Fill billing info and submit payment\n";
echo "6. Use Midtrans test cards:\n";
echo "   ✅ Success: 4811 1111 1111 1114 | Exp: 01/25 | CVV: 123 | OTP: 112233\n";
echo "   ❌ Failed:  4811 1111 1111 1113 | Exp: 01/25 | CVV: 123\n";
echo "   ⏳ Pending: 4911 1111 1111 1113 | Exp: 01/25 | CVV: 123\n\n";

echo "=== END ===\n";
?>