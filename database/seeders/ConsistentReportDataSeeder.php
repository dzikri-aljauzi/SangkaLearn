<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Enrollment;
use Carbon\Carbon;
use Faker\Factory as Faker;

class ConsistentReportDataSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get existing data
        $students = User::whereHas('roles', function($query) {
            $query->where('name', 'student');
        })->take(20)->get();
        
        $courses = Course::where('status', 'published')->get();
        
        if ($students->count() === 0 || $courses->count() === 0) {
            $this->command->error('No students or courses found. Run ComprehensiveDemoSeeder first.');
            return;
        }
        
        $this->command->info("Creating consistent report data for August 2025...");
        $this->command->info("Students: {$students->count()}, Courses: {$courses->count()}");
        
        // Create consistent data for August 2025
        $augustStart = Carbon::create(2025, 8, 1);
        $augustEnd = Carbon::create(2025, 8, 31);
        
        $totalRevenue = 0;
        $totalOrders = 0;
        $totalEnrollments = 0;
        
        // Create 10 orders in August
        for ($i = 1; $i <= 10; $i++) {
            $student = $students->random();
            $orderDate = $faker->dateTimeBetween($augustStart, $augustEnd);
            
            // Select 1-3 courses for this order
            $maxCourses = min(3, $courses->count());
            $orderCourses = $faker->randomElements($courses->toArray(), $faker->numberBetween(1, $maxCourses));
            
            // Calculate order totals
            $subtotal = 0;
            foreach ($orderCourses as $course) {
                $subtotal += $course['price'];
            }
            
            // Add small tax (10%)
            $taxAmount = $subtotal * 0.1;
            $totalAmount = $subtotal + $taxAmount;
            
            // Create order
            $order = Order::create([
                'order_number' => 'AUG-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'user_id' => $student->id,
                'status' => 'completed', // All orders completed for clean data
                'subtotal' => $subtotal,
                'discount_amount' => 0,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'currency' => 'IDR',
                'billing_details' => [
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'email' => $student->email,
                    'phone' => $faker->phoneNumber,
                    'address' => $faker->address
                ],
                'created_at' => $orderDate,
                'updated_at' => $orderDate
            ]);
            
            $totalOrders++;
            
            // Create order items
            foreach ($orderCourses as $course) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'course_id' => $course['id'],
                    'course_title' => $course['title'],
                    'unit_price' => $course['price'],
                    'discount_amount' => 0,
                    'total_price' => $course['price'],
                ]);
            }
            
            // Create payment (exactly matching order total)
            $paymentDate = Carbon::parse($orderDate)->addMinutes($faker->numberBetween(10, 60));
            Payment::create([
                'order_id' => $order->id,
                'user_id' => $student->id,
                'payment_method' => $faker->randomElement(['stripe', 'paypal', 'bank_transfer']),
                'transaction_id' => 'AUG-TXN-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'status' => 'completed',
                'amount' => $totalAmount, // EXACTLY matches order total
                'currency' => 'IDR',
                'payment_details' => [
                    'gateway' => $faker->randomElement(['stripe', 'paypal', 'midtrans']),
                    'reference_id' => $faker->uuid,
                ],
                'paid_at' => $paymentDate,
                'created_at' => $paymentDate,
                'updated_at' => $paymentDate
            ]);
            
            $totalRevenue += $totalAmount;
            
            // Create enrollments for each course in the order
            foreach ($orderCourses as $course) {
                $enrollmentDate = Carbon::parse($paymentDate)->addMinutes($faker->numberBetween(5, 30));
                Enrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course['id'],
                    'status' => $faker->randomElement(['active', 'completed']),
                    'progress_percentage' => $faker->numberBetween(10, 100),
                    'enrolled_at' => $enrollmentDate,
                    'completed_at' => $faker->boolean(30) ? $faker->dateTimeBetween($enrollmentDate, 'now') : null,
                    'total_time_spent' => $faker->numberBetween(3600, 18000), // 1-5 hours
                ]);
                
                $totalEnrollments++;
            }
            
            $this->command->info("Created Order #{$i}: Rp " . number_format($totalAmount, 2));
        }
        
        $this->command->info("\n=== SUMMARY ===");
        $this->command->info("Total Orders: {$totalOrders}");
        $this->command->info("Total Revenue: Rp " . number_format($totalRevenue, 2));
        $this->command->info("Total Enrollments: {$totalEnrollments}");
        $this->command->info("Consistent data created successfully!");
    }
}