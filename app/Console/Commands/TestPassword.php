<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestPassword extends Command
{
    protected $signature = 'test:password {email} {password}';
    protected $description = 'Test user password';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found!");
            return;
        }

        if (Hash::check($password, $user->password)) {
            $this->info('✅ Password is correct!');
        } else {
            $this->error('❌ Password is incorrect!');
            $this->info('Testing common passwords...');

            $commonPasswords = ['password123', 'password', 'admin123', 'admin', '123456'];
            foreach ($commonPasswords as $testPass) {
                if (Hash::check($testPass, $user->password)) {
                    $this->info("✅ Correct password is: {$testPass}");
                    return;
                }
            }

            $this->error('None of the common passwords work.');
        }
    }
}