<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class SyncUserRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:sync-roles {--fix-missing : Assign default student role to users without roles}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize user roles and fix any missing role assignments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting user roles synchronization...');
        $this->newLine();

        // Get all users
        $users = User::with('roles')->get();
        $this->info("Found {$users->count()} users in database");
        $this->newLine();

        // Get all available roles
        $studentRole = Role::where('name', 'student')->first();
        $instructorRole = Role::where('name', 'instructor')->first();
        $adminRole = Role::where('name', 'admin')->first();

        if (!$studentRole || !$instructorRole || !$adminRole) {
            $this->error('Required roles not found in database!');
            $this->info('Creating missing roles...');

            if (!$studentRole) {
                $studentRole = Role::create(['name' => 'student', 'description' => 'Student role']);
                $this->info('Created student role');
            }
            if (!$instructorRole) {
                $instructorRole = Role::create(['name' => 'instructor', 'description' => 'Instructor role']);
                $this->info('Created instructor role');
            }
            if (!$adminRole) {
                $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator role']);
                $this->info('Created admin role');
            }
            $this->newLine();
        }

        $stats = [
            'total_users' => 0,
            'users_with_roles' => 0,
            'users_without_roles' => 0,
            'fixed' => 0,
            'students' => 0,
            'instructors' => 0,
            'admins' => 0,
        ];

        $usersWithoutRoles = [];

        foreach ($users as $user) {
            $stats['total_users']++;

            if ($user->roles->isEmpty()) {
                $stats['users_without_roles']++;
                $usersWithoutRoles[] = [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                ];

                // Assign default student role if --fix-missing flag is set
                if ($this->option('fix-missing')) {
                    // Determine role based on email pattern
                    $roleToAssign = $studentRole;

                    if (str_contains($user->email, 'admin@')) {
                        $roleToAssign = $adminRole;
                    } elseif (str_contains($user->email, 'instructor@')) {
                        $roleToAssign = $instructorRole;
                    }

                    // Assign role
                    DB::table('user_roles')->insert([
                        'user_id' => $user->id,
                        'role_id' => $roleToAssign->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $stats['fixed']++;
                    $this->info("✓ Assigned {$roleToAssign->name} role to: {$user->email}");
                }
            } else {
                $stats['users_with_roles']++;

                // Count by role type
                $roleNames = $user->roles->pluck('name')->toArray();
                if (in_array('student', $roleNames)) $stats['students']++;
                if (in_array('instructor', $roleNames)) $stats['instructors']++;
                if (in_array('admin', $roleNames)) $stats['admins']++;
            }
        }

        $this->newLine();
        $this->info('=== Synchronization Results ===');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Users', $stats['total_users']],
                ['Users with Roles', $stats['users_with_roles']],
                ['Users without Roles', $stats['users_without_roles']],
                ['Fixed (Assigned Roles)', $stats['fixed']],
                ['Students', $stats['students']],
                ['Instructors', $stats['instructors']],
                ['Admins', $stats['admins']],
            ]
        );

        if (!empty($usersWithoutRoles) && !$this->option('fix-missing')) {
            $this->newLine();
            $this->warn('Users without roles found:');
            $this->table(
                ['ID', 'Name', 'Email'],
                $usersWithoutRoles
            );
            $this->newLine();
            $this->info('Run with --fix-missing flag to automatically assign roles to these users.');
            $this->info('Example: php artisan users:sync-roles --fix-missing');
        }

        $this->newLine();
        $this->info('Synchronization completed!');

        return Command::SUCCESS;
    }
}
