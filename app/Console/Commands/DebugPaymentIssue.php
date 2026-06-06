<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Order;

class DebugPaymentIssue extends Command
{
    protected $signature = 'payment:debug-issue';
    protected $description = 'Debug the foreign key constraint issue in payments table';

    public function handle()
    {
        $this->info('🔍 Debugging Payment Foreign Key Issue...');
        $this->newLine();

        try {
            // Check user ID 7
            $this->info('1️⃣ Checking User ID 7:');
            $user = User::find(7);
            if ($user) {
                $this->line("✅ User found: {$user->name} ({$user->email})");
            } else {
                $this->error("❌ User ID 7 NOT FOUND");
                $maxUserId = User::max('id');
                $this->line("📊 Max User ID in database: {$maxUserId}");
                
                // Show available users
                $users = User::orderBy('id')->take(5)->get(['id', 'name', 'email']);
                $this->line("Available users:");
                foreach ($users as $u) {
                    $this->line("  • ID {$u->id}: {$u->name} ({$u->email})");
                }
            }

            $this->newLine();

            // Check orders table structure  
            $this->info('2️⃣ Checking Orders Table:');
            $orderCount = Order::count();
            $this->line("📊 Total orders: {$orderCount}");
            
            if ($orderCount > 0) {
                $orders = Order::orderBy('id', 'desc')->take(3)->get(['id', 'order_number', 'user_id', 'status']);
                $this->line("Recent orders:");
                foreach ($orders as $order) {
                    $this->line("  • ID {$order->id}: {$order->order_number} (User: {$order->user_id}, Status: {$order->status})");
                }
            }

            $this->newLine();

            // Analyze the problem
            $this->info('3️⃣ Problem Analysis:');
            $this->warn("❌ ISSUE: payments.order_id expects INTEGER (references orders.id)");
            $this->warn("❌ ISSUE: But PaymentController sends STRING (QRIS-1757160932-0007)");
            
            $this->newLine();
            
            $this->info('4️⃣ Possible Solutions:');
            $this->line('Option 1: Create Order record first, then use order.id');
            $this->line('Option 2: Change payments.order_id to store order_number as string');
            $this->line('Option 3: Remove foreign key constraint for QRIS payments');

            $this->newLine();

            // Show current schema issue
            $this->info('5️⃣ Schema Analysis:');
            $paymentsSchema = DB::select("PRAGMA table_info(payments)");
            $orderIdColumn = collect($paymentsSchema)->firstWhere('name', 'order_id');
            $this->line("payments.order_id type: {$orderIdColumn->type} (expects INTEGER)");
            
            $ordersSchema = DB::select("PRAGMA table_info(orders)");  
            $orderIdPrimary = collect($ordersSchema)->firstWhere('name', 'id');
            $this->line("orders.id type: {$orderIdPrimary->type} (PRIMARY KEY)");

            $this->newLine();
            $this->warn('💡 RECOMMENDED SOLUTION: Create Order record first for QRIS payments');

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}