<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestMidtransCurl extends Command
{
    protected $signature = 'midtrans:test-curl';
    protected $description = 'Test Midtrans with raw cURL to see exact API response';

    public function handle()
    {
        $this->info('Testing Midtrans with raw cURL...');
        $this->newLine();

        $serverKey = config('midtrans.server_key');
        $isProduction = config('midtrans.is_production');
        
        // Use correct endpoint based on environment
        $endpoint = $isProduction 
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
        
        $orderId = 'TEST-CURL-' . time();
        
        $data = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => 100000
            ],
            'customer_details' => [
                'first_name' => 'Test',
                'email' => 'test@example.com',
                'phone' => '08123456789'
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

        $this->info('🌐 Endpoint: ' . $endpoint);
        $this->info('📋 Data: ' . json_encode($data));
        $this->newLine();

        // Initialize cURL
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $endpoint,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Basic ' . base64_encode($serverKey . ':')
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        $this->info('📡 HTTP Status Code: ' . $httpCode);
        
        if ($curlError) {
            $this->error('❌ cURL Error: ' . $curlError);
            return Command::FAILURE;
        }

        if ($httpCode >= 400) {
            $this->error('❌ API Error Response:');
            $this->line($response);
            
            // Try to decode and show formatted error
            $errorData = json_decode($response, true);
            if ($errorData) {
                $this->newLine();
                $this->warn('🔍 Formatted Error:');
                $this->line(json_encode($errorData, JSON_PRETTY_PRINT));
                
                if (isset($errorData['error_messages'])) {
                    $this->warn('📝 Error Messages:');
                    foreach ($errorData['error_messages'] as $msg) {
                        $this->line('• ' . $msg);
                    }
                }
            }
            
            return Command::FAILURE;
        }

        $this->info('✅ Success Response:');
        $responseData = json_decode($response, true);
        
        if ($responseData && isset($responseData['token'])) {
            $this->line('Token: ' . substr($responseData['token'], 0, 50) . '...');
            $this->line('Redirect URL: ' . ($responseData['redirect_url'] ?? 'N/A'));
        } else {
            $this->line($response);
        }

        return Command::SUCCESS;
    }
}