<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\MidtransService;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔄 MANUAL ENROLLMENT FIX TEST\n";
echo "=============================\n\n";

try {
    // Find the problematic order
    $order = Order::where('order_number', 'ORD-68B45B3442DDB')->first();
    
    if (!$order) {
        echo "❌ Order not found\n";
        exit;
    }
    
    echo "📋 ORDER INFORMATION:\n";
    echo "Order Number: {$order->order_number}\n";
    echo "Current Status: {$order->status}\n";
    echo "User ID: {$order->user_id}\n";
    echo "Total Amount: {$order->total_amount}\n\n";
    
    // Check payment
    $payment = $order->payments()->first();
    if (!$payment) {
        echo "❌ Payment not found\n";
        exit;
    }
    
    echo "💳 PAYMENT INFORMATION:\n";
    echo "Payment Status: {$payment->status}\n";
    echo "Payment Method: {$payment->payment_method}\n";
    echo "Transaction ID: {$payment->transaction_id}\n\n";
    
    // Check order items
    $items = $order->items()->with('course')->get();
    echo "📦 ORDER ITEMS ({$items->count()}):\n";
    foreach ($items as $item) {
        echo "- Course ID: {$item->course_id} ({$item->course->title})\n";
        echo "  Price: {$item->price}\n";
    }
    echo "\n";
    
    // Check existing enrollments
    $existingEnrollments = $order->enrollments;
    echo "🎓 EXISTING ENROLLMENTS: {$existingEnrollments->count()}\n\n";
    
    // Simulate successful payment notification
    echo "🔧 SIMULATING SUCCESSFUL PAYMENT PROCESSING...\n";
    
    DB::beginTransaction();
    
    try {
        // Update payment status to completed (fix enum issue)
        $payment->status = 'completed';
        $payment->paid_at = now();
        $payment->save();
        echo "✅ Payment status updated to 'completed'\n";
        
        // Update order status to completed  
        $order->status = 'completed';
        $order->save();
        echo "✅ Order status updated to 'completed'\n";
        
        // Process enrollment for each order item
        foreach ($items as $item) {
            // Check if enrollment already exists
            $existingEnrollment = Enrollment::where([
                'user_id' => $order->user_id,
                'course_id' => $item->course_id
            ])->first();
            
            if (!$existingEnrollment) {
                $enrollment = Enrollment::create([
                    'user_id' => $order->user_id,
                    'course_id' => $item->course_id,
                    'order_id' => $order->id,
                    'enrolled_at' => now(),
                    'status' => 'active',
                    'enrollment_type' => 'purchase'  // Fixed from 'paid'
                ]);
                
                echo "✅ Enrollment created: User {$order->user_id} → Course {$item->course_id}\n";
                echo "   Enrollment Type: {$enrollment->enrollment_type}\n";
                echo "   Status: {$enrollment->status}\n";
            } else {
                echo "⚠️ Enrollment already exists: User {$order->user_id} → Course {$item->course_id}\n";
            }
        }
        
        // Clear cart items (simulate cart cleanup)
        $cartCleared = DB::table('cart_items')
            ->where('user_id', $order->user_id)
            ->whereIn('course_id', $items->pluck('course_id'))
            ->delete();
        echo "✅ Cart items cleared: {$cartCleared} items\n";
        
        DB::commit();
        
        echo "\n🎉 SUCCESS: Payment processed and course(s) enrolled!\n\n";
        
        // Verify final state
        echo "📊 FINAL VERIFICATION:\n";
        $finalEnrollments = $order->enrollments;
        echo "Total enrollments: {$finalEnrollments->count()}\n";
        
        foreach ($finalEnrollments as $enrollment) {
            $course = $enrollment->course;
            echo "✅ {$course->title} - Status: {$enrollment->status}, Type: {$enrollment->enrollment_type}\n";
        }
        
    } catch (Exception $e) {
        DB::rollBack();
        echo "❌ Error during processing: " . $e->getMessage() . "\n";
        echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=============================\n";
echo "Test completed at: " . date('Y-m-d H:i:s') . "\n";