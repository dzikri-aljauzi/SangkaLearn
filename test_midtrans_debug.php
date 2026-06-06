<?php

require_once 'vendor/autoload.php';

use Midtrans\Config;
use Midtrans\Snap;

// Configure Midtrans
Config::$serverKey = "Mid-server-v2ZO4-ALzGqGDqNtCVN-f-l7";
Config::$isProduction = true;
Config::$isSanitized = true;
Config::$is3ds = true;

// Configure CURL options for SSL
Config::$curlOptions = [
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => [], // Initialize empty headers array to prevent undefined key error
];

echo "Testing Midtrans Snap Token Creation...\n\n";

// Test parameters
$params = [
    'transaction_details' => [
        'order_id' => 'TEST-' . time(),
        'gross_amount' => 100000,
    ],
    'customer_details' => [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'phone' => '08123456789',
    ],
    'item_details' => [
        [
            'id' => 1,
            'price' => 100000,
            'quantity' => 1,
            'name' => 'Test Course',
            'brand' => 'LeadNEX Academy',
            'category' => 'Course'
        ]
    ]
];

try {
    echo "Parameters:\n";
    print_r($params);
    echo "\n";
    
    $snapToken = Snap::getSnapToken($params);
    echo "✅ Success! Snap token created: " . substr($snapToken, 0, 20) . "...\n";
    echo "Full token: $snapToken\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    
    if ($e instanceof \Midtrans\MidtransError) {
        echo "Midtrans Error Details:\n";
        if (method_exists($e, 'getResponse')) {
            print_r($e->getResponse());
        }
    }
}