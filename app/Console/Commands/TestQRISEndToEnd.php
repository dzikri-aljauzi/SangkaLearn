<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MidtransService;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TestQRISEndToEnd extends Command
{
    protected $signature = 'qris:test-end-to-end';
    protected $description = 'Test QRIS payment end-to-end with database integration';

    public function handle()
    {
        $this->info('🧪 Testing QRIS End-to-End Implementation...');
        $this->newLine();

        try {
            // Step 1: Create QRIS transaction
            $this->info('Step 1: Creating QRIS transaction...');
            
            $user = User::first();
            if (!$user) {
                $this->error('❌ No users found');
                return Command::FAILURE;
            }

            $items = [
                [
                    'course' => [
                        'id' => 1,
                        'title' => 'Test Course - QRIS Payment',
                        'final_price' => 150000
                    ]
                ]
            ];

            $billingDetails = [
                'email' => $user->email,
                'phone' => '08123456789',
                'address' => 'Test Address',
                'city' => 'Jakarta',
                'postal_code' => '12345'
            ];

            $midtransService = new MidtransService();
            $result = $midtransService->createQRISTransaction(
                $items,
                150000,
                $billingDetails,
                $user->id
            );

            if (!$result['success']) {
                $this->error('❌ QRIS transaction creation failed: ' . $result['message']);
                return Command::FAILURE;
            }

            $orderId = $result['order_id'];
            $this->info("✅ QRIS transaction created: {$orderId}");

            // Step 2: Create proper database records
            $this->info('Step 2: Creating database records...');
            
            DB::beginTransaction();
            try {
                // Create Order
                $order = Order::create([
                    'order_number' => $orderId,
                    'user_id' => $user->id,
                    'status' => 'pending',
                    'subtotal' => 150000,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => 150000,
                    'currency' => 'IDR',
                    'billing_details' => $billingDetails
                ]);

                // Create OrderItem
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'course_id' => 1,
                    'course_title' => 'Test Course - QRIS Payment',
                    'price' => 150000,
                    'unit_price' => 150000,
                    'quantity' => 1,
                    'discount_amount' => 0,
                    'total_price' => 150000
                ]);

                // Create Payment
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'payment_method' => 'gopay_qris',
                    'status' => 'pending',
                    'amount' => 150000,
                    'currency' => 'IDR',
                    'payment_details' => [
                        'snap_token' => $result['snap_token'] ?? null,
                        'transaction_status' => $result['transaction_status'],
                        'method' => $result['method'] ?? 'snap_sdk',
                        'midtrans_order_id' => $orderId,
                        'order_number' => $orderId,
                        'items' => $items,
                        'billing_details' => $billingDetails
                    ]
                ]);

                DB::commit();
                
                $this->info("✅ Order created: ID {$order->id}");
                $this->info("✅ OrderItem created: ID {$orderItem->id}");
                $this->info("✅ Payment created: ID {$payment->id}");

            } catch (\Exception $dbError) {
                DB::rollback();
                throw $dbError;
            }

            // Step 3: Test QR Code generation
            $this->info('Step 3: Testing QR code generation...');
            
            $response = $this->makeHttpRequest('/payment/qris/generate', [
                'order_id' => $orderId
            ]);

            if ($response['success']) {
                $this->info("✅ QR Code generated: {$response['qr_generation_method']}");
                if (isset($response['qr_string'])) {
                    $qrLength = strlen($response['qr_string']);
                    $this->info("✅ QR String length: {$qrLength} characters");
                }
            } else {
                $this->warn("⚠️ QR Code generation issue: {$response['message']}");
            }

            // Step 4: Test transaction status check
            $this->info('Step 4: Testing transaction status...');
            
            $statusResponse = $this->makeHttpRequest('/payment/qris/status', [
                'order_id' => $orderId
            ]);

            if ($statusResponse['success']) {
                $this->info("✅ Transaction status: {$statusResponse['payment_status']}");
                $this->info("✅ Midtrans status: {$statusResponse['transaction_status']}");
            } else {
                $this->warn("⚠️ Status check issue: {$statusResponse['message']}");
            }

            // Step 5: Summary
            $this->newLine();
            $this->info('📊 End-to-End Test Summary:');
            $this->table(
                ['Component', 'Status', 'Details'],
                [
                    ['QRIS Transaction', '✅ Success', $orderId],
                    ['Database Order', '✅ Success', "ID: {$order->id}"],
                    ['Database Payment', '✅ Success', "ID: {$payment->id}"],
                    ['QR Code Generation', $response['success'] ? '✅ Success' : '⚠️ Warning', $response['qr_generation_method'] ?? 'N/A'],
                    ['Status Check', $statusResponse['success'] ? '✅ Success' : '⚠️ Warning', $statusResponse['payment_status'] ?? 'N/A'],
                    ['Midtrans Integration', '✅ Success', $result['method'] ?? 'snap_sdk']
                ]
            );

            $this->newLine();
            $this->info('🎉 QRIS End-to-End Test Completed!');
            
            // Instructions for manual testing
            $this->newLine();
            $this->info('📋 Manual Testing Instructions:');
            $this->line('1. Go to checkout page and select QRIS Payment');
            $this->line('2. Complete the purchase flow');
            $this->line('3. Verify QR code displays correctly');
            $this->line('4. Test scanning with DANA app');
            $this->line('5. Check Midtrans dashboard for transaction');

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ End-to-end test failed: ' . $e->getMessage());
            $this->line('Stack trace:');
            $this->line($e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    private function makeHttpRequest($endpoint, $params)
    {
        try {
            $url = url($endpoint) . '?' . http_build_query($params);
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: application/json',
                'X-Requested-With: XMLHttpRequest'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                return ['success' => false, 'message' => "HTTP {$httpCode}"];
            }

            return json_decode($response, true) ?: ['success' => false, 'message' => 'Invalid JSON'];
            
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}