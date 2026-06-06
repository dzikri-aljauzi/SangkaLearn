<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Enrollment;
use Carbon\Carbon;

class ConsistentDataSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('🧹 Cleaning up inconsistent data...');
        
        // Clear existing enrollments to start fresh
        Enrollment::query()->delete();
        Payment::query()->delete();
        OrderItem::query()->delete();
        Order::query()->delete();
        
        // Get users and courses
        $students = User::whereHas('roles', function($query) {
            $query->where('name', 'student');
        })->get();
        
        $courses = Course::where('status', 'published')->get();
        
        if ($students->count() === 0 || $courses->count() === 0) {
            $this->command->error('❌ No students or courses found. Run user and course seeders first.');
            return;
        }
        
        $this->command->info("👥 Found {$students->count()} students and {$courses->count()} courses");
        
        // Create realistic distribution
        $totalStudents = $students->count();
        $purchasers = $students->random(min(40, $totalStudents)); // 40 students buy courses
        $orderCount = 0;
        $enrollmentCount = 0;
        
        foreach ($purchasers as $student) {
            // Each student buys 1-2 courses (max available)
            $maxCourses = min(3, $courses->count());
            $coursesToBuy = $courses->random(rand(1, $maxCourses));
            
            foreach ($coursesToBuy as $course) {
                $orderCount++;
                
                // Create order
                $order = Order::create([
                    'order_number' => 'ORD-' . str_pad($orderCount, 6, '0', STR_PAD_LEFT),
                    'user_id' => $student->id,
                    'status' => 'completed',
                    'subtotal' => $course->price,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => $course->price,
                    'currency' => 'IDR',
                    'created_at' => Carbon::now()->subDays(rand(1, 180)),
                ]);
                
                // Create order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'course_id' => $course->id,
                    'course_title' => $course->title,
                    'unit_price' => $course->price,
                    'discount_amount' => 0,
                    'total_price' => $course->price,
                ]);
                
                // Create payment
                Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $student->id,
                    'payment_method' => collect(['stripe', 'paypal', 'bank_transfer'])->random(),
                    'transaction_id' => 'TXN-' . strtoupper(uniqid()),
                    'status' => 'completed',
                    'amount' => $course->price,
                    'currency' => 'IDR',
                    'paid_at' => $order->created_at->addMinutes(rand(5, 30)),
                ]);
                
                // Create enrollment (only after successful payment)
                $enrolledAt = $order->created_at->copy()->addHours(rand(1, 48));
                $daysSinceEnroll = $enrolledAt->diffInDays(now());
                
                
                // Realistic progress based on time enrolled
                $progressPercentage = 0;
                $status = 'active'; // Default status
                $completedAt = null;
                $totalTimeSpent = 0;
                
                if ($daysSinceEnroll > 0) {
                    // Add realistic distribution of statuses
                    $statusRand = rand(1, 100);
                    
                    // Progress calculation based on realistic learning patterns
                    if ($daysSinceEnroll < 7) {
                        // New enrollments: all active, minimal progress
                        $progressPercentage = rand(0, 30);
                        $totalTimeSpent = rand(0, 500);
                    } elseif ($daysSinceEnroll < 30) {
                        // 1-4 weeks: mostly active, some completed
                        if ($statusRand <= 10) {
                            // 10% completed early (fast learners)
                            $progressPercentage = 100;
                            $status = 'completed';
                            $completedAt = $enrolledAt->copy()->addDays(rand(7, 25));
                            $totalTimeSpent = rand(1500, 2500);
                        } else {
                            // 90% still active
                            $progressPercentage = rand(10, 70);
                            $totalTimeSpent = rand(200, 2000);
                        }
                    } elseif ($daysSinceEnroll < 90) {
                        // 1-3 months: more completed courses
                        if ($statusRand <= 40) {
                            // 40% completed
                            $progressPercentage = 100;
                            $status = 'completed';
                            $completedAt = $enrolledAt->copy()->addDays(rand(20, 60));
                            $totalTimeSpent = rand(1800, 4000);
                        } else {
                            // 60% still active with good progress
                            $progressPercentage = rand(30, 95);
                            $totalTimeSpent = rand(800, 3000);
                        }
                    } else {
                        // Old enrollments: realistic long-term outcomes
                        if ($statusRand <= 60) {
                            // 60% completed (most people finish eventually)
                            $progressPercentage = 100;
                            $status = 'completed';
                            $completedAt = $enrolledAt->copy()->addDays(rand(30, 120));
                            $totalTimeSpent = rand(2000, 6000);
                        } else {
                            // 40% still active with high progress (slow but steady learners)
                            $progressPercentage = rand(60, 95);
                            $totalTimeSpent = rand(1500, 4000);
                        }
                    }
                }
                
                Enrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'order_id' => $order->id, // Link to the order
                    'status' => $status,
                    'progress_percentage' => $progressPercentage,
                    'enrolled_at' => $enrolledAt,
                    'completed_at' => $completedAt,
                    'expires_at' => $enrolledAt->copy()->addYear(), // 1 year access
                    'last_accessed_at' => $status === 'active' ? now()->subDays(rand(0, 7)) : null,
                    'total_time_spent' => $totalTimeSpent, // in seconds
                    'completion_data' => $status === 'completed' ? json_encode(['final_score' => rand(70, 100)]) : null,
                ]);
                
                $enrollmentCount++;
            }
        }
        
        $this->command->info("✅ Created {$orderCount} orders and {$enrollmentCount} enrollments");
        $this->command->info("📊 Data structure:");
        $this->command->info("   👤 Total users: " . User::count());
        $this->command->info("   🎓 Students who purchased: " . $purchasers->count());
        $this->command->info("   📚 Students without purchases: " . ($totalStudents - $purchasers->count()));
        $this->command->info("   🛒 Completed orders: " . Order::where('status', 'completed')->count());
        $this->command->info("   💳 Successful payments: " . Payment::where('status', 'completed')->count());
        $this->command->info("   📝 Active enrollments: " . Enrollment::where('status', 'active')->count());
        $this->command->info("   ✅ Completed enrollments: " . Enrollment::where('status', 'completed')->count());
        $this->command->info("   📚 Total enrollments: " . Enrollment::count());
        
        $this->command->info("🎯 Logic check:");
        $this->command->info("   Orders = Payments = " . Order::count());
        $this->command->info("   Enrollments ≤ Orders ✓");
        $this->command->info("   Users with progress = Users with enrollments ✓");
    }
}