<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'admin@lmsbdi.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'phone' => '+62812345678',
            'job_title' => 'System Administrator',
            'company' => 'LeadNEX',
            'timezone' => 'Asia/Jakarta',
            'language' => 'id',
            'is_active' => true,
            'last_login_at' => now(),
        ]);

        // Assign admin role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->roles()->attach($adminRole->id);
        }

        // Create Instructor Users
        $instructors = [
            [
                'first_name' => 'Dr. Budi',
                'last_name' => 'Santoso',
                'email' => 'budi.santoso@lmsbdi.com',
                'job_title' => 'Senior Digital Marketing Expert',
                'company' => 'Google Indonesia',
                'bio' => 'Pakar Digital Marketing dengan pengalaman 15+ tahun di industri teknologi.',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Wijaya',
                'email' => 'sarah.wijaya@lmsbdi.com',
                'job_title' => 'Lead Software Engineer',
                'company' => 'Gojek',
                'bio' => 'Full-stack developer dengan expertise dalam React, Laravel, dan cloud computing.',
            ],
            [
                'first_name' => 'Ahmad',
                'last_name' => 'Rahman',
                'email' => 'ahmad.rahman@lmsbdi.com',
                'job_title' => 'Data Science Manager',
                'company' => 'Tokopedia',
                'bio' => 'Data scientist berpengalaman dengan fokus pada machine learning dan AI.',
            ],
        ];

        $instructorRole = Role::where('name', 'instructor')->first();

        foreach ($instructors as $instructorData) {
            $instructor = User::create(array_merge($instructorData, [
                'email_verified_at' => now(),
                'password' => Hash::make('instructor123'),
                'phone' => '+6281' . rand(1000000, 9999999),
                'timezone' => 'Asia/Jakarta',
                'language' => 'id',
                'is_active' => true,
                'last_login_at' => now(),
            ]));

            if ($instructorRole) {
                $instructor->roles()->attach($instructorRole->id);
            }
        }

        // Create Student Users
        $students = [
            [
                'first_name' => 'Andi',
                'last_name' => 'Pratama',
                'email' => 'andi.pratama@student.com',
                'job_title' => 'Fresh Graduate',
                'company' => 'Universitas Indonesia',
            ],
            [
                'first_name' => 'Siti',
                'last_name' => 'Nurhaliza',
                'email' => 'siti.nurhaliza@student.com',
                'job_title' => 'Marketing Associate',
                'company' => 'PT. Maju Bersama',
            ],
            [
                'first_name' => 'Rudi',
                'last_name' => 'Hermawan',
                'email' => 'rudi.hermawan@student.com',
                'job_title' => 'Junior Developer',
                'company' => 'Startup Tech',
            ],
            [
                'first_name' => 'Maya',
                'last_name' => 'Sari',
                'email' => 'maya.sari@student.com',
                'job_title' => 'Content Creator',
                'company' => 'Freelancer',
            ],
            [
                'first_name' => 'Dedi',
                'last_name' => 'Kurniawan',
                'email' => 'dedi.kurniawan@student.com',
                'job_title' => 'Sales Executive',
                'company' => 'PT. Digital Solusi',
            ],
        ];

        $studentRole = Role::where('name', 'student')->first();

        foreach ($students as $studentData) {
            $student = User::create(array_merge($studentData, [
                'email_verified_at' => now(),
                'password' => Hash::make('student123'),
                'phone' => '+6282' . rand(1000000, 9999999),
                'timezone' => 'Asia/Jakarta',
                'language' => 'id',
                'is_active' => true,
                'last_login_at' => now(),
            ]));

            if ($studentRole) {
                $student->roles()->attach($studentRole->id);
            }
        }

        // Create test users for development
        if (app()->environment('local')) {
            // Test Admin
            $testAdmin = User::create([
                'first_name' => 'Test',
                'last_name' => 'Admin',
                'email' => 'test@admin.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);
            if ($adminRole) {
                $testAdmin->roles()->attach($adminRole->id);
            }

            // Test Instructor
            $testInstructor = User::create([
                'first_name' => 'Test',
                'last_name' => 'Instructor',
                'email' => 'test@instructor.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);
            if ($instructorRole) {
                $testInstructor->roles()->attach($instructorRole->id);
            }

            // Test Student
            $testStudent = User::create([
                'first_name' => 'Test',
                'last_name' => 'Student',
                'email' => 'test@student.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);
            if ($studentRole) {
                $testStudent->roles()->attach($studentRole->id);
            }
        }

        $this->command->info('Created users:');
        $this->command->info('- Admin: admin@lmsbdi.com / password123');
        $this->command->info('- Instructors: budi.santoso@lmsbdi.com, sarah.wijaya@lmsbdi.com, ahmad.rahman@lmsbdi.com / instructor123');
        $this->command->info('- Students: andi.pratama@student.com, etc. / student123');
        
        if (app()->environment('local')) {
            $this->command->info('- Test users: test@admin.com, test@instructor.com, test@student.com / password');
        }
    }
}