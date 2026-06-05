<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MidtransService;
use App\Models\User;

class TestQRISPayment extends Command
{
    protected $signature = 'gopay:test-implementation';
    protected $description = 'Test GoPay payment implementation';

    public function handle()
    {
        $this->info('🧪 Testing GoPay Implementation...');
        $this->newLine();

        try {
            // Get first user
            $user = User::first();
            
            if (!$user) {
                $this->error("No users found in database");
                return Command::FAILURE;
            }
            
            $this->info("✅ Test user: {$user->name} ({$user->email})");
            $this->newLine();

            $midtransService = new MidtransService();
            
            // Mock test data
            $mockItems = [
                [
                    'course' => [
                        'id' => 1,
                        'title' => 'Test Course - Laravel Development',
                        'final_price' => 100000
                    ]
                ]
            ];
            
            $mockBillingDetails = [
                'email' => $user->email,
                'phone' => '081234567890',
                'address' => 'Test Address',
                'city' => 'Jakarta',
                'postal_code' => '12345'
            ];
            
            $this->info('🔄 Creating QRIS transaction...');
            
            $result = $midtransService->createQRISTransaction(
                $mockItems,
                100000,
                $mockBillingDetails,
                $user->id
            );
            
            if ($result['success']) {
                $this->info('✅ QRIS Transaction Created Successfully!');
                $this->newLine();
                $this->line('📋 Transaction Details:');
                $this->line("├─ Order ID: {$result['order_id']}");
                $this->line("├─ Total: Rp " . number_format($result['total']));
                $this->line("├─ Transaction Status: " . ($result['transaction_status'] ?? 'N/A'));
                $this->line("├─ QR Code URL: " . ($result['qr_code_url'] ? 'Available' : 'Not Available'));
                $this->line("├─ Actions Count: " . count($result['actions'] ?? []));
                $this->line("└─ Message: {$result['message']}");
                
                if ($result['qr_code_url']) {
                    $this->newLine();
                    $this->info('🎯 QR Code URL:');
                    $this->line($result['qr_code_url']);
                }
                
                $this->newLine();
                $this->info('🎉 New QRIS implementation working correctly!');
                
                return Command::SUCCESS;
            } else {
                $this->error('❌ QRIS Transaction Failed');
                $this->error($result['message'] ?? 'Unknown error');
                return Command::FAILURE;
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Exception occurred: ' . $e->getMessage());
            $this->newLine();
            
            // SSL specific error handling
            if (strpos($e->getMessage(), 'SSL certificate problem') !== false) {
                $this->error('🔒 SSL Issue Still Present!');
                $this->warn('The SSL certificate problem has not been fully resolved.');
            } else {
                $this->warn('💡 Error Details:');
                $this->line('   File: ' . $e->getFile() . ':' . $e->getLine());
            }
            
            return Command::FAILURE;
        }
    }
}