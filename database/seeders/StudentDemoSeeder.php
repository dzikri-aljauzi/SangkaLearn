<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class StudentDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles if they don't exist
        $studentRole = Role::firstOrCreate([
            'name' => 'student'
        ], [
            'display_name' => 'Student',
            'description' => 'Student role for learning management system',
            'is_active' => true
        ]);

        $instructorRole = Role::firstOrCreate([
            'name' => 'instructor'
        ], [
            'display_name' => 'Instructor',
            'description' => 'Instructor role for teaching',
            'is_active' => true
        ]);

        $adminRole = Role::firstOrCreate([
            'name' => 'admin'
        ], [
            'display_name' => 'Admin',
            'description' => 'Administrator role with full access',
            'is_active' => true
        ]);

        // Create demo students
        $students = [
            [
                'first_name' => 'Ahmad',
                'last_name' => 'Ridwan',
                'email' => 'ahmad.ridwan@example.com',
                'phone' => '+62 811-1234-5678',
                'is_active' => true,
                'city' => 'Jakarta',
                'country' => 'Indonesia'
            ],
            [
                'first_name' => 'Sari',
                'last_name' => 'Dewi', 
                'email' => 'sari.dewi@example.com',
                'phone' => '+62 812-9876-5432',
                'is_active' => true,
                'city' => 'Bandung',
                'country' => 'Indonesia'
            ],
            [
                'first_name' => 'Budi',
                'last_name' => 'Santoso',
                'email' => 'budi.santoso@example.com',
                'phone' => '+62 813-5555-1234',
                'is_active' => false,
                'city' => 'Surabaya',
                'country' => 'Indonesia'
            ],
            [
                'first_name' => 'Maya',
                'last_name' => 'Sari',
                'email' => 'maya.sari@example.com',
                'phone' => '+62 814-7777-8888',
                'is_active' => true,
                'city' => 'Yogyakarta',
                'country' => 'Indonesia'
            ]
        ];

        foreach ($students as $studentData) {
            $student = User::firstOrCreate([
                'email' => $studentData['email']
            ], array_merge($studentData, [
                'password' => Hash::make('password123'),
                'email_verified_at' => now()
            ]));

            // Assign student role
            if (!$student->roles()->where('name', 'student')->exists()) {
                $student->roles()->attach($studentRole->id);
            }
        }

        // Create demo instructors
        $instructors = [
            [
                'first_name' => 'Dr. Ahmad',
                'last_name' => 'Wijaya',
                'email' => 'ahmad.wijaya@example.com',
                'phone' => '+62 811-1111-2222',
                'is_active' => true,
                'city' => 'Jakarta',
                'country' => 'Indonesia'
            ],
            [
                'first_name' => 'Prof. Sari',
                'last_name' => 'Dewi',
                'email' => 'sari.dewi.instructor@example.com',
                'phone' => '+62 812-3333-4444',
                'is_active' => true,
                'city' => 'Bandung',
                'country' => 'Indonesia'
            ]
        ];

        foreach ($instructors as $instructorData) {
            $instructor = User::firstOrCreate([
                'email' => $instructorData['email']
            ], array_merge($instructorData, [
                'password' => Hash::make('password123'),
                'email_verified_at' => now()
            ]));

            // Assign instructor role
            if (!$instructor->roles()->where('name', 'instructor')->exists()) {
                $instructor->roles()->attach($instructorRole->id);
            }
        }

        // Create admin user if not exists
        $admin = User::firstOrCreate([
            'email' => 'admin@example.com'
        ], [
            'first_name' => 'Admin',
            'last_name' => 'System',
            'password' => Hash::make('admin123'),
            'is_active' => true,
            'email_verified_at' => now()
        ]);

        // Assign admin role
        if (!$admin->roles()->where('name', 'admin')->exists()) {
            $admin->roles()->attach($adminRole->id);
        }
    }
}