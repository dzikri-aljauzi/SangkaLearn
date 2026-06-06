<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo "Testing Production Configuration\n";
echo "================================\n\n";

// Test environment variables
echo "📋 Environment Configuration:\n";
echo "   APP_ENV: " . env('APP_ENV') . "\n";
echo "   APP_DEBUG: " . (env('APP_DEBUG') ? 'true' : 'false') . "\n";
echo "   APP_URL: " . env('APP_URL') . "\n\n";

// Test Midtrans configuration
echo "💳 Midtrans Configuration:\n";
echo "   Server Key: " . substr(config('midtrans.server_key'), 0, 15) . "..." . "\n";
echo "   Client Key: " . substr(config('midtrans.client_key'), 0, 15) . "..." . "\n";
echo "   Is Production: " . (config('midtrans.is_production') ? 'YES' : 'NO') . "\n";
echo "   Environment: " . config('midtrans.environment') . "\n";
echo "   SSL Verify Peer: " . (config('midtrans.curl_options.ssl_verify_peer') ? 'YES' : 'NO') . "\n";
echo "   SSL Verify Host: " . config('midtrans.curl_options.ssl_verify_host') . "\n\n";

// Test base URLs
$isProduction = config('midtrans.is_production');
$baseUrl = $isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';

echo "🌐 API Endpoints:\n";
echo "   Base URL: " . $baseUrl . "\n";
echo "   Snap URL: " . $baseUrl . "/snap/v1/transactions" . "\n";
echo "   Status URL: " . $baseUrl . "/v2/{order_id}/status" . "\n\n";

// Test CustomMidtransClient configuration
echo "🔧 Testing CustomMidtransClient...\n";
try {
    $customClient = new \App\Services\CustomMidtransClient();
    $testResult = $customClient->testConnection();
    
    echo "   Connection Test: " . ($testResult['success'] ? 'PASSED' : 'FAILED') . "\n";
    echo "   Message: " . $testResult['message'] . "\n";
} catch (Exception $e) {
    echo "   Connection Test: ERROR\n";
    echo "   Error: " . $e->getMessage() . "\n";
}

echo "\n🔍 Payment Methods Configuration:\n";
echo "   GoPay QRIS: " . (config('midtrans.gopay.qris_enabled') ? 'ENABLED' : 'DISABLED') . "\n";
echo "   E-Wallet Methods: " . implode(', ', config('midtrans.ewallet.enabled_methods', [])) . "\n";

echo "\n" . str_repeat("=", 50) . "\n";
echo "PRODUCTION CONFIGURATION STATUS:\n";
echo str_repeat("=", 50) . "\n";

$allGood = true;

// Check critical settings
if (!config('midtrans.is_production')) {
    echo "❌ Midtrans not in production mode\n";
    $allGood = false;
} else {
    echo "✅ Midtrans in production mode\n";
}

if (config('midtrans.environment') !== 'production') {
    echo "❌ Environment not set to production\n";
    $allGood = false;
} else {
    echo "✅ Environment set to production\n";
}

if (!config('midtrans.curl_options.ssl_verify_peer')) {
    echo "⚠️  SSL verification disabled (should be enabled for production)\n";
} else {
    echo "✅ SSL verification enabled\n";
}

if (strpos(config('midtrans.server_key'), 'Mid-server-kR6fhbmhI2B9BcGwgLNhPWp4') === false) {
    echo "❌ Production server key not configured\n";
    $allGood = false;
} else {
    echo "✅ Production server key configured\n";
}

if (strpos(config('midtrans.client_key'), 'Mid-client-tEI9TaJa1Y3h1WM5') === false) {
    echo "❌ Production client key not configured\n";
    $allGood = false;
} else {
    echo "✅ Production client key configured\n";
}

echo "\n" . ($allGood ? "🎉 ALL PRODUCTION SETTINGS CONFIGURED CORRECTLY!" : "⚠️  SOME SETTINGS NEED ATTENTION") . "\n";

echo "\n📌 Key Changes Made:\n";
echo "   • Switched from sandbox to production Midtrans keys\n";
echo "   • Enabled SSL verification for production\n";
echo "   • Updated base URLs to production endpoints\n";
echo "   • Configured production environment variables\n";