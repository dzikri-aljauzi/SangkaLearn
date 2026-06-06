<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Payment;
use App\Models\Order;

class DebugPaymentData extends Command
{
    protected $signature = 'payment:debug-data';
    protected $description = 'Debug payment data and order_id mismatch';

    public function handle()
    {
        $this->info('🔍 Debugging Payment Data...');
        $this->newLine();

        try {
            // Show recent payments
            $payments = Payment::with('order')->orderBy('id', 'desc')->take(5)->get();
            
            $this->info('📊 Recent Payments:');
            $this->table(
                ['Payment ID', 'Order ID (DB)', 'Order Number', 'Midtrans Order ID', 'Method', 'Status'],
                $payments->map(function($payment) {
                    $paymentDetails = $payment->payment_details ?? [];
                    $midtransOrderId = $paymentDetails['midtrans_order_id'] ?? 'N/A';
                    $orderNumber = $payment->order ? $payment->order->order_number : 'N/A';
                    
                    return [
                        $payment->id,
                        $payment->order_id, // This is INTEGER (DB order.id)
                        $orderNumber,       // This is STRING (like QRIS-xxx)
                        $midtransOrderId,   // This is STRING (Midtrans order ID)
                        $payment->payment_method,
                        $payment->status
                    ];
                })->toArray()
            );

            $this->newLine();
            
            // Show the mismatch problem
            $this->info('🔍 Problem Analysis:');
            if ($payments->count() > 0) {
                $lastPayment = $payments->first();
                $paymentDetails = $lastPayment->payment_details ?? [];
                $midtransOrderId = $paymentDetails['midtrans_order_id'] ?? null;
                
                $this->line("Latest Payment:");
                $this->line("├─ payment.order_id (DB): {$lastPayment->order_id} (INTEGER)");
                $this->line("├─ order.order_number: " . ($lastPayment->order ? $lastPayment->order->order_number : 'N/A') . " (STRING)");
                $this->line("└─ midtrans_order_id: {$midtransOrderId} (STRING)");
                
                $this->newLine();
                $this->warn('❌ MISMATCH PROBLEM:');
                $this->line('• Frontend sends: order_id = "QRIS-1757160932-0007" (STRING)');
                $this->line('• Database stores: order_id = 8 (INTEGER)');
                $this->line('• Query fails: Payment::where("order_id", "QRIS-1757160932-0007") → No results');
                
                $this->newLine();
                $this->info('✅ SOLUTION OPTIONS:');
                $this->line('1. Search by payment_details->midtrans_order_id (JSON search)');
                $this->line('2. Search via order.order_number relationship');
                $this->line('3. Change frontend to use payment.id instead');
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}