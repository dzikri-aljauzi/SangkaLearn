<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CheckUser extends Command
{
    protected $signature = 'check:user {email}';
    protected $description = 'Check user details and password';

    public function handle()
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->with('roles')->first();

        if (!$user) {
            $this->error("User with email {$email} not found!");
            return;
        }

        $this->info("User Details:");
        $this->info("Email: " . $user->email);
        $this->info("Name: " . $user->first_name . " " . $user->last_name);
        $this->info("Active: " . ($user->is_active ? 'Yes' : 'No'));
        $this->info("Email verified: " . ($user->email_verified_at ? 'Yes (' . $user->email_verified_at . ')' : 'No'));
        $this->info("Roles: " . $user->roles->pluck('name')->join(', '));
        $this->info("Created: " . $user->created_at);

        // Test password
        if ($this->confirm('Test password?')) {
            $password = $this->secret('Enter password to test:');

            if (Hash::check($password, $user->password)) {
                $this->info('✅ Password is correct!');
            } else {
                $this->error('❌ Password is incorrect!');
            }
        }
    }
}