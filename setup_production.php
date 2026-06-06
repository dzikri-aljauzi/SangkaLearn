<?php

require 'vendor/autoload.php';

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║              MIDTRANS PRODUCTION SETUP CHECKER               ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔧 CHECKING PRODUCTION CONFIGURATION...\n\n";

// Check environment configuration
$checks = [
    'MIDTRANS_SERVER_KEY' => config('services.midtrans.server_key'),
    'MIDTRANS_CLIENT_KEY' => config('services.midtrans.client_key'),
    'MIDTRANS_MERCHANT_ID' => config('services.midtrans.merchant_id'),
    'MIDTRANS_ENVIRONMENT' => config('services.midtrans.environment'),
    'MIDTRANS_IS_PRODUCTION' => config('services.midtrans.is_production'),
    'NGROK_URL' => env('NGROK_URL'),
];

echo "📊 ENVIRONMENT VARIABLES:\n";
foreach ($checks as $key => $value) {
    $status = $value ? "✅" : "❌";
    $displayValue = $key === 'MIDTRANS_SERVER_KEY' || $key === 'MIDTRANS_CLIENT_KEY' 
        ? (strlen($value) > 10 ? substr($value, 0, 10) . "..." : $value)
        : ($value === true ? 'true' : ($value === false ? 'false' : $value));
    
    echo "   {$status} {$key}: {$displayValue}\n";
}

echo "\n🌐 PRODUCTION MODE STATUS:\n";
echo "   Environment: " . config('services.midtrans.environment') . "\n";
echo "   Is Production: " . (config('services.midtrans.is_production') ? 'YES ✅' : 'NO ❌') . "\n";
echo "   Snap URL: " . (config('services.midtrans.is_production') ? 'https://app.midtrans.com/snap/snap.js ✅' : 'https://app.sandbox.midtrans.com/snap/snap.js ❌') . "\n";

echo "\n🔗 WEBHOOK ENDPOINTS:\n";
$webhookBase = env('NGROK_URL') ?: 'https://YOUR-NGROK-URL.ngrok.io';
echo "   Notification: {$webhookBase}/midtrans/notification\n";
echo "   Finish: {$webhookBase}/payment/finish\n";
echo "   Unfinish: {$webhookBase}/payment/unfinish\n";
echo "   Error: {$webhookBase}/payment/error\n";

echo "\n📋 SETUP CHECKLIST:\n";

// Check if ngrok is available
$ngrokAvailable = false;
$ngrokPath = null;

$possiblePaths = [
    __DIR__ . '/ngrok.exe',
    'C:/ngrok/ngrok.exe',
    'ngrok'
];

foreach ($possiblePaths as $path) {
    if (file_exists($path) || (trim(shell_exec("where ngrok 2>nul")) !== '')) {
        $ngrokAvailable = true;
        $ngrokPath = $path;
        break;
    }
}

echo "   " . ($ngrokAvailable ? "✅" : "❌") . " Ngrok installed\n";
echo "   " . (config('services.midtrans.is_production') ? "✅" : "❌") . " Production mode enabled\n";
echo "   " . (env('NGROK_URL') ? "✅" : "❌") . " Ngrok URL configured\n";

// Check if Laravel server is running
$serverRunning = false;
$context = stream_context_create(['http' => ['timeout' => 2]]);
$serverCheck = @file_get_contents('http://127.0.0.1:8000', false, $context);
$serverRunning = $serverCheck !== false;

echo "   " . ($serverRunning ? "✅" : "❌") . " Laravel server running (port 8000)\n";

echo "\n🚀 NEXT STEPS:\n";

if (!$ngrokAvailable) {
    echo "   1. Install ngrok: run setup_ngrok.bat\n";
}

if (!env('NGROK_URL')) {
    echo "   2. Start ngrok: run start_ngrok.bat\n";
    echo "   3. Copy HTTPS URL and update NGROK_URL in .env\n";
    echo "   4. Run: php artisan config:clear\n";
}

echo "   5. Configure webhook in Midtrans Dashboard:\n";
echo "      - Login: https://dashboard.midtrans.com/\n";
echo "      - Settings → Configuration\n";
echo "      - Set Notification URL: {$webhookBase}/midtrans/notification\n";

echo "\n⚠️  IMPORTANT WARNINGS:\n";
echo "   🚨 PRODUCTION MODE = REAL MONEY!\n";
echo "   🚨 Test with small amounts (Rp 1.000 - Rp 10.000)\n";
echo "   🚨 Keep ngrok running during testing\n";
echo "   🚨 Update webhook URL if ngrok restarts\n";

echo "\n💳 TEST PAYMENT:\n";
echo "   1. Access: http://127.0.0.1:8000\n";
echo "   2. Login: student.test@example.com / password\n";
echo "   3. Add course to cart → Checkout\n";
echo "   4. Use REAL credit/debit card\n";
echo "   5. Complete payment with small amount\n";

echo "\n🔍 MONITORING:\n";
echo "   📊 Ngrok Dashboard: http://127.0.0.1:4040\n";
echo "   📊 Midtrans Dashboard: https://dashboard.midtrans.com/\n";
echo "   📊 Laravel Logs: storage/logs/laravel.log\n";

echo "\n" . str_repeat("=", 64) . "\n";

if (config('services.midtrans.is_production') && env('NGROK_URL') && $serverRunning) {
    echo "🎉 READY FOR PRODUCTION TESTING!\n";
} else {
    echo "⚙️  SETUP INCOMPLETE - Follow steps above\n";
}

echo str_repeat("=", 64) . "\n";
?>