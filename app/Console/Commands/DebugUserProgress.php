<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Certificate;
use Illuminate\Console\Command;

class DebugUserProgress extends Command
{
    protected $signature = 'debug:user {email}';
    protected $description = 'Debug user progress and enrollment data';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User not found: {$email}");
            return 1;
        }

        $this->info("=== User Data ===");
        $this->info("ID: {$user->id}");
        $this->info("Name: {$user->name}");
        $this->info("Email: {$user->email}");
        $this->info("Current Streak: " . ($user->current_streak ?? 0));
        $this->info("Longest Streak: " . ($user->longest_streak ?? 0));
        $this->info("Last Login Date: " . ($user->last_login_date ?? 'Never'));

        $this->newLine();
        $this->info("=== Enrollments ===");
        $enrollments = $user->enrollments()->with('course')->get();
        $this->info("Total Enrollments: " . $enrollments->count());
        $this->info("Completed: " . $enrollments->where('status', 'completed')->count());

        $this->newLine();
        foreach ($enrollments as $enrollment) {
            $this->line("Course: {$enrollment->course->title}");
            $this->line("  Progress: {$enrollment->progress_percentage}%");
            $this->line("  Status: {$enrollment->status}");
            $this->line("  Completed At: " . ($enrollment->completed_at ?? 'Not completed'));
        }

        $this->newLine();
        $this->info("=== Certificates ===");
        $certificates = Certificate::where('user_id', $user->id)->get();
        $this->info("Total Certificates: " . $certificates->count());

        return 0;
    }
}
