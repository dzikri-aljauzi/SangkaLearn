<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Midtrans\Config;
use Midtrans\Snap;

class TestMidtransMinimal extends Command
{
    protected $signature = 'midtrans:test-minimal';
    protected $description = 'Test Midtrans with absolute minimal valid parameters';

    public function handle()
    {
        $this->info('Testing Midtrans with minimal parameters...');
        $this->newLine();

        try {
            // Configure Midtrans
            Config::$serverKey = config('midtrans.server_key');
            Config::$clientKey = config('midtrans.client_key');
            Config::$isProduction = config('midtrans.is_production');
            Config::$isSanitized = config('midtrans.is_sanitized');
            Config::$is3ds = config('midtrans.is_3ds');
            
            // Disable SSL for testing
            Config::$curlOptions = [
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_TIMEOUT => 60,
            ];

            $orderId = 'TEST-MINIMAL-' . time();
            
            // Absolutely minimal valid parameters according to Midtrans docs
            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => 100000
                ],
                'customer_details' => [
                    'first_name' => 'Test',
                    'email' => 'test@example.com'
                ],
                'item_details' => [
                    [
                        'id' => '1',
                        'price' => 100000,
                        'quantity' => 1,
                        'name' => 'Test Item'
                    ]
                ]
            ];

            $this->info('📋 Parameters to send:');
            $this->line(json_encode($params, JSON_PRETTY_PRINT));
            $this->newLine();

            $this->info('🔄 Calling Midtrans API...');
            
            $snapToken = Snap::getSnapToken($params);
            
            $this->info('✅ SUCCESS! Token created: ' . substr($snapToken, 0, 50) . '...');
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            
            // Show detailed error analysis
            $message = $e->getMessage();
            $this->newLine();
            $this->warn('🔍 Error Analysis:');
            
            if (strpos($message, '400') !== false) {
                $this->line('• HTTP 400: Bad Request - Parameter validation failed');
                $this->line('• Check if all required fields are present and valid');
                $this->line('• Verify data types (integers, strings, etc.)');
            } elseif (strpos($message, '401') !== false) {
                $this->line('• HTTP 401: Unauthorized - Invalid API credentials');
                $this->line('• Check server key and client key configuration');
            } elseif (strpos($message, 'SSL') !== false) {
                $this->line('• SSL Certificate issue still present');
            }
            
            return Command::FAILURE;
        }
    }
}