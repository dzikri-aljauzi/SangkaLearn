<?php

// Test SSL connection to Midtrans
$serverKey = "Mid-server-IorUO4GsjtnNUbg4cizILxyU";
$isProduction = true;

// Midtrans API endpoint
$apiUrl = $isProduction ? 'https://api.midtrans.com/v2/ping' : 'https://api.sandbox.midtrans.com/v2/ping';

// Test basic connectivity
echo "Testing Midtrans SSL connection...\n";
echo "API URL: $apiUrl\n\n";

// Initialize cURL
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($serverKey . ':')
    ],
    // SSL options - try with verification first
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_SSL_VERIFYPEER => true,
]);

echo "Attempting connection with SSL verification enabled...\n";
$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$error = curl_error($curl);

if ($error) {
    echo "❌ SSL verification failed: $error\n";
    echo "HTTP Code: $httpCode\n\n";
    
    // Retry with SSL verification disabled for development
    echo "Retrying with SSL verification disabled (development only)...\n";
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    
    if ($error) {
        echo "❌ Connection still failed: $error\n";
        echo "HTTP Code: $httpCode\n";
    } else {
        echo "✅ Connection successful with SSL verification disabled\n";
        echo "HTTP Code: $httpCode\n";
        echo "Response: $response\n";
    }
} else {
    echo "✅ SSL connection successful!\n";
    echo "HTTP Code: $httpCode\n";
    echo "Response: $response\n";
}

curl_close($curl);

echo "\nNote: In production, always use SSL verification for security!\n";