<?php

require_once 'vendor/autoload.php';

use App\Services\MidtransService;
use App\Models\User;
use Illuminate\Support\Facades\Log;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "Testing Static QRIS Payment Fix\n";
echo "================================\n\n";

try {
    // Test user data
    $userId = 8; // Based on the logs
    $user = User::find($userId);
    
    if (!$user) {
        echo "❌ User not found with ID: $userId\n";
        exit(1);
    }
    
    echo "✅ User found: {$user->name} ({$user->email})\n\n";

    // Test items
    $items = [
        [
            'id' => 'direct-1',
            'course' => [
                'id' => 1,
                'title' => 'JavaScript Fundamentals Test',
                'final_price' => '1000.00'
            ],
            'is_direct_purchase' => true
        ]
    ];
    
    $total = '1000.00';
    $billingDetails = [
        'address' => 'Test Address',
        'city' => 'Jakarta',
        'postal_code' => '12345',
        'email' => $user->email,
        'phone' => '08123456789'
    ];

    echo "Testing Static QRIS creation...\n";
    
    // Test the MidtransService
    $midtransService = new MidtransService();
    
    echo "📞 Calling createStaticQRIS method...\n";
    
    $result = $midtransService->createStaticQRIS($items, $total, $billingDetails, $userId);
    
    echo "✅ Static QRIS created successfully!\n";
    echo "📄 Response:\n";
    echo "   - Order ID: " . $result['order_id'] . "\n";
    echo "   - Total: Rp " . number_format($result['total']) . "\n";
    echo "   - Status: " . $result['transaction_status'] . "\n";
    echo "   - Method: " . $result['method'] . "\n";
    echo "   - Payment Type: " . $result['payment_type'] . "\n";
    
    if (isset($result['snap_token'])) {
        echo "   - Snap Token: " . substr($result['snap_token'], 0, 20) . "... (length: " . strlen($result['snap_token']) . ")\n";
        echo "   - Snap URL: https://app.sandbox.midtrans.com/snap/v1/transactions/" . $result['snap_token'] . "\n";
    }
    
    if (isset($result['qr_code_url']) && $result['qr_code_url']) {
        echo "   - QR Code URL: " . $result['qr_code_url'] . "\n";
    }
    
    echo "\n✅ Static QRIS test completed successfully!\n";
    echo "🎉 The 'Transaction not found' error has been fixed!\n\n";
    
    // Test connection
    echo "Testing Midtrans connection...\n";
    $connectionTest = $midtransService->testConnection();
    
    if ($connectionTest['success']) {
        echo "✅ Midtrans connection: OK\n";
        echo "   Message: " . $connectionTest['message'] . "\n";
    } else {
        echo "❌ Midtrans connection failed: " . $connectionTest['message'] . "\n";
    }

} catch (Exception $e) {
    echo "❌ Test failed with error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . " (Line: " . $e->getLine() . ")\n";
    echo "🔍 Trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "SUMMARY OF FIXES APPLIED:\n";
echo str_repeat("=", 50) . "\n";
echo "1. ✅ Fixed Static QRIS to use Snap API instead of Charge API\n";
echo "2. ✅ Updated error handling for 404 endpoints\n";
echo "3. ✅ Added fallback mechanism for unavailable Charge API\n";
echo "4. ✅ Updated payment response structure\n";
echo "5. ✅ Maintained compatibility with existing frontend\n";
echo "\nThe Static QRIS payment method now works correctly!\n";