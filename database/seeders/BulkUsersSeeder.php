<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class BulkUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating 20 Students...');
        $this->createStudents();

        $this->command->info('Creating 20 Instructors...');
        $this->createInstructors();

        $this->command->info('Creating 20 Sub Admins...');
        $this->createSubAdmins();

        $this->command->info('Bulk users created successfully!');
    }

    /**
     * Create 20 students
     */
    private function createStudents(): void
    {
        $studentRole = Role::where('name', 'student')->first();

        if (!$studentRole) {
            $this->command->error('Student role not found! Please run RoleSeeder first.');
            return;
        }

        for ($i = 1; $i <= 20; $i++) {
            $user = User::create([
                'first_name' => 'Student',
                'last_name' => $i,
                'email' => "student{$i}@lms.test",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'user_type' => 'general',
                'phone' => '08' . str_pad($i, 10, '0', STR_PAD_LEFT),
                'gender' => $i % 2 == 0 ? 'male' : 'female',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
            ]);

            $user->roles()->attach($studentRole->id);

            $this->command->info("Created: {$user->email}");
        }
    }

    /**
     * Create 20 instructors
     */
    private function createInstructors(): void
    {
        $instructorRole = Role::where('name', 'instructor')->first();

        if (!$instructorRole) {
            $this->command->error('Instructor role not found! Please run RoleSeeder first.');
            return;
        }

        for ($i = 1; $i <= 20; $i++) {
            $user = User::create([
                'first_name' => 'Instructor',
                'last_name' => $i,
                'email' => "instructor{$i}@lms.test",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'phone' => '08' . str_pad(1000 + $i, 10, '0', STR_PAD_LEFT),
                'gender' => $i % 2 == 0 ? 'male' : 'female',
                'job_title' => 'Professional Instructor',
                'bio' => "Experienced instructor specializing in various topics. Passionate about teaching and helping students achieve their goals.",
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'experience_years' => rand(1, 10),
            ]);

            $user->roles()->attach($instructorRole->id);

            $this->command->info("Created: {$user->email}");
        }
    }

    /**
     * Create 20 sub admins
     */
    private function createSubAdmins(): void
    {
        $subAdminRole = Role::where('name', 'sub_admin')->first();

        if (!$subAdminRole) {
            $this->command->error('Sub Admin role not found! Please run RoleSeeder first.');
            return;
        }

        for ($i = 1; $i <= 20; $i++) {
            $user = User::create([
                'first_name' => 'SubAdmin',
                'last_name' => $i,
                'email' => "subadmin{$i}@lms.test",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'phone' => '08' . str_pad(2000 + $i, 10, '0', STR_PAD_LEFT),
                'gender' => $i % 2 == 0 ? 'male' : 'female',
                'job_title' => 'Sub Administrator',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
            ]);

            $user->roles()->attach($subAdminRole->id);

            $this->command->info("Created: {$user->email}");
        }
    }
}
