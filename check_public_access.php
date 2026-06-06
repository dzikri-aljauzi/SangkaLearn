<?php

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║                PUBLIC ACCESS STATUS CHECKER                  ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Load Laravel to check config
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔍 CHECKING CURRENT STATUS...\n\n";

// Check if Laravel server is running
echo "📊 SERVER STATUS:\n";
$localUrl = 'http://127.0.0.1:8000';
$context = stream_context_create(['http' => ['timeout' => 3]]);
$localCheck = @file_get_contents($localUrl, false, $context);
$localRunning = $localCheck !== false;

echo "   " . ($localRunning ? "✅" : "❌") . " Laravel Server (http://127.0.0.1:8000): " . ($localRunning ? "RUNNING" : "NOT RUNNING") . "\n";

// Check ngrok URL from environment
$ngrokUrl = env('NGROK_URL');
echo "   " . ($ngrokUrl ? "✅" : "❌") . " Ngrok URL configured: " . ($ngrokUrl ?: "NOT SET") . "\n";

// Test ngrok URL if available
if ($ngrokUrl) {
    echo "\n🌐 TESTING PUBLIC ACCESS...\n";
    
    $publicCheck = @file_get_contents($ngrokUrl, false, $context);
    $publicAccessible = $publicCheck !== false;
    
    echo "   " . ($publicAccessible ? "✅" : "❌") . " Public URL accessible: " . ($publicAccessible ? "YES" : "NO") . "\n";
    
    if ($publicAccessible) {
        echo "   ✅ Your app is PUBLICLY ACCESSIBLE via: {$ngrokUrl}\n";
        
        // Test specific endpoints
        $endpoints = [
            '/login' => 'Login Page',
            '/register' => 'Register Page', 
            '/midtrans/notification' => 'Webhook Endpoint'
        ];
        
        echo "\n🧪 TESTING ENDPOINTS:\n";
        foreach ($endpoints as $endpoint => $description) {
            $testUrl = $ngrokUrl . $endpoint;
            $endpointCheck = @get_headers($testUrl, 1);
            $endpointWorking = $endpointCheck !== false;
            
            echo "   " . ($endpointWorking ? "✅" : "❌") . " {$description}: {$testUrl}\n";
        }
        
        echo "\n🎯 WEBHOOK CONFIGURATION:\n";
        echo "   📝 Copy this URL for Midtrans webhook:\n";
        echo "   📋 {$ngrokUrl}/midtrans/notification\n";
        
    } else {
        echo "   ❌ Public URL not accessible. Check ngrok tunnel status.\n";
    }
} else {
    echo "\n⚠️  NGROK URL NOT CONFIGURED\n";
    echo "   Please start ngrok and update NGROK_URL in .env file\n";
}

echo "\n📋 SETUP CHECKLIST:\n";
echo "   " . ($localRunning ? "✅" : "❌") . " Laravel server running\n";
echo "   " . ($ngrokUrl ? "✅" : "❌") . " Ngrok URL configured\n";
echo "   " . (($ngrokUrl && $publicAccessible) ? "✅" : "❌") . " Public access working\n";

// Check Midtrans production config
echo "\n💳 MIDTRANS STATUS:\n";
echo "   Environment: " . config('services.midtrans.environment') . "\n";
echo "   Production Mode: " . (config('services.midtrans.is_production') ? 'YES ✅' : 'NO ❌') . "\n";

echo "\n🚀 NEXT STEPS:\n";

if (!$localRunning) {
    echo "   1. ❗ Start Laravel server: php artisan serve --port=8000\n";
}

if (!$ngrokUrl) {
    echo "   2. ❗ Start ngrok tunnel:\n";
    echo "      - Open new Command Prompt\n";
    echo "      - Run: ngrok http 8000\n";
    echo "      - Copy HTTPS URL\n";
    echo "      - Update NGROK_URL in .env\n";
    echo "      - Run: php artisan config:clear\n";
}

if ($ngrokUrl && !$publicAccessible) {
    echo "   3. ❗ Fix ngrok tunnel:\n";
    echo "      - Check ngrok is still running\n";
    echo "      - Verify URL: {$ngrokUrl}\n";
    echo "      - Restart ngrok if needed\n";
}

if ($ngrokUrl && $publicAccessible) {
    echo "   🎉 READY! Configure Midtrans webhook with:\n";
    echo "      {$ngrokUrl}/midtrans/notification\n";
}

echo "\n📊 MONITORING URLS:\n";
echo "   🖥️  Local App: http://127.0.0.1:8000\n";
echo "   🌐 Public App: " . ($ngrokUrl ?: "Not configured") . "\n";
echo "   📊 Ngrok Dashboard: http://127.0.0.1:4040\n";
echo "   💳 Midtrans Dashboard: https://dashboard.midtrans.com/\n";

echo "\n" . str_repeat("=", 64) . "\n";

if ($ngrokUrl && $publicAccessible && $localRunning) {
    echo "🎉 STATUS: READY FOR MIDTRANS WEBHOOK TESTING!\n";
} else {
    echo "⚙️  STATUS: SETUP INCOMPLETE - Follow steps above\n";
}

echo str_repeat("=", 64) . "\n";
?>