<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Enrollment;
use App\Models\Order;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ComprehensiveDemoSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Create roles if they don't exist
        $roles = ['admin', 'instructor', 'student'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName], [
                'name' => $roleName,
                'display_name' => ucfirst($roleName),
                'description' => ucfirst($roleName) . ' role',
                'permissions' => json_encode([])
            ]);
        }

        // Get role IDs
        $adminRole = Role::where('name', 'admin')->first();
        $instructorRole = Role::where('name', 'instructor')->first(); 
        $studentRole = Role::where('name', 'student')->first();

        // Create admin user if doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
        
        // Assign admin role
        if (!$admin->roles()->where('role_id', $adminRole->id)->exists()) {
            $admin->roles()->attach($adminRole->id);
        }

        // Create instructors
        $instructors = [];
        for ($i = 1; $i <= 5; $i++) {
            $instructor = User::firstOrCreate(
                ['email' => "instructor{$i}@example.com"],
                [
                    'first_name' => $faker->firstName,
                    'last_name' => $faker->lastName,
                    'email' => "instructor{$i}@example.com",
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                    'phone' => $faker->phoneNumber,
                    'bio' => $faker->text(200),
                    'job_title' => $faker->jobTitle,
                    'company' => $faker->company,
                    'created_at' => $faker->dateTimeBetween('-6 months', 'now'),
                ]
            );
            
            if (!$instructor->roles()->where('role_id', $instructorRole->id)->exists()) {
                $instructor->roles()->attach($instructorRole->id);
            }
            
            $instructors[] = $instructor;
        }

        // Create students  
        $students = [];
        for ($i = 1; $i <= 50; $i++) {
            $student = User::firstOrCreate(
                ['email' => "student{$i}@example.com"],
                [
                    'first_name' => $faker->firstName,
                    'last_name' => $faker->lastName,
                    'email' => "student{$i}@example.com",
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_active' => $faker->boolean(90), // 90% active
                    'phone' => $faker->phoneNumber,
                    'date_of_birth' => $faker->dateTimeBetween('-50 years', '-18 years'),
                    'bio' => $faker->text(150),
                    'job_title' => $faker->jobTitle,
                    'company' => $faker->company,
                    'last_login_at' => $faker->dateTimeBetween('-1 month', 'now'),
                    'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
                ]
            );
            
            if (!$student->roles()->where('role_id', $studentRole->id)->exists()) {
                $student->roles()->attach($studentRole->id);
            }
            
            $students[] = $student;
        }

        // Create courses if Course model exists
        try {
            $courses = [];
            $courseTopics = [
                'JavaScript Fundamentals',
                'React Development',
                'PHP Laravel Framework', 
                'Python Data Science',
                'UI/UX Design Principles',
                'Mobile App Development',
                'Database Design',
                'Digital Marketing',
                'Machine Learning Basics',
                'Web Security',
                'Cloud Computing',
                'DevOps Practices',
                'Graphic Design',
                'Project Management',
                'Business Analysis'
            ];

            foreach ($courseTopics as $index => $topic) {
                $instructor = $instructors[array_rand($instructors)];
                
                $course = Course::firstOrCreate(
                    ['title' => $topic],
                    [
                        'title' => $topic,
                        'slug' => \Str::slug($topic),
                        'description' => $faker->text(300),
                        'short_description' => $faker->text(100),
                        'instructor_id' => $instructor->id,
                        'price' => $faker->randomFloat(2, 50000, 500000), // IDR
                        'duration_hours' => $faker->numberBetween(10, 100),
                        'level' => $faker->randomElement(['beginner', 'intermediate', 'advanced']),
                        'status' => $faker->randomElement(['published', 'draft']),
                        'thumbnail' => '/images/course-placeholder.jpg',
                        'is_featured' => $faker->boolean(30),
                        'created_at' => $faker->dateTimeBetween('-8 months', 'now'),
                    ]
                );
                
                $courses[] = $course;
            }

            // Create lessons for courses
            foreach ($courses as $course) {
                $lessonCount = $faker->numberBetween(5, 15);
                for ($i = 1; $i <= $lessonCount; $i++) {
                    Lesson::firstOrCreate(
                        [
                            'course_id' => $course->id,
                            'title' => "Lesson {$i}: " . $faker->sentence(3)
                        ],
                        [
                            'course_id' => $course->id,
                            'title' => "Lesson {$i}: " . $faker->sentence(3),
                            'slug' => \Str::slug("lesson-{$i}-" . $faker->word),
                            'content' => $faker->text(500),
                            'video_url' => null,
                            'duration_minutes' => $faker->numberBetween(5, 30),
                            'order' => $i,
                            'is_preview' => $i === 1 ? true : $faker->boolean(20),
                        ]
                    );
                }
            }

            // Create enrollments
            foreach ($students as $student) {
                $enrollmentCount = $faker->numberBetween(1, 5);
                $selectedCourses = $faker->randomElements($courses, $enrollmentCount);
                
                foreach ($selectedCourses as $course) {
                    $enrollment = Enrollment::firstOrCreate(
                        [
                            'user_id' => $student->id,
                            'course_id' => $course->id
                        ],
                        [
                            'user_id' => $student->id,
                            'course_id' => $course->id,
                            'enrolled_at' => $faker->dateTimeBetween('-6 months', 'now'),
                            'status' => $faker->randomElement(['active', 'completed', 'paused']),
                            'progress_percentage' => $faker->numberBetween(0, 100),
                            'completed_at' => $faker->boolean(30) ? $faker->dateTimeBetween('-3 months', 'now') : null,
                        ]
                    );
                }
            }

            // Create orders 
            try {
                $orderStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
                foreach ($students as $student) {
                    if ($faker->boolean(70)) { // 70% chance of having an order
                        $orderCourses = $faker->randomElements($courses, $faker->numberBetween(1, 3));
                        $totalAmount = array_sum(array_column($orderCourses, 'price'));
                        
                        Order::firstOrCreate(
                            [
                                'user_id' => $student->id,
                                'order_number' => 'ORD-' . $faker->unique()->numerify('######')
                            ],
                            [
                                'user_id' => $student->id,
                                'order_number' => 'ORD-' . $faker->unique()->numerify('######'),
                                'total_amount' => $totalAmount,
                                'status' => $faker->randomElement($orderStatuses),
                                'payment_method' => $faker->randomElement(['credit_card', 'bank_transfer', 'e_wallet']),
                                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
                            ]
                        );
                    }
                }
            } catch (\Exception $e) {
                // Orders table might not exist, skip
            }

        } catch (\Exception $e) {
            // Course/Lesson tables might not exist, skip course creation
            $this->command->info('Skipping course creation - tables may not exist: ' . $e->getMessage());
        }

        $this->command->info('Comprehensive demo data created successfully!');
        $this->command->info('Admin: admin@example.com / password');
        $this->command->info('Instructors: instructor1@example.com to instructor5@example.com / password');
        $this->command->info('Students: student1@example.com to student50@example.com / password');
    }
}