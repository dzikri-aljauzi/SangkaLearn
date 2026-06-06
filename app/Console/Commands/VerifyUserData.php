<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class VerifyUserData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:verify {--email= : Specific user email to check}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify user data consistency and display user information';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== User Data Verification ===');
        $this->newLine();

        if ($this->option('email')) {
            $this->verifySpecificUser($this->option('email'));
        } else {
            $this->verifyAllUsers();
        }

        return Command::SUCCESS;
    }

    private function verifySpecificUser($email)
    {
        $user = User::with('roles')->where('email', $email)->first();

        if (!$user) {
            $this->error("User not found: {$email}");
            return;
        }

        $this->info("User Information:");
        $this->table(
            ['Field', 'Value'],
            [
                ['ID', $user->id],
                ['Name', $user->first_name . ' ' . $user->last_name],
                ['Email', $user->email],
                ['Active', $user->is_active ? 'Yes' : 'No'],
                ['Verified', $user->email_verified_at ? 'Yes' : 'No'],
                ['User Type', $user->user_type ?? 'general'],
                ['Created', $user->created_at],
                ['Last Login', $user->last_login_at ?? 'Never'],
            ]
        );

        $this->newLine();
        $this->info("Roles:");
        if ($user->roles->isEmpty()) {
            $this->warn("  No roles assigned!");
        } else {
            foreach ($user->roles as $role) {
                $this->line("  - {$role->name} (ID: {$role->id})");
            }
        }

        // Check if user appears in admin query
        $this->newLine();
        $this->info("Admin Query Check:");

        foreach (['student', 'instructor', 'admin'] as $roleName) {
            $count = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
                ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                ->where('roles.name', $roleName)
                ->where('users.id', $user->id)
                ->select('users.*')
                ->distinct()
                ->count();

            $status = $count > 0 ? '✓ Found' : '✗ Not found';
            $this->line("  {$roleName}: {$status}");
        }

        // Check enrollments
        $enrollments = DB::table('enrollments')->where('user_id', $user->id)->count();
        $this->newLine();
        $this->info("Enrollments: {$enrollments}");
    }

    private function verifyAllUsers()
    {
        $totalUsers = User::count();
        $this->info("Total Users: {$totalUsers}");
        $this->newLine();

        // Count by role
        $studentRole = Role::where('name', 'student')->first();
        $instructorRole = Role::where('name', 'instructor')->first();
        $adminRole = Role::where('name', 'admin')->first();

        if (!$studentRole || !$instructorRole || !$adminRole) {
            $this->error('Missing required roles in database!');
            return;
        }

        // Count using the same query as admin panel
        $studentCount = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'student')
            ->select('users.*')
            ->distinct()
            ->count();

        $instructorCount = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'instructor')
            ->select('users.*')
            ->distinct()
            ->count();

        $adminCount = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'admin')
            ->select('users.*')
            ->distinct()
            ->count();

        $this->table(
            ['Role', 'Count', 'Query Type'],
            [
                ['Students', $studentCount, 'Admin Panel Query'],
                ['Instructors', $instructorCount, 'Admin Panel Query'],
                ['Admins', $adminCount, 'Admin Panel Query'],
            ]
        );

        // List all students
        $this->newLine();
        $this->info('All Students (using admin panel query):');

        // Get distinct user IDs first
        $studentIds = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'student')
            ->select('users.id')
            ->distinct()
            ->pluck('users.id')
            ->unique();

        $students = User::whereIn('id', $studentIds)
            ->orderBy('created_at', 'desc')
            ->get();

        $studentData = $students->map(function($student) {
            return [
                $student->id,
                $student->first_name . ' ' . $student->last_name,
                $student->email,
                $student->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        $this->table(
            ['ID', 'Name', 'Email', 'Status'],
            $studentData
        );

        // Check for users without roles
        $usersWithoutRoles = User::whereDoesntHave('roles')->get();
        if ($usersWithoutRoles->isNotEmpty()) {
            $this->newLine();
            $this->warn('Users without roles found:');
            foreach ($usersWithoutRoles as $user) {
                $this->line("  - {$user->email}");
            }
        }
    }
}
