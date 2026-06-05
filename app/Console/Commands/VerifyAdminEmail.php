<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class VerifyAdminEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:verify-email {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify email for admin users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');

        if ($email) {
            // Verify specific email
            $user = User::where('email', $email)->first();

            if (!$user) {
                $this->error("User with email {$email} not found!");
                return Command::FAILURE;
            }

            if ($user->email_verified_at) {
                $this->info("✅ Email {$email} is already verified at: {$user->email_verified_at}");
            } else {
                $user->email_verified_at = now();
                $user->save();
                $this->info("✅ Email {$email} has been verified!");
            }

            return Command::SUCCESS;
        }

        // Check all admin users
        $this->info('Checking admin users email verification status...');

        $admins = User::whereHas('roles', function($q) {
            $q->where('name', 'admin');
        })->get();

        if ($admins->isEmpty()) {
            $this->warn('No admin users found!');
            return Command::FAILURE;
        }

        $this->table(
            ['ID', 'Email', 'Name', 'Verified'],
            $admins->map(function($admin) {
                return [
                    $admin->id,
                    $admin->email,
                    $admin->first_name . ' ' . $admin->last_name,
                    $admin->email_verified_at ? '✅ Yes' : '❌ No'
                ];
            })
        );

        // Verify all unverified admins
        $unverifiedCount = 0;
        foreach ($admins as $admin) {
            if (!$admin->email_verified_at) {
                $admin->email_verified_at = now();
                $admin->save();
                $unverifiedCount++;
                $this->info("✅ Verified: {$admin->email}");
            }
        }

        if ($unverifiedCount > 0) {
            $this->newLine();
            $this->info("Verified {$unverifiedCount} admin email(s)!");
        } else {
            $this->info("All admin emails are already verified!");
        }

        return Command::SUCCESS;
    }
}
