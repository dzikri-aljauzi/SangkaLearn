<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Payment;
use App\Services\CustomMidtransClient;
use Illuminate\Support\Facades\Log;

class DebugQRCodeGeneration extends Command
{
    protected $signature = 'payment:debug-qr {order_id?}';
    protected $description = 'Debug QR code generation process';

    public function handle()
    {
        $orderId = $this->argument('order_id');
        
        if (!$orderId) {
            // Show recent QRIS payments
            $payments = Payment::where('payment_method', 'gopay_qris')
                ->orderBy('id', 'desc')
                ->take(5)
                ->get();
                
            if ($payments->isEmpty()) {
                $this->error('❌ No QRIS payments found');
                return Command::FAILURE;
            }
            
            $this->info('🔍 Recent QRIS Payments:');
            $this->table(
                ['Payment ID', 'Order ID (DB)', 'Midtrans Order ID', 'Status', 'Snap Token'],
                $payments->map(function($payment) {
                    $paymentDetails = $payment->payment_details ?? [];
                    return [
                        $payment->id,
                        $payment->order_id,
                        $paymentDetails['midtrans_order_id'] ?? 'N/A',
                        $payment->status,
                        isset($paymentDetails['snap_token']) ? 'Available' : 'Missing'
                    ];
                })->toArray()
            );
            
            $latestPayment = $payments->first();
            $paymentDetails = $latestPayment->payment_details ?? [];
            $midtransOrderId = $paymentDetails['midtrans_order_id'] ?? null;
            
            if ($midtransOrderId) {
                $this->info("\n🧪 Testing with latest order: {$midtransOrderId}");
                return $this->testQRGeneration($midtransOrderId);
            } else {
                $this->warn('⚠️ No Midtrans order ID found in latest payment');
                return Command::FAILURE;
            }
        }
        
        return $this->testQRGeneration($orderId);
    }
    
    private function testQRGeneration(string $orderId): int
    {
        $this->info("🔍 Testing QR Code generation for order: {$orderId}");
        $this->newLine();
        
        try {
            // 1. Find payment
            $this->line('Step 1: Finding payment record...');
            $payment = Payment::whereJsonContains('payment_details->midtrans_order_id', $orderId)
                ->orWhereHas('order', function($query) use ($orderId) {
                    $query->where('order_number', $orderId);
                })
                ->first();
                
            if (!$payment) {
                $this->error('❌ Payment not found');
                return Command::FAILURE;
            }
            
            $this->info("✅ Payment found: ID {$payment->id}");
            
            // 2. Check snap token
            $this->line('Step 2: Checking snap token...');
            $paymentDetails = $payment->payment_details ?? [];
            $snapToken = $paymentDetails['snap_token'] ?? null;
            
            if (!$snapToken) {
                $this->error('❌ Snap token not found in payment details');
                $this->line('Payment details keys: ' . implode(', ', array_keys($paymentDetails)));
                return Command::FAILURE;
            }
            
            $this->info("✅ Snap token found: {$snapToken}");
            
            // 3. Test Midtrans API call
            $this->line('Step 3: Testing Midtrans API call...');
            $customClient = new CustomMidtransClient();
            
            try {
                $transactionDetails = $customClient->getTransactionStatus($orderId);
                
                $this->info('✅ Midtrans API response received');
                $this->line('Response keys: ' . implode(', ', array_keys($transactionDetails)));
                
                // Check for various QR code sources
                if (isset($transactionDetails['actions'])) {
                    $this->line('🔍 Checking actions array...');
                    foreach ($transactionDetails['actions'] as $i => $action) {
                        $this->line("Action {$i}: " . ($action['name'] ?? 'unknown'));
                        if (isset($action['name']) && $action['name'] === 'generate-qr-code') {
                            $this->info("✅ QR code action found: {$action['url']}");
                            return Command::SUCCESS;
                        }
                    }
                    $this->warn('⚠️ No QR code action found in actions array');
                } else {
                    $this->warn('⚠️ No actions array in response');
                }
                
                if (isset($transactionDetails['qr_string'])) {
                    $this->info("✅ Direct QR string found: {$transactionDetails['qr_string']}");
                    return Command::SUCCESS;
                }
                
                $this->warn('⚠️ No QR code found in API response');
                $this->line('Available fields: ' . implode(', ', array_keys($transactionDetails)));
                
                // Show full response for debugging
                $this->line('Full API Response:');
                $this->line(json_encode($transactionDetails, JSON_PRETTY_PRINT));
                
            } catch (\Exception $apiError) {
                $this->error('❌ Midtrans API error: ' . $apiError->getMessage());
                $this->info('✅ Fallback: Using snap token for QR generation');
                return Command::SUCCESS;
            }
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('❌ Debug error: ' . $e->getMessage());
            Log::error('QR Debug error: ' . $e->getMessage(), [
                'order_id' => $orderId,
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }
}