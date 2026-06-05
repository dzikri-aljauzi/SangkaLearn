<?php

return [
    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),
    'merchant_id' => env('MIDTRANS_MERCHANT_ID'),
    
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),
    'is_3ds' => env('MIDTRANS_IS_3DS', true),
    
    'environment' => env('MIDTRANS_ENVIRONMENT', 'sandbox'),
    
    // SSL Configuration
    'curl_options' => [
        'ssl_verify_peer' => env('MIDTRANS_SSL_VERIFY_PEER', false),
        'ssl_verify_host' => env('MIDTRANS_SSL_VERIFY_HOST', false),
        CURLOPT_SSL_VERIFYPEER => env('MIDTRANS_SSL_VERIFY_PEER', false),
        CURLOPT_SSL_VERIFYHOST => env('MIDTRANS_SSL_VERIFY_HOST', false),
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
    ],
    
    // GoPay QRIS specific settings
    'gopay' => [
        'enabled' => env('GOPAY_QRIS_ENABLED', true),
        'qris_enabled' => env('QRIS_PAYMENT_ENABLED', true),
    ],
    
    // E-wallet settings
    'ewallet' => [
        'enabled_methods' => explode(',', env('EWALLET_PAYMENT_METHODS', 'gopay,ovo,dana,linkaja,shopeepay'))
    ],
    
    // Notification URLs
    'notification_url' => env('APP_URL') . '/payment/notification',
    'redirect_url' => env('APP_URL') . '/payment/finish',
    'cancel_url' => env('APP_URL') . '/payment/cancel'
];