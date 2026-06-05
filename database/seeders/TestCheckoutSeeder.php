<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\CartItem;
use App\Models\Category;

class TestCheckoutSeeder extends Seeder
{
    public function run()
    {
        // Create test student
        $student = User::firstOrCreate(
            ['email' => 'student.test@example.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Student',
                'password' => bcrypt('password'),
                'phone' => '+62812345678',
                'is_active' => true
            ]
        );

        // Assign student role
        $studentRole = \App\Models\Role::firstOrCreate(['name' => 'student']);
        if (!$student->roles()->where('role_id', $studentRole->id)->exists()) {
            $student->roles()->attach($studentRole->id);
        }

        // Create test instructor
        $instructor = User::firstOrCreate(
            ['email' => 'instructor.test@example.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Instructor',
                'password' => bcrypt('password'),
                'phone' => '+62812345679',
                'is_active' => true
            ]
        );

        // Create category
        $category = Category::firstOrCreate(
            ['slug' => 'test-category'],
            [
                'name' => 'Test Category',
                'slug' => 'test-category',
                'description' => 'Category for testing checkout'
            ]
        );

        // Create test course
        $course = Course::firstOrCreate(
            ['slug' => 'test-course-checkout'],
            [
                'title' => 'Test Course for Checkout',
                'subtitle' => 'Testing Midtrans Integration',
                'description' => 'This course is for testing checkout functionality.',
                'instructor_id' => $instructor->id,
                'category_id' => $category->id,
                'price' => 100000,
                'discount_price' => null,
                'status' => 'published',
                'access_type' => 'public',
                'is_free' => false,
                'is_featured' => true,
                'level' => 'beginner',
                'language' => 'id',
                'duration_hours' => 10,
                'has_certificate' => true,
                'published_at' => now()
            ]
        );

        // Add course to cart for testing
        CartItem::firstOrCreate(
            [
                'user_id' => $student->id,
                'course_id' => $course->id
            ],
            [
                'price' => $course->discount_price ?: $course->price,
                'discount_amount' => 0,
                'created_at' => now()
            ]
        );

        $this->command->info('✅ Test checkout data seeded successfully!');
        $this->command->info("📧 Test Student: student.test@example.com / password");
        $this->command->info("🛒 Cart item added for testing");
        $this->command->info("💰 Course price: Rp " . number_format($course->price, 0, ',', '.'));
    }
}