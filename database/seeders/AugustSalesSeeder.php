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

class AugustSalesSeeder extends Seeder
{
    /**
     * Run the database seeders untuk Agustus 2025.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get students yang belum beli course
        $students = User::whereHas('roles', function($query) {
            $query->where('name', 'student');
        })->whereNotIn('id', function($query) {
            $query->select('user_id')->from('orders')->where('status', 'completed');
        })->take(15)->get(); // Ambil 15 student yang belum pernah beli
        
        $courses = Course::where('status', 'published')->get();
        
        if ($students->count() === 0 || $courses->count() === 0) {
            $this->command->error('No available students or courses found.');
            return;
        }
        
        $this->command->info("Creating August 2025 sales data...");
        $this->command->info("Available students: {$students->count()}, Courses: {$courses->count()}");
        
        $augustStart = Carbon::create(2025, 8, 1);
        $augustEnd = Carbon::create(2025, 8, 31, 23, 59, 59);
        
        $totalOrders = 0;
        $totalRevenue = 0;
        $totalEnrollments = 0;
        $orderCounter = 1; // Untuk unique order numbers
        
        // Create sales spread across August 2025
        $salesDates = [
            Carbon::create(2025, 8, 3), // Weekend sales
            Carbon::create(2025, 8, 5), 
            Carbon::create(2025, 8, 8), 
            Carbon::create(2025, 8, 12), 
            Carbon::create(2025, 8, 15), // Mid month
            Carbon::create(2025, 8, 18), 
            Carbon::create(2025, 8, 22), 
            Carbon::create(2025, 8, 25), 
            Carbon::create(2025, 8, 28), // End of month rush
            Carbon::create(2025, 8, 30), 
        ];
        
        $studentIndex = 0;
        
        foreach ($salesDates as $saleDate) {
            // 1 penjualan per tanggal untuk memastikan ada data
            $salesCount = 1;
            
            for ($i = 0; $i < $salesCount && $studentIndex < $students->count(); $i++) {
                $student = $students[$studentIndex];
                $studentIndex++;
                
                // Random pilih course (1 atau semua)
                if ($faker->boolean(70)) {
                    // 70% chance beli semua course (bundle)
                    $selectedCourses = $courses->toArray();
                    $subtotal = 500000 + 750000; // Laravel + React = 1,250,000
                } else {
                    // 30% chance beli 1 course saja
                    $selectedCourses = [$faker->randomElement($courses->toArray())];
                    $subtotal = $selectedCourses[0]['price'];
                }
                
                $totalAmount = $subtotal;
                
                // Random waktu dalam hari tersebut
                $orderTime = $saleDate->copy()
                    ->addHours($faker->numberBetween(9, 20))
                    ->addMinutes($faker->numberBetween(0, 59));
                
                // Create order
                $orderNumber = 'AUG25-' . str_pad($orderCounter, 4, '0', STR_PAD_LEFT);
                $orderCounter++;
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $student->id,
                    'status' => 'completed',
                    'subtotal' => $subtotal,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => $totalAmount,
                    'currency' => 'IDR',
                    'billing_details' => [
                        'name' => $student->first_name . ' ' . $student->last_name,
                        'email' => $student->email,
                        'phone' => $faker->phoneNumber,
                    ],
                    'created_at' => $orderTime,
                    'updated_at' => $orderTime
                ]);
                
                // Create order items
                foreach ($selectedCourses as $course) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'course_id' => $course['id'],
                        'course_title' => $course['title'],
                        'unit_price' => $course['price'],
                        'discount_amount' => 0,
                        'total_price' => $course['price'],
                    ]);
                }
                
                // Create payment
                $paymentTime = $orderTime->copy()->addMinutes($faker->numberBetween(2, 15));
                Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $student->id,
                    'payment_method' => $faker->randomElement(['stripe', 'paypal', 'bank_transfer']),
                    'transaction_id' => 'PAY-' . $orderNumber,
                    'status' => 'completed',
                    'amount' => $totalAmount,
                    'currency' => 'IDR',
                    'payment_details' => [
                        'gateway' => $faker->randomElement(['stripe', 'paypal', 'midtrans']),
                        'reference_id' => $faker->uuid,
                    ],
                    'paid_at' => $paymentTime,
                    'created_at' => $paymentTime,
                    'updated_at' => $paymentTime
                ]);
                
                // Create enrollments
                foreach ($selectedCourses as $course) {
                    $enrollmentTime = $paymentTime->copy()->addMinutes($faker->numberBetween(1, 5));
                    Enrollment::create([
                        'user_id' => $student->id,
                        'course_id' => $course['id'],
                        'status' => $faker->randomElement(['active', 'completed']),
                        'progress_percentage' => $faker->numberBetween(5, 95),
                        'enrolled_at' => $enrollmentTime,
                        'completed_at' => $faker->boolean(20) ? $faker->dateTimeBetween($enrollmentTime, $augustEnd) : null,
                        'total_time_spent' => $faker->numberBetween(1800, 10800), // 30min - 3hours
                    ]);
                    
                    $totalEnrollments++;
                }
                
                $totalOrders++;
                $totalRevenue += $totalAmount;
                
                $courseNames = implode(' + ', array_column($selectedCourses, 'title'));
                $this->command->info("✅ {$saleDate->format('M d')}: {$student->email} bought {$courseNames} - Rp " . number_format($totalAmount, 0));
            }
        }
        
        $this->command->info("\n=== AUGUST 2025 SALES DATA CREATED ===");
        $this->command->info("📅 Period: August 1-31, 2025");
        $this->command->info("🛒 Total Orders: {$totalOrders}");
        $this->command->info("💰 Total Revenue: Rp " . number_format($totalRevenue, 0));
        $this->command->info("🎓 Total Enrollments: {$totalEnrollments}");
        $this->command->info("📊 Data spread across 10 days in August");
        $this->command->info("✅ Perfect for monthly reports!");
    }
}